/* screens-investigate R6: a court or regulatory proceeding (Projects › <project> › Proceeding; registry screen
 * `proceeding`, its 5 acts). Reads the proceeding (`entities`' `entity`: its caption, court and neutral label), its
 * parties by role (`lines`' `partiesof`), the registers the group follows (`following`' `follows`, the newest read
 * marked new) and the orders held as obligations (`duties`' `dutiesof`, each party's, the ones arising in it), each
 * with its due date. Procedural facts are drawn as facts, never as advice on what to file. */

import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "");
  if (!/^ENT-/.test(id)) return {};
  return {
    entity: { op: "entity", query: { id }, subject: true, empty: (v) => !v || v.found === false },
    parties: { op: "partiesof", query: { proceeding: id } },
    dates: { op: "proceedingdates", query: { proceeding: id } },
    follows: { op: "follows", query: {} },
    people: { op: "peopledirectory", query: { limit: "200" } },
    standards: { op: "standards", query: { limit: "200" } },
  };
}

function render(cs, view) {
  const S = "screen.proceeding.";
  const P = view.parts;
  const id = String(view.subject || "");
  const out = [];
  const create = cs.choice("pr-forum", S + "forum", view.parts.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || r.entity })), {}) + cs.field("pr-number", S + "number", {})
    + cs.field("pr-kind", S + "kind", { help: S + "kind.help" }) + cs.field("pr-label", S + "label", { help: S + "label.help" })
    + cs.field("pr-note", S + "note", { area: true, rec: true })
    + cs.act("entitycreate", { label: "act.entitycreate.label.proceeding", tone: "primary" });
  if (!/^ENT-/.test(id)) {
    out.push(cs.title(cs.w("screen.proceeding.name")), `<p>${cs.w(S + "none")}</p>`, cs.sec(S + "register", create));
    return out.join("");
  }
  const e = view.data.entity && view.data.entity.state === "ok" ? view.data.entity.value.entity : null;
  const pr = e && e.proceeding ? e.proceeding : null;
  out.push(cs.title(e ? e.label || id : id, { thing: { kind: "proceeding", facts: pr ? [pr.number || "", pr.kind || ""] : [] } }));
  out.push(cs.state("entity", view, (v) => {
    const x = v.entity || {};
    const p = x.proceeding || {};
    return `<p class="mk-sub">${p.forum ? P.refOf(cs, p.forum, p.forum, [p.forum_kind || ""]) : ""} · ${cs.w(S + "caption", { number: p.number || "", label: x.label || "" })}</p>`
      + (x.note ? `<p class="mk-small">${cs.esc(x.note)}</p>` : "");
  }));
  /* R28: "Dates": the proceeding's own dates and the group's deadlines on it, two lanes, never interleaved; nothing is drawn as late */
  out.push(cs.sec("proceeding.dates.title", cs.state("dates", view, (v) => {
    const lanes = (v && v.lanes) || {};
    const own = lanes.proceeding || { items: [] }, ours = lanes.group || { items: [] };
    const ownItems = Array.isArray(own.items) ? own.items : [], ourItems = Array.isArray(ours.items) ? ours.items : [];
    if (!ownItems.length && !ourItems.length && !ours.unread) return `<p class="cs-state" data-state="empty">${cs.w("proceeding.dates.none")}</p>`;
    const st = own.status || null;
    const stage = st ? (st.stage === "undetermined" || !st.stage ? cs.mark("gap", "undetermined", { reason: st.why || "" }) : cs.w("proceeding.dates.stage", { stage: st.label || st.stage })) : "";
    const lane = (key, tag, body) => `<section data-lane="${tag}"><h2 class="mk-lanehead" tabindex="0">${cs.w(key)}</h2>${body}</section>`;
    return (stage ? `<p class="mk-small">${stage}</p>` : "")
      + `<div class="mk-lanes">`
      + (ownItems.length || own.truncated ? lane("proceeding.dates.lane.proceeding", "proceeding", ownItems.map((x) =>
        `<div class="mk-ev" data-event="${cs.esc(x.event)}"><span class="mk-date">${P.when(cs, x.when_undetermined ? null : x.when, x.why)}</span> <b>${P.refOf(cs, x.event, x.label || x.event, [x.kind || ""], "event")}</b></div>`).join("")
        + (own.truncated ? `<p class="mk-small">${cs.w("screen.timeline.more")}</p>` : "")) : "")
      + (ourItems.length || ours.truncated || ours.unread ? lane("proceeding.dates.lane.group", "group", ourItems.map((x) =>
        `<div class="mk-ev us" data-action="${cs.esc(x.action)}"><span class="mk-date">${cs.date(x.date || "") || cs.esc(String(x.date || ""))}</span> <b>${P.refOf(cs, x.action, x.text || x.action, [x.basis || ""], "action")}</b>${x.basis ? ` <span class="mk-small">${cs.esc(x.basis)}</span>` : ""}</div>`).join("")
        + (ours.unread ? cs.mark("gap", "undetermined", { reason: String(ours.unread) }) : "") + (ours.truncated ? `<p class="mk-small">${cs.w("screen.timeline.more")}</p>` : "")) : "")
      + "</div>";
  }), { help: "proceeding.dates.help" }));
  const parties = view.data.parties && view.data.parties.state === "ok" ? view.data.parties.value.parties || [] : [];
  out.push(cs.sec(S + "parties", cs.state("parties", view, (v) => ((v.parties || []).length
    ? cs.sheet(v.parties.map((x) => cs.row(`<b>${cs.w(S + "role", { role: cs.w(S + "roles." + (["plaintiff", "defendant", "petitioner", "respondent", "appellant", "appellee", "intervenor", "amicus", "complainant", "applicant", "real_party_in_interest", "interested_party"].includes(x.role) ? x.role : "other")) })}</b>`,
      P.refOf(cs, x.party, x.party, []), x.line && x.line.citation ? P.refOf(cs, x.line.citation.captureSha || x.line.citation.capture_sha || "", cs.w(S + "cited"), [], "capture") : "")).join(""))
    : ""))
    + cs.choice("pr-party", S + "party", view.parts.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || r.entity })), {})
    + cs.choice("pr-role", S + "rolepick", ["petitioner", "respondent", "plaintiff", "defendant", "appellant", "appellee", "intervenor", "amicus", "other"].map((r) => [r, S + "roles." + r]), {})
    + cs.field("pr-sha", S + "sha", { help: S + "sha.help" }) + cs.field("pr-page", S + "page", {})
    + cs.act("recordline", { label: "act.recordline.label.proceeding" })));
  out.push(cs.sec(S + "register.head", cs.state("follows", view, (v) => {
    const regs = (v.items || []).filter((x) => x.kind === "register" && x.subject && x.subject.proceeding === id);
    if (!regs.length) return "";
    const newest = regs.map((x) => x.last_read || "").sort().pop();
    return cs.sheet(regs.map((x) => cs.row(x.last_read && x.last_read === newest ? `<b>${cs.w(S + "new")}</b>` : "",
      cs.esc((x.subject && x.subject.address) || ""), `<span class="mk-small">${x.last_read ? cs.w(S + "read", { date: cs.date(x.last_read) }) : cs.w(S + "notread")}${x.gated ? " · " + cs.w(S + "gated") : ""}</span>`)).join(""));
  }) + cs.field("pr-register", S + "register.address", {})
    + cs.checks("pr-login", S + "login", [["account", S + "login.yes", false]], {})
    + `<p class="mk-note">${cs.w(S + "login.note")}</p>`
    + cs.act("followregister", { label: "act.followregister.label.proceeding" })));
  /* the orders held as obligations: each party's duties arising in this proceeding, with when they fall due */
  const orders = parties.map((x) => ({ party: x.party, d: P.later(cs, view, "duties:" + x.party, "dutiesof", { query: { entity: x.party, as: "obligor" } }) }));
  const held = orders.flatMap((o) => (o.d.state === "ok" ? (o.d.value.duties || []).filter((u) => !u.withdrawn && (u.arising_in === id || (u.source && u.source.kind === "court"))) : []));
  const loading = orders.find((o) => o.d.state !== "ok");
  out.push(cs.sec(S + "orders", (held.length
    ? cs.sheet(held.map((u) => cs.row(cs.mark("kind", "todo"), `${cs.esc((u.performance && u.performance.act) || "")} <span class="mk-small">${P.refOf(cs, u.obligor, u.obligor, [])} · ${cs.esc((u.adoption && u.adoption.clause) || "")}</span>`,
      u.time && u.time.date ? cs.due(u.time.date, u.in_force && u.in_force.state === "met" ? "met" : "") : cs.mark("gap", "undetermined", { reason: cs.w(S + "nodue") }))).join(""))
    : loading ? cs.state(loading.d, () => "") : "")
    + cs.choice("pr-obligor", S + "obligor", view.parts.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || r.entity })), {}) + cs.field("pr-act", S + "act", { area: true, rec: true })
    + cs.field("pr-clause", S + "clause", {}) + cs.field("pr-due", S + "due", { type: "date" })
    + cs.act("declare", { label: "act.declare.label.proceeding" })
    + cs.choice("pr-court", S + "court", view.parts.options(view, "standards", (v) => v.items, (x) => ({ value: x.id, text: x.cite || x.id })), {}) + cs.choice("pr-law", S + "law", view.parts.options(view, "standards", (v) => v.items, (x) => ({ value: x.id, text: x.cite || x.id })), {}) + cs.field("pr-citation", S + "citation", {})
    + cs.choice("pr-type", S + "type", ["interprets", "applies", "holds_invalid", "requires"].map((k) => [k, S + "type." + k]), {})
    + cs.act("courtlink", { label: "act.courtlink.label.proceeding" })
    + `<p class="mk-note">${cs.w(S + "facts")}</p>`));
  out.push(cs.sec(S + "register", create));
  return out.join("");
}

