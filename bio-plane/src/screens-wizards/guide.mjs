/* screens-wizards R2–R7, R9: the runner, the wizard guide docked beside any screen (interface-shell R31; DEC-120 (2),
   DEC-139 (4), DEC-140, DEC-148). It says each step's what and why, opens the step's screen, rings the control the step
   names and never presses it, sends no act on the member's behalf and fills a field only with a labelled draft (R4).
   It reports use only through `wizardprogress`'s unattributed tally (start, each step reached, finish; stopping sends
   nothing), keeps a running wizard's place in the page's memory only (`view.ui`), and keeps on the device nothing but
   the note that a member finished the welcome or the first question there (R7), under the key
   `bio-wizard-finished:<member>:<script id>` (K3143), which is never sent (R9).

   The contract with the shell (J2, J3; INTERFACE-SHELL's R31): one guide instance for the page's life, `view = {ui, me,
   reachable, screen, subject}`; `render` draws the dock's panel ("" when nothing runs), `marks` the wizard marks at the
   top of each working screen; `start` is what `cs.wizard(script, version, o)` calls; `entered` follows each route once
   the screen's reads have settled; `pressed` hears each act the member presses (its op and screen only); `ring` answers
   Alt+Shift+W; `control` answers the guide's own controls (`data-guide`). Shared steps live in `parts`, handed back as
   `view.parts`. Every function is self-contained (interface-shell R21). */

/* R7: the required "Welcome a new member" and "Your first question" (wizard-scripts R22's library ids). */
export const WELCOME = "WIZ-7db08189cc0e58c3";
export const FIRST_QUESTION = "WIZ-86b7f4007e3b0e3c";
/* R7: the welcome continues at its first step on a working screen, step 3 ("This is your group's home"), its two `join`
   steps counted done by the enrolment. */
export const WELCOME_AT = 3;

/* The ops the guide reads and counts through `cs.call` (J2 (1)): the marks, a script's steps, the tally, and each op a
   `{machine: <op>}` draft names (wizard-scripts R13's `machineDrafts`, as `plane`'s `MACHINE_DRAFTS` registers them). */
export const GUIDE_OPS = Object.freeze(["wizardsat", "wizardread", "startfrom", "wizardprogress", "wizarddraft",
  "writinghelp", "whatchangedpropose", "escalationreasondraft", "groupdescriptiondraft"]);

