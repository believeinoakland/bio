/* screens-inquiry R105 (FR-28 entry 22; C48; DEC-374; `contradiction` R30-R36, R50-R54): the screen `contradiction`, "Two documents
 * in tension" (Projects › <project> › Two documents in tension; the registry's 7 acts), at `/app/contradiction/<candidate>`, or
 * `/app/contradiction/<candidate>/<project>` for a conflict the member sees half (the project is the party the notice came to).
 *
 * The drawing's six states, one at a time by what `contradictioncandidates` and `contradictionnotices` answer: (a) a conflict the
 * record holds, (b) a lead, (c) one taken up as a question, (d) a conflict with a record the member cannot see, (e) that conflict
 * once the projects are named to each other, (f) nothing proposed (the assistant is held), and, beyond the drawing, a closed
 * candidate (dismissed or resolved), drawn with both passages and no act. Both passages are the record's words verbatim; nothing
 * here edits either. A pair the member sees half is drawn with the one passage she may see and nothing of the other: its facts
 * and the pairing sentence are not read.
 *
 * The acts: `contradictionclarify` (they differ / one is wrong), `contradictiontakeup`, `contradictiondismiss`,
 * `contradictionresolve`, `contradictionoptin`, `contradictionrespond`, and `writinghelp` beside the fields she words herself,
 * never beside a reason. Each sends exactly the fields `contradiction` declares. The shell asks a Reasoned act's reason first
 * (R87): each act whose own field carries her words names it as its `reasonField` (`explanation` and `why` for clarify, which
 * both travel as `reason`; `question`; `reason` for dismiss, the reason she chose; `conclusion`; `text`), `contradictionoptin`'s
 * words being optional, the shell's own reason box asks (a shell mark, not a declared field). Every sentence is read by key (R44);
 * a design word `words.json` does not hold yet is listed in `GAP_WORDS` and drawn as its key until the design stream writes it.
 * Self-contained functions (interface-shell R21 (1)). */

import { COMMON } from "./common.mjs";

const S = "screen.contradiction.";

/** The design's words (mock-screens.js `SCR.contradiction`, DEC-374) that `words.json` holds no row for: the keys the generator's
 *  convention would give them. They are not named in `words` (the page serves the screen's own family by prefix once the row
 *  exists); until then the page draws the key. Reported to BOB (K3366). */
export const GAP_WORDS = Object.freeze(["first.passage", "second.passage", "they.differ.in", "time.or.occasion", "meaning", "precision",
  "what.shows.it", "the.first.passage", "the.second.passage", "optional.at.most.200.characters", "optional.at.most.500.characters",
  "dismiss.it", "anything.to.add", "ask.it.around", "taken.up", "conclude.it", "your.conclusion", "two.rules.conflict", "ask.for",
  "the.projects", "responses", "respond", "your.response", "share.with.the.other.projects", "my.cover.name", "my.email.address",
  "your.email.address", "send.my.response", "your.project.can.ask.to.resolve.it", "help.needed", "when.it.cannot.be.concluded"].map((k) => S + k));

/** The keys read from another screen's row (`words.json` holds one row for one English: DEC-179), the rest being this screen's. */
const BORROWED = Object.freeze(["screen.case-editor.scope.label", "project.start.title", "screen.calculation.question", "screen.security.cando.heading",
  "question.conclude.falsifier", "question.conclude.nofalsifier", "question.conclude.reading", "screen.settings.yours"]);