const acts = [
  /* "Register the proceeding" from its caption: the court, the number, a neutral label (the note: the member's own words) */
  { op: "entitycreate", label: "act.entitycreate.label.proceeding", reasonField: "note",
    send(view, el, cs) {
      const forum = String(cs.value("pr-forum") || "").trim(), number = String(cs.value("pr-number") || "").trim();
      const kind = String(cs.value("pr-kind") || "").trim(), label = String(cs.value("pr-label") || "").trim(), note = String(cs.value("pr-note") || "").trim();
      if (!forum || !number || !kind || !note) return { refuse: "screen.proceeding.create.empty" };
      return { body: Object.assign({ kind: "proceeding", note, proceeding: { forum, kind, number } }, label ? { label, aliases: [label] } : {}) };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.entity_id) cs.go("proceeding", r.entity_id); } },
  { op: "recordline", label: "act.recordline.label.proceeding",
    send(view, el, cs) {
      const from = String(cs.value("pr-party") || "").trim();
      const basis = view.parts.passage(cs.value("pr-sha"), cs.value("pr-page"));
      if (!from || !basis) return { refuse: "screen.proceeding.party.empty" };
      return { body: { kind: "party_to", from, to: String(view.subject || ""), role: String(cs.value("pr-role") || "other"), basis } };
    } },
  /* "Follow its register": a register needing a login brings new filings only by a member's own capture */
  { op: "followregister", label: "act.followregister.label.proceeding",
    send(view, el, cs) {
      const address = String(cs.value("pr-register") || "").trim();
      if (!/^https:\/\//.test(address)) return { refuse: "screen.proceeding.register.empty" };
      return { body: Object.assign({ address, proceeding: String(view.subject || "") }, cs.value("pr-login-0") === true ? { gated: { kind: "account" } } : {}) };
    } },
  /* "Hold an order as obligations": what the order requires, of whom, by when, citing its clause */
  { op: "declare", label: "act.declare.label.proceeding",
    send(view, el, cs) {
      const obligor = String(cs.value("pr-obligor") || "").trim(), act = String(cs.value("pr-act") || "").trim();
      const clause = String(cs.value("pr-clause") || "").trim(), date = String(cs.value("pr-due") || "").trim();
      if (!obligor || !act || !clause) return { refuse: "screen.proceeding.order.empty" };
      return { body: Object.assign({ modality: "duty", obligor, performance: { act }, source: { kind: "court" }, clause, arising_in: String(view.subject || "") },
        date ? { trigger: { kind: "date", date }, time: { basis: "window", date } } : { trigger: { kind: "source" }, time: { basis: "window" } }) };
    } },
  { op: "courtlink", label: "act.courtlink.label.proceeding",
    send(view, el, cs) {
      const from = String(cs.value("pr-court") || "").trim(), to = String(cs.value("pr-law") || "").trim(), citation = String(cs.value("pr-citation") || "").trim();
      if (!from || !to || !citation) return { refuse: "screen.proceeding.link.empty" };
      return { body: { type: String(cs.value("pr-type") || "interprets"), from, to, citation } };
    } },
];