export const PARTS = {
  ids() { return { welcome: "WIZ-7db08189cc0e58c3", first: "WIZ-86b7f4007e3b0e3c", welcomeAt: 3 }; },

  /* a script's run: its steps as `wizardsat` handed them, else read by `wizardread` (the latest approved by default) */
  async load(cs, view, script, version) {
    const given = script && typeof script === "object" ? script : null;
    const id = given ? given.id : script;
    const ver = version || (given && given.version) || null;
    if (given && Array.isArray(given.steps) && given.steps.length && ver)
      return { id, version: ver, name: given.name || id, steps: given.steps, private: given.draft === true };
    const a = await cs.call("wizardread", { query: ver ? { script: id, version: ver } : { script: id } });
    const r = a && a.ok !== false ? (a.result !== undefined ? a.result : a) : null;
    if (!r || !r.version || !Array.isArray(r.version.steps) || !r.version.steps.length)
      return { failed: (a && (a.translation || a.code)) || "" };
    return { id: (r.script && r.script.id) || id, version: r.version.id, name: (r.script && r.script.name) || id, steps: r.version.steps,
      private: r.version.state === "draft" };
  },

  /* R6: the one report, unattributed; a member's own draft runs privately and counts nothing */
  count(cs, view, run, event, step) {
    if (!run || run.private) return null;
    const body = { script: run.id, version: run.version, event };
    if (event === "step") body.step = step;
    return cs.call("wizardprogress", { body });
  },

  /* a word by key, or null when the page holds none (the shell draws an unknown key as the key itself) */
  said(cs, key, fills) { const t = cs.w(key, fills); return t === cs.esc(key) ? null : t; },

  /* R2: a Civicsmith script's name and words by their keys, a group's as recorded */
  nameOf(cs, view, id, name) { return view.parts.said(cs, "wizard." + id + ".name") || cs.esc(name || ""); },
  stepWords(cs, view, run, i) {
    const st = run.steps[i] || {};
    const k = "wizard." + run.id + ".step" + (i + 1);
    return { what: view.parts.said(cs, k + ".what") || cs.esc(st.what || ""), why: view.parts.said(cs, k + ".why") || cs.esc(st.why || "") };
  },

  /* R2, R5: arrive at step `i`: count it (once per run), take a side trip it names, open its screen, ring its act */
  async arrive(cs, view, i, count) {
    const ui = view.ui, P = view.parts;
    const run = ui.run;
    if (!run || !run.steps[i]) return;
    run.i = i;
    ui.absent = false;
    ui.draft = null;
    if (count && !run.reached[i]) { run.reached[i] = true; P.count(cs, view, run, "step", i + 1); }
    const step = run.steps[i];
    if (step.via && !run.tripped[i]) {
      const trip = await P.load(cs, view, step.via, null);
      if (!trip.failed) {
        Object.assign(trip, { i: 0, reached: {}, tripped: {}, placed: {}, parent: run });
        run.tripped[i] = true;
        ui.run = trip;
        P.count(cs, view, trip, "start");
        return P.arrive(cs, view, 0, true);
      }
    }
    P.open(cs, view);
  },

  /* open the current step's screen; on it already, ring at once (`entered` rings after a route) */
  open(cs, view) {
    const ui = view.ui, run = ui.run;
    const step = run && run.steps[run.i];
    if (!step) return;
    if (step.screen && step.screen !== view.screen) {
      cs.set("run", run);
      const subjects = ui.subjects || {};
      cs.go(step.screen, Object.hasOwn(subjects, step.screen) ? subjects[step.screen] : null);
      return;
    }
    view.parts.ringStep(cs, view);
  },

  /* R2: ring the step's control once (`cs.ring`); a step whose act is not drawn says so and offers Next; R4: a text or
     template draft is placed in the act's field when the control is found */
  ringStep(cs, view) {
    const ui = view.ui, P = view.parts, run = ui.run;
    const step = run && run.steps[run.i];
    if (!step) return;
    if (!step.act) { ui.absent = false; cs.set("run", run); return; }
    const found = typeof cs.ring === "function" ? cs.ring(step.act) === true : false;
    ui.absent = !found;
    const d = step.draft && typeof step.draft === "object" ? step.draft : null;
    if (found && d && !run.placed[run.i]) {
      if (typeof d.text === "string") { run.placed[run.i] = true; P.place(cs, view, d.text, "screen.guide.draft.text", {}, false); }
      else if (d.template !== undefined) { run.placed[run.i] = true; ui.draft = { i: run.i, template: true }; }
    }
    cs.set("run", run);
  },

  /* R4: a labelled draft in the field of the step's act (`cs.fill`), never submitted; with no field, shown in the dock */
  place(cs, view, text, labelKey, fills, untested) {
    const ui = view.ui, run = ui.run;
    const step = run.steps[run.i];
    const field = typeof cs.fieldOf === "function" ? cs.fieldOf(step.act) : null;
    const label = cs.w(labelKey, fills);
    if (field && typeof cs.fill === "function") cs.fill(field, text, { label });
    ui.draft = { i: run.i, text, label, placed: !!(field && typeof cs.fill === "function"), untested: !!untested };
  },

  /* R2, R5, R6: the last step's Next: finish (counted); a side trip returns to the step it left */
  finish(cs, view) {
    const ui = view.ui, P = view.parts, run = ui.run, me = view.me || {}, ids = P.ids();
    if (!run) return;
    P.count(cs, view, run, "finish");
    if ((run.id === ids.welcome || run.id === ids.first) && typeof cs.keep === "function") cs.keep("bio-wizard-finished:" + (me.member || "") + ":" + run.id, "1");
    if (run.parent) { ui.run = run.parent; ui.notice = null; return P.arrive(cs, view, ui.run.i, false); }
    ui.run = null;
    ui.notice = { finished: run.id, name: run.name };
    cs.set("run", null);
  },

  /* R2, R5, R6: Stop sends nothing; a side trip stopped returns to the step it left */
  stop(cs, view) {
    const ui = view.ui, run = ui.run;
    if (run && run.parent) { ui.run = run.parent; return view.parts.arrive(cs, view, ui.run.i, false); }
    ui.run = null;
    ui.notice = null;
    ui.draft = null;
    cs.set("run", null);
  },

  /* R2: start a script at step `at` (1-based); `counted` when its start and that step were already counted (R7) */
  async begin(cs, view, script, version, at, counted) {
    const ui = view.ui, P = view.parts;
    ui.rec = null;
    ui.notice = null;
    ui.run = { loading: true, steps: [] };
    cs.set("run", ui.run);
    const run = await P.load(cs, view, script, version);
    if (run.failed !== undefined) { ui.run = null; ui.notice = { failed: run.failed }; cs.set("run", null); return; }
    Object.assign(run, { i: 0, reached: {}, tripped: {}, placed: {}, parent: null });
    const i = Math.min(Math.max(1, Number(at) || 1), run.steps.length) - 1;
    ui.run = run;
    if (counted) run.reached[i] = true; else P.count(cs, view, run, "start");
    P.doors(cs, view, run);
    return P.arrive(cs, view, i, true);
  },

  /* R7: the welcome after `join`: its two `join` steps counted done by the enrolment, once, now that the session exists */
  async joined(cs, view) {
    const ui = view.ui, P = view.parts, ids = P.ids();
    ui.joined = true;
    ui.offerHidden = false;
    if (!ui.joinedCount) {
      const run = await P.load(cs, view, ids.welcome, null);
      if (run.failed === undefined && !ui.joinedCount) {
        ui.joinedCount = run.version;
        P.count(cs, view, run, "start");
        P.count(cs, view, run, "step", ids.welcomeAt);
      }
    }
    cs.set("joined", true);
  },

  /* R10: `startfrom` once when a run starts: the ids of the scripts any door names; a read that fails leaves none */
  async doors(cs, view, run) {
    const ui = view.ui;
    const a = await cs.call("startfrom", {});
    const r = a && a.ok !== false ? (a.result !== undefined ? a.result : a) : null;
    const ids = new Set();
    if (r && Array.isArray(r.doors)) for (const d of r.doors) if (d && Array.isArray(d.scripts)) for (const id of d.scripts) ids.add(typeof id === "object" && id ? id.id : id);
    if (ui.run === run || (ui.run && ui.run.parent === run)) { run.doorScript = ids.has(run.id); cs.set("run", ui.run); }
  },

  /* R2: the scripts that start on `screen` (`wizardsat`), the member's own drafts among them */
  async marksFor(cs, view, screen) {
    const ui = view.ui;
    if (!screen) return;
    const a = await cs.call("wizardsat", { query: { screen } });
    const r = a && a.ok !== false ? (a.result !== undefined ? a.result : a) : null;
    ui.marks = { screen, scripts: r && Array.isArray(r.scripts) ? r.scripts : [] };
    if (view.screen === screen) cs.set("marks", ui.marks);
  },

  /* R4: "Draft it": a `{machine: <op>}` draft, asked at the member's press, only while the assistant is reachable */
  async machine(cs, view) {
    const ui = view.ui, P = view.parts, run = ui.run, me = view.me || {};
    const step = run && run.steps[run.i];
    const d = step && step.draft && typeof step.draft === "object" ? step.draft : null;
    if (!d || typeof d.machine !== "string" || !step.act || !view.reachable) return;
    const field = typeof cs.fieldOf === "function" ? cs.fieldOf(step.act) : null;
    const told = field ? String(cs.value(field) || "") : "";
    ui.draft = { i: run.i, asking: true };
    cs.set("run", run);
    const body = { op: step.act, field: field || "text", told };
    if (view.subject !== null && view.subject !== undefined) { body.case = view.subject; body.subject = view.subject; }
    const a = await cs.call(d.machine, { body });
    if (ui.run !== run || run.i !== (ui.draft && ui.draft.i)) return;
    const r = a && a.ok !== false ? (a.result !== undefined ? a.result : a) : null;
    const text = r && (typeof r.text === "string" ? r.text : typeof r.draft === "string" ? r.draft : typeof r.statement === "string" ? r.statement : null);
    if (!r || r.ok === false || text === null) { ui.draft = { i: run.i, refused: (a && (a.translation || a.code)) || "" }; cs.set("run", run); return; }
    const asked = r.label && r.label.asked_by ? String(r.label.asked_by).replace(/^member:/, "") : me.member;
    const handle = asked === me.member && me.handle ? me.handle : asked || me.handle || "";
    P.place(cs, view, text, "screen.guide.draft.machine", { handle }, !!(r.untested || (r.label && r.label.untested)));
    cs.set("run", run);
  },
};