/** What render and the acts share (a part, served once as data). */
const K = Object.freeze({
  S,
  /* R32: the respects in which two sides may differ (`inquiry` R46), then what a resolution may add */
  COORDS: Object.freeze([["time_or_occasion", S + "time.or.occasion"], ["scope", "screen.case-editor.scope.label"], ["meaning", S + "meaning"],
    ["observer_or_method", S + "who.saw.it.or.how"], ["subject", "project.start.title"]]),
  RCOORDS: Object.freeze([["time_or_occasion", S + "time.or.occasion"], ["scope", "screen.case-editor.scope.label"], ["meaning", S + "meaning"],
    ["observer_or_method", S + "who.saw.it.or.how"], ["subject", "project.start.title"], ["precision", S + "precision"], ["opinion", S + "a.matter.of.opinion"]]),
  KINDS: Object.freeze([["dissolved", S + "they.do.not.really.conflict.they"], ["misquote", S + "one.misquotes.the.other"],
    ["transcription_or_reading_error", S + "one.was.misread.or.mistyped"], ["superseded_version", S + "one.is.a.version.that.was"],
    ["corrected", S + "one.is.simply.wrong"], ["double_speak_or_reversal", S + "someone.said.one.thing.and.then"],
    ["obligation_against_act", S + "a.rule.says.one.thing.and"], ["conflict_of_norms", S + "two.rules.conflict"], ["irreconcilable", S + "they.truly.conflict.and.nothing.settles"]]),
  CORRECTED: Object.freeze(["misquote", "transcription_or_reading_error", "superseded_version", "corrected"]),
  CANONS: Object.freeze([["higher_over_lower", S + "the.higher.rule.governs.the.lower"], ["later_over_earlier", S + "the.later.rule.governs.the.earlier"],
    ["specific_over_general", S + "the.specific.rule.governs.the.general"], ["harmonization", S + "they.can.be.read.together"], ["unreconciled", S + "they.are.not.reconciled"]]),
  DISMISS: Object.freeze([["same_fact_different_precision", S + "they.state.the.same.fact.at"], ["not_same_matter", S + "they.are.not.about.the.same"],
    ["real_conflict_not_pursued", S + "it.is.a.real.conflict.but"]]),
  SIDES: Object.freeze([["a", S + "the.first.passage"], ["b", S + "the.second.passage"]]),
  /* writing help: the act it words, and the field it fills */
  HELP: Object.freeze({ explanation: ["contradictionclarify", "cd-expl"], question: ["contradictiontakeup", "cd-q"], conclusion: ["contradictionresolve", "cd-concl"],
    response: ["contradictionrespond", "cd-resp"] }),
});

/** The subject: `<candidate>` or `<candidate>/<project>`. */
function parse(subject) {
  const s = String(subject == null ? "" : subject), i = s.indexOf("/");
  return i < 0 ? { candidate: s, project: "" } : { candidate: s.slice(0, i), project: s.slice(i + 1) };
}

/** A record's title as the read of its `bundle.md` states it; "" when none. */
function titleOf(read) {
  const text = read && read.state === "ok" && read.value && read.value["bundle.md"];
  const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  let t = m ? m[1].trim() : "";
  try { if (t.startsWith("\"")) t = JSON.parse(t); } catch { /* raw */ }
  return t;
}

/** The candidate she sees whole (R25), else the notice she is answered for the conflict she sees half (R50). */
function found(view) {
  const d = view.data || {}, c = view.parts.parse(view.subject).candidate;
  const whole = d.cand && d.cand.state === "ok" && d.cand.value && Array.isArray(d.cand.value.candidates) ? d.cand.value.candidates[0] || null : null;
  const half = d.notice && d.notice.state === "ok" && d.notice.value && Array.isArray(d.notice.value.notices)
    ? d.notice.value.notices.find((n) => n && n.candidate === c) || null : null;
  return { whole, half };
}

/** R105: the candidate (with the subject read only when she has no project to be answered a notice for) and, for a conflict she may
 *  see half, the notices of that project. */
function reads(view) {
  const p = view.parts.parse(view.subject);
  if (!p.candidate) return {};
  return { cand: { op: "contradictioncandidates", query: { candidate: p.candidate }, subject: !p.project,
                   empty: (v) => !v || !Array.isArray(v.candidates) || !v.candidates.length },
           ...(p.project ? { notice: { op: "contradictionnotices", query: { project: p.project } } } : {}) };
}

/** The path's project step: the project the pair rests on, by its title (R39). */
function place(view) {
  const f = view.parts.found(view), id = view.parts.parse(view.subject).project
    || (f.whole && f.whole.reach && f.whole.reach.projects && f.whole.reach.projects[0]) || (f.half && f.half.project) || "";
  const l = view.ui.later && view.ui.later.proj;
  return id ? { project: { id, title: l && l.state === "ok" ? view.parts.titleOf(l) : "" } } : {};
}