const PROCEEDING_KEYS = [
  "screen.proceeding.none", "screen.proceeding.caption", "screen.proceeding.parties", "screen.proceeding.role", "screen.proceeding.roles.plaintiff",
  "screen.proceeding.roles.defendant", "screen.proceeding.roles.petitioner", "screen.proceeding.roles.respondent",
  "screen.proceeding.roles.appellant", "screen.proceeding.roles.appellee", "screen.proceeding.roles.intervenor", "screen.proceeding.roles.amicus",
  "screen.proceeding.roles.complainant", "screen.proceeding.roles.applicant", "screen.proceeding.roles.real_party_in_interest",
  "screen.proceeding.roles.interested_party", "screen.proceeding.roles.other", "screen.proceeding.cited", "screen.proceeding.party",
  "screen.proceeding.rolepick", "screen.proceeding.sha", "screen.proceeding.sha.help", "screen.proceeding.page", "screen.proceeding.register.head",
  "screen.proceeding.new", "screen.proceeding.read", "screen.proceeding.notread", "screen.proceeding.gated", "screen.proceeding.register.address",
  "screen.proceeding.login", "screen.proceeding.login.yes", "screen.proceeding.login.note", "screen.proceeding.orders", "screen.proceeding.nodue",
  "screen.proceeding.obligor", "screen.proceeding.act", "screen.proceeding.clause", "screen.proceeding.due", "screen.proceeding.court",
  "screen.proceeding.law", "screen.proceeding.citation", "screen.proceeding.type", "screen.proceeding.type.interprets",
  "screen.proceeding.type.applies", "screen.proceeding.type.holds_invalid", "screen.proceeding.type.requires", "screen.proceeding.facts",
  "screen.proceeding.register", "screen.proceeding.forum", "screen.proceeding.number", "screen.proceeding.kind", "screen.proceeding.kind.help",
  "screen.proceeding.label", "screen.proceeding.label.help", "screen.proceeding.note", "screen.proceeding.create.empty",
  "screen.proceeding.party.empty", "screen.proceeding.register.empty", "screen.proceeding.order.empty", "screen.proceeding.link.empty",
];

const words = ["screen.proceeding.name", "screen.proceeding.purpose",
  "proceeding.dates.title", "proceeding.dates.help", "proceeding.dates.lane.proceeding", "proceeding.dates.lane.group", "proceeding.dates.stage", "proceeding.dates.none",
  "screen.timeline.month", "screen.timeline.onorbefore", "screen.timeline.undated", "screen.timeline.more",
  ...["entitycreate", "recordline", "followregister", "declare", "courtlink"].flatMap((op) => ["act." + op + ".label.proceeding", "act." + op + ".does"]),
  "mark.kind.todo.name", "mark.kind.todo.means", "mark.due.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "state.empty", "state.loading", "state.failed", ...PROCEEDING_KEYS];

export const PROCEEDING_SCREEN = Object.freeze({ id: "proceeding", ABSENT_CODES: Object.freeze(["NO_ENTITY", "NO_CALC"]), reads, render, acts, words, parts: PARTS });