export const guide = {
  id: "guide",
  ops: GUIDE_OPS,

  /* R2, R7: what `cs.wizard(script, version, o)` calls, as `{script, version, ...o}`: a run, a recording (R3), or the welcome after `join` (R7) */
  start(cs, view, o) {
    const ui = view.ui, P = view.parts, opt = o || {};
    const script = opt.script === undefined ? null : opt.script, version = opt.version || null;
    if (opt.record) {
      ui.run = null;
      ui.notice = null;
      ui.rec = { project: opt.record.project || null, pairs: [] };
      cs.set("rec", ui.rec);
      return null;
    }
    if (opt.joined) return P.joined(cs, view);
    const ids = P.ids();
    const id = script && typeof script === "object" ? script.id : script;
    const counted = id === ids.welcome && !!ui.joinedCount && Number(opt.at) === ids.welcomeAt && (!version || version === ui.joinedCount);
    return P.begin(cs, view, script, version, opt.at || 1, counted);
  },

  /* after each route, once its reads have settled: the screen's marks, and the running step's ring */
  entered(cs, view, route) {
    const ui = view.ui, P = view.parts;
    const r = route || {};
    ui.subjects = ui.subjects || {};
    if (ui.marks && ui.marks.screen !== r.screen) ui.marksOpen = false;
    if (r.screen) ui.subjects[r.screen] = r.subject === undefined ? null : r.subject;
    P.marksFor(cs, view, r.screen);
    const run = ui.run;
    const step = run && run.steps && run.steps[run.i];
    if (step && step.screen === r.screen) P.ringStep(cs, view);
  },

  /* R3: while recording, each act the member presses is added as `{screen, act}`, never a value */
  pressed(cs, view, p) {
    const ui = view.ui;
    if (!ui.rec || !p || typeof p.op !== "string" || typeof p.screen !== "string") return;
    ui.rec.pairs.push({ screen: p.screen, act: p.op });
    cs.set("rec", ui.rec);
  },

  /* R2: Alt+Shift+W rings the step's control again, as often as the member asks */
  ring(cs, view) { if (view.ui.run && !view.ui.run.loading) view.parts.ringStep(cs, view); },

  /* the guide's own controls (`data-guide`), none of which sends an act */
  control(cs, view, what, d) {
    const ui = view.ui, P = view.parts, run = ui.run, ids = P.ids();
    const data = d || {};
    if (what === "next" && run && !run.loading) return run.i + 1 < run.steps.length ? P.arrive(cs, view, run.i + 1, true) : P.finish(cs, view);
    if (what === "back" && run && !run.loading && run.i > 0) return P.arrive(cs, view, run.i - 1, false);
    if (what === "stop") return P.stop(cs, view);
    if (what === "elsewhere") return cs.go("elsewhere", null);
    if (what === "chip") { ui.marksOpen = !ui.marksOpen; return cs.set("marksOpen", ui.marksOpen); }
    if (what === "where" && run && !run.loading) return P.ringStep(cs, view);
    if (what === "draftit") return P.machine(cs, view);
    if (what === "start") return P.begin(cs, view, data.script, data.version || null, Number(data.at) || 1,
      data.script === ids.welcome && !!ui.joinedCount && Number(data.at) === ids.welcomeAt);
    if (what === "notnow") { ui.offerHidden = true; return cs.set("offer", false); }
    if (what === "unrecord" && ui.rec) { ui.rec.pairs.splice(Number(data.i), 1); return cs.set("rec", ui.rec); }
    if (what === "recstop") { ui.rec = null; return cs.set("rec", null); }
    if (what === "close") { ui.notice = null; return cs.set("notice", null); }
    return null;
  },

  /* R2, R3, R4, R5: the dock's panel */
  render(cs, view) {
    const W = cs.w, E = cs.esc, G = "screen.guide.", P = view.parts;
    const ui = view.ui || {}, run = ui.run;
    const btn = (what, label, tone, extra) => `<button type="button" class="cs-btn"${tone ? ` data-tone="${tone}"` : ""} data-guide="${what}"${extra || ""}>${label}</button>`;
    const stopLine = `<p class="mk-note">${W("guide.stopping")}</p>`;
    if (ui.rec) {
      const pairs = ui.rec.pairs.map((p, i) => `<li>${W(G + "recording.pair", { i: String(i + 1), screen: { html: P.said(cs, "screen." + p.screen + ".name") || E(p.screen) }, act: { html: P.said(cs, "act." + p.act + ".label." + p.screen) || E(p.act) } })} `
        + btn("unrecord", W(G + "recording.remove", { i: String(i + 1) }), "quiet", ` data-i="${i}"`) + "</li>").join("");
      return `<div class="cs-wizard" data-guide-state="recording"><span class="step">${W(G + "recording")}</span><p>${W(G + "recording.intro")}</p>`
        + (pairs ? `<ol class="mk-list">${pairs}</ol>` : `<p class="cs-state" data-state="empty">${W(G + "recording.empty")}</p>`)
        + cs.field("wz-rec-name", G + "recording.name")
        + `<span class="nav">${cs.act("wizarddraft", { label: G + "recording.save" })}${btn("recstop", W(G + "recording.stop"), "quiet")}</span></div>`;
    }
    if (run && run.loading) return `<div class="cs-wizard"><p class="cs-state" data-state="loading" role="status">${W(G + "loading")}</p></div>`;
    if (run) {
      const n = run.steps.length, i = run.i, step = run.steps[i] || {};
      const words = P.stepWords(cs, view, run, i);
      const d = step.draft && typeof step.draft === "object" ? step.draft : null;
      const draft = ui.draft && ui.draft.i === i ? ui.draft : null;
      const out = [`<div class="cs-wizard" data-guide-state="running">`,
        `<span class="step">${P.nameOf(cs, view, run.id, run.name)} · ${W("guide.step", { i: String(i + 1), n: String(n) })}</span>`,
        `<span class="what">${words.what}</span>`, words.why ? `<span class="why">${words.why}</span>` : ""];
      if (run.doorScript) out.push(`<p class="mk-note" data-guide-elsewhere>${W("wizard.guide.elsewhere", { link: { html: `<button type="button" class="cs-ref" data-guide="elsewhere" data-level="2" data-tip="${E("<b>" + W("screen.elsewhere.name") + "</b><span class=\"more\">" + W("screen.elsewhere.purpose") + "</span>")}">${W("wizard.guide.elsewhere_link")}</button>` } })}</p>`);
      if (run.parent) out.push(`<p class="mk-note" data-guide-trip>${W("guide.sidetrip", { wizard: { html: P.nameOf(cs, view, run.id, run.name) } })}</p>`);
      if (d) out.push(`<p class="mk-note">${W("guide.draft")}</p>`);
      if (ui.absent && step.act) out.push(`<p class="mk-note" data-guide-absent role="status">${W(G + "absent")}</p>`);
      if (d && typeof d.machine === "string" && view.reachable && step.act && !(draft && draft.text !== undefined))
        out.push(`<span class="nav">${btn("draftit", W(G + "draftit"), "", "")}</span>`);
      if (draft && draft.asking) out.push(`<p class="cs-state" data-state="loading" role="status">${W(G + "draft.asking")}</p>`);
      if (draft && draft.refused !== undefined) out.push(`<p class="cs-gap" data-gap="refused" role="alert">${W(G + "draft.refused", { reason: draft.refused || "" })}</p>`);
      if (draft && draft.template) out.push(`<p class="mk-note">${W(G + "draft.template")} · ${W(G + "draft.template.held")}</p>`);
      if (draft && draft.text !== undefined) {
        out.push(`<p class="cs-draftlabel" data-guide-draft>${draft.label}</p>`);
        if (draft.untested) out.push(`<p class="mk-note">${W("ai.label.untested")}</p>`);
        out.push(draft.placed ? `<p class="mk-note">${W(G + "draft.placed")}</p>` : `<p class="mk-note">${W(G + "draft.nofield")}</p><blockquote class="cs-draft">${E(draft.text)}</blockquote>`);
      }
      out.push(`<span class="nav">${i > 0 ? btn("back", W(G + "back"), "quiet") : ""}${btn("next", W(i + 1 < n ? G + "next" : G + "finish"))}</span>`);
      if (step.act) out.push(`<span class="nav">${btn("where", W("guide.showwhere"), "quiet", ` aria-keyshortcuts="Alt+Shift+W"`)}<span class="cs-kbd">${W(G + "key")}</span></span>`);
      out.push(stopLine, `<span class="nav">${btn("stop", W(G + "stop"), "quiet", ` data-level="2" data-tip="${E(W(G + "stop.does"))}"`)}</span></div>`);
      return out.join("");
    }
    if (ui.notice && ui.notice.failed !== undefined)
      return `<div class="cs-wizard"><p class="cs-state" data-state="failed" role="alert">${W(G + "failed", { reason: ui.notice.failed || "" })}</p>${btn("close", W(G + "close"), "quiet")}</div>`;
    if (ui.notice && ui.notice.finished)
      return `<div class="cs-wizard"><p role="status">${W(G + "finished", { name: { html: P.nameOf(cs, view, ui.notice.finished, ui.notice.name) } })}</p>${btn("close", W(G + "close"), "quiet")}</div>`;
    if (ui.notice && ui.notice.saved)
      return `<div class="cs-wizard"><p role="status">${W(G + "recording.saved")}</p>${btn("close", W(G + "close"), "quiet")}</div>`;
    return "";
  },

  /* R2, R7: each screen's wizard marks; on Home, the welcome and the first question first, until finished on this device */
  marks(cs, view) {
    const W = cs.w, E = cs.esc, G = "screen.guide.", P = view.parts, ids = P.ids();
    const ui = view.ui || {}, me = view.me || {};
    const screen = view.screen;
    const listed = ui.marks && ui.marks.screen === screen ? ui.marks.scripts : [];
    const kept = (id) => typeof cs.kept === "function" && cs.kept("bio-wizard-finished:" + (me.member || "") + ":" + id) === "1";
    // R11: a script is counted only if every act its steps name is one the shell's gate would draw for this viewer
    const walkable = (s) => !Array.isArray(s.steps) || s.steps.every((st) => !st || !st.act || typeof cs.can !== "function" || cs.can(st.act));
    const items = [];
    if (screen === "home") {
      if (!kept(ids.welcome)) items.push({ id: ids.welcome, at: ids.welcomeAt, name: P.nameOf(cs, view, ids.welcome, ""), required: true, cont: true });
      if (!kept(ids.first)) items.push({ id: ids.first, at: 1, name: P.nameOf(cs, view, ids.first, "") });
    }
    for (const s of listed) {
      if (!s || items.some((x) => x.id === s.id) || !walkable(s)) continue;
      items.push({ id: s.id, version: s.version, at: 1, name: P.nameOf(cs, view, s.id, s.name), finished: s.finished, draft: s.draft === true, required: s.required === true });
    }
    // Home's welcome offer (R7) keeps its own band, which is not a chip
    const offer = screen === "home" && ui.joined && !ui.offerHidden && !kept(ids.welcome)
      ? `<div class="cs-reason" role="region" data-guide-offer><p>${W(G + "welcome")}</p><span class="mk-acts">`
        + `<button type="button" class="cs-btn" data-tone="primary" data-guide="start" data-script="${ids.welcome}" data-at="${ids.welcomeAt}">${W(G + "welcome.continue", { name: { html: P.nameOf(cs, view, ids.welcome, "") } })}</button>`
        + `<button type="button" class="cs-btn" data-tone="quiet" data-guide="notnow">${W(G + "notnow")}</button></span></div>`
      : "";
    if (!items.length) return offer;
    const head = items.length === 1 ? W("wizard.marks.chip.one") : W("wizard.marks.chip", { n: String(items.length) });
    const open = ui.marksOpen === true;
    const list = open ? "<ul class=\"mk-list\">" + items.map((x) => `<li><span>${x.name}</span> <button type="button" class="cs-btn" data-guide="start" data-script="${E(x.id)}"`
      + (x.version ? ` data-version="${E(x.version)}"` : "") + ` data-at="${x.at}">${W(x.cont ? G + "welcome.continue" : G + "mark.start", { name: { html: x.name } })}</button>`
      + (x.required ? ` <span class="meta">${W("wizard.mark.recommended")}</span>` : "")
      + (x.draft ? ` <span class="meta">${W(G + "mark.draft")}</span>` : "")
      + (typeof x.finished === "number" && x.finished > 0 && !x.draft ? ` <span class="meta">${W(G + "mark.finished", { n: String(x.finished) })}</span>` : "") + "</li>").join("") + "</ul>" : "";
    return `${offer}<div data-guide-marks><button type="button" class="cs-wizmark" data-guide="chip" aria-expanded="${open}" data-level="2" data-tip="${E(W(G + "marks.means"))}">${head}</button>${list}</div>`;
  },

  acts: [
    /* R3: saving a recording sends `wizarddraft` with the recorded pairs and the name the member gives (her own words,
       interface-shell R11's `reasonField`); the pairs carry no value she typed */
    { op: "wizarddraft", reasonField: "name", rereads: [],
      send(view, el, cs) {
        const rec = view.ui.rec;
        if (!rec) return null;
        if (!rec.pairs.length) return { refuse: "screen.guide.recording.none" };
        const name = String(cs.value("wz-rec-name") || "").trim();
        if (!name) return { refuse: "screen.guide.recording.noname" };
        return { body: { project: rec.project, name, recorded: rec.pairs.map((p) => ({ screen: p.screen, act: p.act })) } };
      },
      done(view, answer, cs) { view.ui.rec = null; view.ui.notice = { saved: true }; cs.set("rec", null); return { stay: true }; } },
  ],
};