function render(cs, view) {
  const P = view.parts, K = P.K, S = K.S, W = cs.w, E = cs.esc, ui = view.ui, d = view.data || {};
  const { candidate, project: part } = P.parse(view.subject);
  const hold = (id, inner) => `<div data-cd="${id}">${inner}</div>`;
  const note = (...keys) => `<p class="mk-note">${keys.map((k) => W(k)).join(" ")}</p>`;
  const acts = (...b) => `<div class="mk-acts">${b.join("")}</div>`;
  if (!candidate)
    return hold("f", cs.title() + `<p class="mk-sub">${W(S + "pairs.of.passages.your.team.s")}</p>`
      + note(S + "nothing.has.been.proposed.to.you", cs.reachable ? S + "finding.passages.that.may.conflict.is" : S + "finding.passages.that.may.conflict.is.2")
      + note(S + "until.it.is.available.no.document", S + "a.pair.that.was.proposed.before"));
  const { whole, half } = P.found(view);
  const pid = part || (whole && whole.reach && whole.reach.projects && whole.reach.projects[0]) || (half && half.project) || "";
  const pread = pid ? P.later(cs, ui, "proj", "image", { id: pid }) : null;
  const ptitle = pread ? P.titleOf(pread) : "";
  const undetermined = () => P.plain(cs, "state.undetermined");
  if (!whole && !half) {
    const pending = [d.cand, d.notice].filter(Boolean).find((r) => r.state === "loading" || r.state === "failed");
    return pending ? cs.title() + cs.state(pending, () => "") : cs.title() + cs.state({ state: "empty" }, () => "");
  }
  /* one passage as written, a reference opening its document (or the question a claim rests on), never an id as a title */
  const passage = (which, side, head) => {
    const src = (side && side.source) || {};
    let ref = "";
    if (src.inquiry) ref = cs.ref("question", src.inquiry, src.title || undetermined());
    else if (src.bundle) ref = cs.ref("document", src.bundle, P.titleOf(P.later(cs, ui, "doc:" + src.bundle, "image", { id: src.bundle })) || undetermined());
    return `<div class="mk-ablock" data-side="${which}"><div class="h"><b>${W(head)}</b></div>${ref ? `<p class="mk-data">${ref}</p>` : ""}`
      + (side && side.text ? `<p class="rec mk-data">“${E(side.text)}”</p>` : "") + "</div>";
  };
  const fold = (summary, rows) => `<details class="mk-details"><summary>${W(summary)}</summary>`
    + rows.map((r) => `<p class="cs-gap" data-gap="refused">${r.map((k) => W(k)).join(" ")}</p>`).join("") + "</details>";
  const help = (field) => (cs.reachable ? acts(cs.act("writinghelp", { data: { field, for: K.HELP[field][1] } })) : "");
  const drafted = (field) => (ui.draft && ui.draft.field === field
    ? { draft: "draft.machine.label" } : {});
  const draftNote = (field) => (ui.draft && ui.draft.field === field && ui.draft.untested ? `<p class="mk-small" data-label="untested">${W("ai.label.untested.writinghelp")}</p>` : "");
  const sides = (heads) => `<div class="mk-ablocks">${passage("a", whole.a, heads[0])}${passage("b", whole.b, heads[1])}</div>`;
  const out = [];

  /* ---------- (d), (e): a conflict with a record she cannot see ---------- */
  if (!whole) {
    const n = half;
    const revealed = n.revealed === true;
    out.push(cs.title(P.plain(cs, revealed ? S + "a.conflict.between.two.projects" : S + "something.your.project.rests.on.is")) + `<p class="mk-sub">${revealed ? W(S + "every.project.that.holds.a.side") + " " + W(S + "nothing.else.of.them.is.shown")
      : W(S + "it.conflicts.with.a.record.you") + " " + W(S + "neither.that.record.nor.who.holds")}</p>`);
    out.push(`<div class="mk-ablocks"><div class="mk-ablock" data-side="a"><div class="h"><b>${W(S + "the.passage.you.can.see")}</b></div>`
      + (n.side && n.side.source && n.side.source.bundle ? `<p class="mk-data">${cs.ref("document", n.side.source.bundle, P.titleOf(P.later(cs, ui, "doc:" + n.side.source.bundle, "image", { id: n.side.source.bundle })) || undetermined())}</p>` : "")
      + (n.side && n.side.text ? `<p class="rec mk-data">“${E(n.side.text)}”</p>` : "") + "</div></div>");
    if (!revealed) {
      const optin = n.opted_in ? "" : cs.choice("cd-proj", S + "ask.for", [{ value: n.project, text: ptitle || undetermined() }], {})
        + cs.field("cd-optwords", S + "anything.to.tell.them", { area: true, max: 500, help: [S + "optional.at.most.500.characters", S + "it.is.seen.by.the.other"] })
        + note(S + "asking.cannot.be.taken.back.once", S + "no.other.project.is.named.until")
        + acts(cs.act("contradictionoptin", { label: S + "ask.to.resolve.it" }));
      out.push(cs.sec("screen.security.cando.heading", `<p>${W(S + "your.project.can.ask.to.resolve.it")} ${W(S + "if.every.project.holding.a.side")}</p>`
        + (n.asked_by_another ? `<p class="mk-small">${W(S + "another.project.has.already.asked")}</p>` : "") + optin
        + fold(S + "when.it.cannot.be.asked", [[S + "that.project.does.not.rest.on", S + "choose.a.project.that.does"], [S + "this.is.a.lead.not.a"], [S + "someone.already.closed.it.and.it"]])));
      return hold("d", out.join(""));
    }
    /* (e): the projects named, the responses relayed and her own, and the response form */
    const own = n.opted_in || {};
    const rows = [`<div data-party="own">${cs.row(cs.icon("group"), `<b class="mk-data">${E(ptitle || undetermined())}</b> · ${W("screen.settings.yours")}`, own.at ? `<span class="muted">${cs.date(own.at, { year: true })}</span>` : "")}</div>`]
      .concat((n.parties || []).map((x) => `<div data-party="${E(x.id)}">${cs.row(cs.icon("group"), `<b class="mk-data">${E(x.name || undetermined())}</b>`, "")}</div>`));
    out.push(cs.sec(S + "the.projects", cs.sheet(rows.join(""))));
    const rr = P.later(cs, ui, "resp", "contradictionresponses", { candidate, project: part }, String(ui.seq || 0));
    const list = rr.state === "ok" && rr.value && Array.isArray(rr.value.responses) ? rr.value.responses : (n.responses || []);
    if (list.length) out.push(cs.sec(S + "responses", cs.sheet(list.map((r) => {
      const who = r.own ? P.who(cs, r.author, "") : [r.project && r.project.name, r.cover, r.email].filter(Boolean).join(" · ");
      return `<div data-response="${E(r.response || "")}" data-own="${r.own ? "yes" : "no"}">${cs.row(cs.icon("testimony"), `<span class="rec mk-data">“${E(r.text || "")}”</span>`, "",
        `<span class="mk-data">${E(who)}${r.at ? " · " + cs.date(r.at, { year: true }) : ""}</span>`)}</div>`;
    }).join(""))));
    out.push(cs.sec(S + "respond", cs.field("cd-resp", S + "your.response", { area: true, rec: true, max: 2000, help: [S + "it.reaches.the.other.projects.as"], value: "", ...drafted("response") })
      + draftNote("response") + help("response")
      + cs.checks("cd-share", S + "share.with.the.other.projects", [["cover", S + "my.cover.name", false], ["email", S + "my.email.address", false]])
      + cs.field("cd-email", S + "your.email.address", { max: 254, help: [S + "shown.only.if.you.tick.it", S + "it.is.shown.as.you.typed"] })
      + note(S + "a.response.cannot.be.taken.back", S + "nothing.about.you.is.shared.except")
      + acts(cs.act("contradictionrespond", { label: S + "send.my.response" }))
      + fold(S + "when.it.cannot.be.sent", [[S + "your.project.has.not.asked.to"], [S + "the.response.is.empty", S + "say.something.in.your.own.words"],
        [S + "you.can.share.only.your.own", S + "untick.what.is.not.yours"]])));
    return hold("e", out.join(""));
  }

  /* ---------- (a), (b), (c) and a closed candidate: both passages, side by side ---------- */
  const c = whole, lead = c.weight === "lead", duty = c.weight === "duty";
  const openish = c.state === "open" || c.state === "explained_not_shown";
  const state = c.state === "taken_up" ? "c" : !openish ? "closed" : lead ? "b" : "a";
  out.push(cs.title() + `<p class="mk-sub">${W(S + "two.passages.from.your.team.s")} ${W(S + "both.are.shown.as.they.are")}</p>` + sides([S + "first.passage", S + "second.passage"]));
  const fr = P.later(cs, ui, "facts", "contradictionfacts", { candidate });
  const facts = fr.state === "ok" && fr.value && Array.isArray(fr.value.facts) ? fr.value.facts : [];
  const fact = (name, icon) => {
    const f = facts.find((x) => x && x.fact === name && x.undetermined !== true && x.a !== null && x.b !== null && x.a !== undefined && x.b !== undefined);
    if (!f) return "";
    const show = (v) => (name === "stated_date" ? cs.date(String(v), { year: true }) : E(String(v)));
    return `<div data-fact="${name}">${cs.row(cs.icon(icon), `<span class="mk-data">${show(f.a)} · ${show(f.b)}</span>`, "")}</div>`;
  };
  const m = c.machine && typeof c.machine === "object" ? c.machine : null;
  const rows = fact("stated_date", "timeline") + fact("doctype", "document");
  const dateFact = facts.find((x) => x && x.fact === "stated_date" && x.undetermined !== true && x.a && x.b);
  out.push(cs.sec(S + "why.they.are.side.by.side",
    (c.why ? `<p data-why="1">${E(c.why)}</p>` : "")
    + (m && m.reason ? `<div class="cs-machinework" data-origin="machine">${cs.mark("origin", "machine")}${m.label === "world" ? " " + W(S + "the.assistant.s.judgement.not.a") : ""}`
      + `<p class="rec mk-data">“${E(m.reason)}”</p></div>` : "")
    + (rows ? cs.sheet(rows) : ""),
    { help: [S + "help.why.these.two.were.put.together", S + "help.the.sentence.in.quotes.is.the"] }));
  if (state === "closed") return hold("closed", out.join("") + note(S + "someone.already.closed.this.and.it"));
  if (state === "a" || state === "b")
    out.push(cs.sec(S + "how.strongly.it.binds", `<p>${lead ? W(S + "this.is.a.lead.the.assistant") + " " + W(S + "it.asks.nothing.of.anyone.until")
      : duty ? W(S + "this.is.a.conflict.the.record") + " " + W(S + "it.stays.open.until.someone.resolves") : ""}</p>`));

  const drawnFor = (field) => drafted(field);
  if (state === "a" && duty) {
    const evid = dateFact ? cs.checks("cd-evid", S + "what.shows.it", [["time_or_occasion", S + "the.two.stated.dates.the.documents", false]]) : "";
    out.push(cs.sec(S + "say.how.they.differ", cs.checks("cd-coords", S + "they.differ.in", K.COORDS.map(([v, k]) => [v, k, false]))
      + cs.field("cd-expl", S + "say.in.your.own.words.how", { area: true, rec: true, max: 1000, help: [S + "required.unless.you.accept.all.of", S + "it.is.recorded.as.yours"], ...drawnFor("explanation") })
      + draftNote("explanation") + help("explanation")
      + cs.field("cd-qa", S + "what.holds.for.the.first.passage", { max: 200, help: [S + "optional.at.most.200.characters"] })
      + cs.field("cd-qb", S + "what.holds.for.the.second.passage", { max: 200, help: [S + "optional.at.most.200.characters"] })
      + evid + note(S + "with.something.that.shows.it.the", S + "with.only.your.words.the.tension")
      + acts(cs.act("contradictionclarify", { label: S + "say.how.they.differ", tone: "primary", data: { choice: "differs" } })), { help: [S + "help.use.this.when.the.two.passages"] }));
    out.push(cs.sec(S + "say.that.one.of.them.is", cs.choice("cd-wrong", S + "which.one.is.wrong", K.SIDES, { value: "a" })
      + cs.field("cd-why", S + "why.it.is.wrong", { area: true, rec: true, max: 1000, help: [S + "every.member.who.sees.this.will"] })
      + note(S + "the.passage.is.never.deleted", S + "it.is.marked.as.corrected.with")
      + acts(cs.act("contradictionclarify", { label: S + "mark.it.wrong.with.a.reason", data: { choice: "one_wrong" } }))));
    out.push(fold(S + "when.it.cannot.be.recorded", [[S + "someone.already.closed.this.and.it", S + "open.it.from.the.list.to"], [S + "you.named.a.respect.but.gave", S + "say.how.they.differ.or.accept"],
      [S + "one.of.the.things.you.named", S + "choose.something.else.or.remove.it"], [S + "you.did.not.say.which.passage", S + "choose.one.and.say.why.then"],
      [S + "you.cannot.see.both.passages.so", S + "a.member.who.can.see.both"]]));
  }
  if (state === "b") {
    out.push(cs.sec(S + "dismiss.it", cs.choice("cd-dis", S + "why.it.is.not.a.conflict", K.DISMISS, { value: K.DISMISS[0][0] })
      + cs.field("cd-diswords", S + "anything.to.add", { area: true, max: 500, help: [S + "optional.at.most.500.characters"] })
      + note(S + "dismissing.closes.this.lead.and.it", S + "your.reason.and.your.name.are")
      + acts(cs.act("contradictiondismiss", { label: S + "dismiss.this.lead.with.a.reason" }))));
    out.push(fold(S + "when.it.cannot.be.dismissed", [[S + "this.is.a.conflict.the.record.2", S + "say.how.the.two.differ.or"], [S + "someone.already.dismissed.or.resolved.it", S + "it.stays.as.they.left.it"]]));
  }
  if (state === "a" || state === "b")
    out.push(cs.sec("act.contradictiontakeup.label.contradiction", `<p class="mk-small">${W(S + "opens.a.new.question.in.the")}</p>`
      + cs.field("cd-q", "screen.calculation.question", { area: true, rec: true, max: 500, value: c.default_question || "", help: [S + "the.question.shown.is.the.default"], ...drawnFor("question") })
      + draftNote("question") + help("question")
      + cs.choice("cd-frame", S + "ask.it.around", K.SIDES, { value: "a", help: [S + "the.passage.you.choose.is.listed"] })
      + acts(cs.act("contradictiontakeup", { label: "act.contradictiontakeup.label.contradiction" }))
      + fold(S + "when.it.cannot.be.taken.up", [[S + "someone.already.closed.this.and.it", S + "if.it.was.already.taken.up"], [S + "the.question.is.empty.or.the", S + "word.the.question.and.choose.a"]])));
  if (state === "c") {
    const iread = P.later(cs, ui, "inq", "image", { id: c.inquiry });
    out.push(cs.sec(S + "taken.up", `<p>${c.inquiry ? cs.ref("question", c.inquiry, P.titleOf(iread) || undetermined()) : ""}</p><p>${W(S + "it.stays.open.here.until.the")}</p>`));
    const vr = P.later(cs, ui, "versions", "basisversions", { id: c.inquiry });
    const accepted = vr.state === "ok" && vr.value && Array.isArray(vr.value.versions) ? vr.value.versions.filter((v) => v && v.state === "accepted" && v.hidden !== true) : [];
    out.push(cs.sec(S + "conclude.it", cs.choice("cd-kind", S + "what.it.turned.out.to.be", K.KINDS, { value: K.KINDS[0][0] })
      + `<details class="mk-details" open><summary>${W(S + "if.they.differ.in.a.way")}</summary>`
      + cs.checks("cd-rcoords", S + "they.differ.in", K.RCOORDS.map(([v, k]) => [v, k, false]))
      + cs.field("cd-rqa", S + "what.holds.for.the.first.passage", { max: 200, help: [S + "optional.at.most.200.characters"] })
      + cs.field("cd-rqb", S + "what.holds.for.the.second.passage", { max: 200, help: [S + "optional.at.most.200.characters"] }) + "</details>"
      + `<details class="mk-details"><summary>${W(S + "if.one.is.wrong.or.was")}</summary>` + cs.choice("cd-rwrong", S + "which.one.is.wrong", K.SIDES, { value: "a" })
      + cs.field("cd-rwhy", S + "why.it.is.wrong", { area: true, rec: true, max: 1000, help: [S + "required.for.these.answers"] }) + "</details>"
      + `<details class="mk-details"><summary>${W(S + "if.two.rules.conflict")}</summary>` + cs.choice("cd-canon", S + "how.they.are.reconciled", K.CANONS, { value: "unreconciled" }) + "</details>"
      + (accepted.length ? cs.choice("cd-version", "question.conclude.reading", accepted.map((v) => ({ value: String(v.name), text: String(v.name) })), {}) : "")
      + cs.field("cd-concl", S + "your.conclusion", { area: true, rec: true, max: 1000, help: [S + "say.in.your.own.words.what"], ...drawnFor("conclusion") })
      + draftNote("conclusion") + help("conclusion")
      + cs.field("cd-fals", "question.conclude.falsifier", { max: 1000, help: [S + "required.unless.you.tick.the.box"] })
      + cs.checks("cd-nofals", "", [["1", "question.conclude.nofalsifier", false]])
      + note(S + "concluding.records.what.the.contradiction.turned", S + "if.it.is.reopened.the.contradiction")
      + acts(cs.act("contradictionresolve", { tone: "primary", label: "act.contradictionresolve.label.contradiction" }))
      + fold(S + "when.it.cannot.be.concluded", [[S + "this.is.not.a.question.taken", S + "open.it.from.the.contradiction.itself"], [S + "part.of.your.answer.is.missing", S + "fill.in.that.part.and.try"],
        [S + "the.question.could.not.be.concluded", S + "add.what.is.missing.then.try"]])));
  }
  return hold(state, out.join(""));
}

/** Two design sentences, one after the other, as a refusal's words: a function the page can serve by its own text. */
const say = (...keys) => new Function("r", "cs", "return " + keys.map((k) => `cs.w(${JSON.stringify(k)})`).join(" + \" \" + ") + ";");
const CLOSED = say(S + "someone.already.closed.this.and.it", S + "open.it.from.the.list.to");
const MISSING_ANSWER = say(S + "part.of.your.answer.is.missing", S + "fill.in.that.part.and.try");
const NOT_CONCLUDED = say(S + "the.question.could.not.be.concluded", S + "add.what.is.missing.then.try");
const WORDED = say(S + "the.question.is.empty.or.the", S + "word.the.question.and.choose.a");
const SHARE = say(S + "you.can.share.only.your.own", S + "untick.what.is.not.yours");
const PASSAGE_WRONG = say(S + "you.did.not.say.which.passage", S + "choose.one.and.say.why.then");

/* The acts. A request holds exactly the fields `contradiction` declares; each field is read by `cs.value`, and an act whose own
   words are its `reasonField` sends nothing, and says so in the design's words, while those words are empty. */
const acts = [
  { op: "contradictionclarify", label: "act.contradictionclarify.label.contradiction", reasonField: "reason",
    refusals: { CANDIDATE_CLOSED: CLOSED, NO_SUCH_CANDIDATE: say(S + "you.cannot.see.both.passages.so", S + "a.member.who.can.see.both"),
      CLARIFY_NO_EXPLANATION: say(S + "you.named.a.respect.but.gave", S + "say.how.they.differ.or.accept"),
      EVIDENCE_NOT_SEEN: say(S + "one.of.the.things.you.named", S + "choose.something.else.or.remove.it"), WRONG_SIDE_UNNAMED: PASSAGE_WRONG, WRONG_SIDE_NO_REASON: PASSAGE_WRONG },
    send(view, el, cs) {
      const S = view.parts.K.S, v = (id) => String(cs.value(id) == null ? "" : cs.value(id)).trim(), candidate = view.parts.parse(view.subject).candidate;
      if (el.dataset.choice === "one_wrong") {
        const reason = v("cd-why");
        return reason ? { body: { candidate, choice: "one_wrong", wrongSide: v("cd-wrong") || "a", reason } } : { refuse: S + "you.did.not.say.which.passage" };
      }
      /* her words are what the shell reads as the act's reason */
      const explanation = v("cd-expl");
      if (!explanation) return { refuse: S + "you.named.a.respect.but.gave" };
      const evidence = (cs.value("cd-evid") || []).map((fact) => ({ fact })), qualifiers = {};
      if (v("cd-qa")) qualifiers.a = v("cd-qa");
      if (v("cd-qb")) qualifiers.b = v("cd-qb");
      return { body: { candidate, choice: "differs", coordinates: cs.value("cd-coords") || [], explanation, reason: explanation,
        ...(Object.keys(qualifiers).length ? { qualifiers } : {}), ...(evidence.length ? { evidence } : {}) } };
    } },
  { op: "contradictiontakeup", label: "act.contradictiontakeup.label.contradiction", reasonField: "question",
    refusals: { CANDIDATE_CLOSED: say(S + "someone.already.closed.this.and.it", S + "if.it.was.already.taken.up"), TAKE_UP_NO_QUESTION: WORDED, TAKE_UP_NO_FRAME: WORDED },
    send(view, el, cs) {
      const S = view.parts.K.S, question = String(cs.value("cd-q") == null ? "" : cs.value("cd-q")).trim();
      return question ? { body: { candidate: view.parts.parse(view.subject).candidate, question, frame: String(cs.value("cd-frame") || "") } } : { refuse: S + "the.question.is.empty.or.the" };
    } },
  { op: "contradictiondismiss", label: "act.contradictiondismiss.label.contradiction", reasonField: "reason",
    refusals: { RECORD_CANNOT_BE_DISMISSED: say(S + "this.is.a.conflict.the.record.2", S + "say.how.the.two.differ.or"),
      CANDIDATE_CLOSED: say(S + "someone.already.dismissed.or.resolved.it", S + "it.stays.as.they.left.it"),
      CANDIDATE_TAKEN_UP: say(S + "someone.already.dismissed.or.resolved.it", S + "it.stays.as.they.left.it") },
    send(view, el, cs) {
      const reason = String(cs.value("cd-dis") || ""), words = String(cs.value("cd-diswords") || "").trim();
      return reason ? { body: { candidate: view.parts.parse(view.subject).candidate, reason, ...(words ? { words } : {}) } } : { refuse: "refusal.DISMISSAL_REASON_UNKNOWN" };
    } },
  { op: "contradictionresolve", label: "act.contradictionresolve.label.contradiction", reasonField: "conclusion",
    refusals: { NOT_A_CONTRADICTION_INQUIRY: say(S + "this.is.not.a.question.taken", S + "open.it.from.the.contradiction.itself"),
      RESOLUTION_INCOMPLETE: MISSING_ANSWER, RESOLUTION_MISSING: MISSING_ANSWER, RESOLUTION_KIND_UNKNOWN: MISSING_ANSWER, NO_CONCLUSION: NOT_CONCLUDED, NO_FALSIFIER: NOT_CONCLUDED },
    send(view, el, cs) {
      const S = view.parts.K.S, v = (id) => String(cs.value(id) == null ? "" : cs.value(id)).trim();
      const conclusion = v("cd-concl");
      if (!conclusion) return { refuse: S + "the.question.could.not.be.concluded" };
      const c = view.parts.found(view).whole, kind = v("cd-kind") || "dissolved", resolution = { kind }, q = {};
      if (kind === "dissolved") {
        const coordinates = cs.value("cd-rcoords") || [];
        if (coordinates.length) resolution.coordinates = coordinates;
        if (v("cd-rqa")) q.a = v("cd-rqa");
        if (v("cd-rqb")) q.b = v("cd-rqb");
        if (Object.keys(q).length) resolution.qualifiers = q;
      }
      if (view.parts.K.CORRECTED.includes(kind)) { resolution.wrong_side = v("cd-rwrong") || "a"; if (v("cd-rwhy")) resolution.reason = v("cd-rwhy"); }
      if (kind === "conflict_of_norms") resolution.canon = v("cd-canon") || "unreconciled";
      const none = (cs.value("cd-nofals") || []).length > 0, falsifier = v("cd-fals"), version = v("cd-version");
      return { body: { inquiry: c ? c.inquiry : "", resolution, conclusion, ...(version ? { version } : {}), ...(none ? { noFalsifier: true } : falsifier ? { falsifier } : {}) } };
    } },
  /* optional words: the shell asks its reason first (this op is graded undetermined, so Reasoned in the browser, DEC-87) */
  { op: "contradictionoptin", label: "act.contradictionoptin.label.contradiction",
    refusals: { NOT_A_PARTY: say(S + "that.project.does.not.rest.on", S + "choose.a.project.that.does"), NOT_A_PROJECT_CONFLICT: say(S + "this.is.a.lead.not.a"),
      CANDIDATE_CLOSED: say(S + "someone.already.closed.it.and.it") },
    send(view, el, cs) {
      const p = view.parts.parse(view.subject), words = String(cs.value("cd-optwords") || "").trim();
      return { body: { candidate: p.candidate, project: String(cs.value("cd-proj") || p.project), ...(words ? { words } : {}) } };
    } },
  { op: "contradictionrespond", label: "act.contradictionrespond.label.contradiction", reasonField: "text",
    refusals: { RESPONSE_BEFORE_OPT_IN: say(S + "your.project.has.not.asked.to"), RESPONSE_NO_TEXT: say(S + "the.response.is.empty", S + "say.something.in.your.own.words"),
      DISCLOSURE_NOT_YOURS: SHARE, DISCLOSURE_MALFORMED: SHARE },
    send(view, el, cs) {
      const S = view.parts.K.S, p = view.parts.parse(view.subject), text = String(cs.value("cd-resp") == null ? "" : cs.value("cd-resp")).trim();
      if (!text) return { refuse: S + "the.response.is.empty" };
      const share = cs.value("cd-share") || [], disclose = {};
      if (share.includes("cover")) disclose.cover = true;
      if (share.includes("email")) disclose.email = String(cs.value("cd-email") || "").trim();
      return { body: { candidate: p.candidate, project: p.project, text, ...(Object.keys(disclose).length ? { disclose } : {}) } };
    },
    done(view, answer, cs) { cs.fill("cd-resp", ""); cs.set("seq", (view.ui.seq || 0) + 1); } },
  /* entry 25: help wording the member's own words, never a reason; told only what she typed, filled into her field as a draft */
  { op: "writinghelp", label: "act.writinghelp.label.contradiction",
    send(view, el, cs) {
      const h = view.parts.K.HELP[el.dataset.field];
      if (!h) return null;
      const told = String(cs.value(h[1]) || "").trim();
      if (!told) return { refuse: view.parts.K.S + "help.needed" };
      view.ui.helpFor = el.dataset.field;
      return { body: { op: h[0], field: el.dataset.field, told } };
    },
    done(view, answer, cs) {
      const a = answer || {}, field = view.ui.helpFor, h = view.parts.K.HELP[field];
      if (!h) return { stay: true };
      cs.fill(h[1], String(a.text || ""));
      cs.set("draft", { field, untested: a.untested === true || (typeof a.untested === "string" && a.untested !== "") });
      return { stay: true };
    } },
];

/** The keys the screen names beyond its own family (R44: every one a words.json word). */
const words = Object.freeze([...BORROWED, "mark.origin.machine.name", "mark.origin.machine.means", "state.undetermined", "state.empty", "draft.machine.label",
  "ai.label.untested.writinghelp", "refusal.DISMISSAL_REASON_UNKNOWN", "act.writinghelp.label.contradiction",
  ...["clarify", "takeup", "dismiss", "resolve", "optin", "respond"].map((o) => `act.contradiction${o}.label.contradiction`)]);

/** R105: "Two documents in tension" (interface-shell R21), with the readers it shares as its parts. */
export const CONTRADICTION_SCREEN = Object.freeze({ id: "contradiction", reads, place, render, acts, words,
  parts: Object.freeze({ K, parse, titleOf, found, later: COMMON.later, plain: COMMON.plain, who: COMMON.who }) });
