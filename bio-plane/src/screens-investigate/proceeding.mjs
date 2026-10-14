/* screens-investigate R6: a court or regulatory proceeding (Projects › <project> › Proceeding; registry screen
 * `proceeding`, its 5 acts). Reads the proceeding (`entities`' `entity`: its caption, court and neutral label), its
 * parties by role (`lines`' `partiesof`), the registers the group follows (`following`' `follows`, the newest read
 * marked new) and the orders held as obligations (`duties`' `dutiesof`, each party's, the ones arising in it), each
 * with its due date. Procedural facts are drawn as facts, never as advice on what to file. */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "");
  if (!/^ENT-/.test(id)) return {};
  return {
    entity: { op: "entity", query: { id }, subject: true, empty: (v) => !v || v.found === false },
    parties: { op: "partiesof", query: { proceeding: id } },
    follows: { op: "follows", query: {} },
  };
}

function render(cs, view) {
  const S = "screen.proceeding.";
  const P = view.parts;
  const id = String(view.subject || "");
  const out = [];
  const create = cs.field("pr-forum", S + "forum", { help: S + "forum.help" }) + cs.field("pr-number", S + "number", {})
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
    return `<p class="cs-sub">${p.forum ? P.refOf(cs, p.forum, p.forum, [p.forum_kind || ""]) : ""} · ${cs.w(S + "caption", { number: p.number || "", label: x.label || "" })}</p>`
      + (x.note ? `<p class="cs-meta">${cs.esc(x.note)}</p>` : "");
  }));
  const parties = view.data.parties && view.data.parties.state === "ok" ? view.data.parties.value.parties || [] : [];
  out.push(cs.sec(S + "parties", cs.state("parties", view, (v) => ((v.parties || []).length
    ? cs.sheet(v.parties.map((x) => cs.row(`<b>${cs.w(S + "role", { role: cs.w(S + "roles." + (["plaintiff", "defendant", "petitioner", "respondent", "appellant", "appellee", "intervenor", "amicus", "complainant", "applicant", "real_party_in_interest", "interested_party"].includes(x.role) ? x.role : "other")) })}</b>`,
      P.refOf(cs, x.party, x.party, []), x.line && x.line.citation ? P.refOf(cs, x.line.citation.captureSha || x.line.citation.capture_sha || "", cs.w(S + "cited"), [], "capture") : "")).join(""))
    : `<p>${cs.w(S + "parties.none")}</p>`))
    + cs.field("pr-party", S + "party", { help: S + "party.help" })
    + cs.choice("pr-role", S + "rolepick", ["petitioner", "respondent", "plaintiff", "defendant", "appellant", "appellee", "intervenor", "amicus", "other"].map((r) => [r, S + "roles." + r]), {})
    + cs.field("pr-sha", S + "sha", { help: S + "sha.help" }) + cs.field("pr-page", S + "page", {})
    + cs.act("recordline", { label: "act.recordline.label.proceeding" })));
  out.push(cs.sec(S + "register.head", cs.state("follows", view, (v) => {
    const regs = (v.items || []).filter((x) => x.kind === "register");
    if (!regs.length) return `<p>${cs.w(S + "register.none")}</p>`;
    const newest = regs.map((x) => x.last_read || "").sort().pop();
    return cs.sheet(regs.map((x) => cs.row(x.last_read && x.last_read === newest ? `<b>${cs.w(S + "new")}</b>` : "",
      cs.esc((x.subject && x.subject.address) || ""), `<span class="cs-meta">${x.last_read ? cs.w(S + "read", { date: cs.date(x.last_read) }) : cs.w(S + "notread")}${x.gated ? " · " + cs.w(S + "gated") : ""}</span>`)).join(""));
  }) + cs.field("pr-register", S + "register.address", {})
    + cs.checks("pr-login", S + "login", [["account", S + "login.yes", false]], {})
    + `<p class="cs-note">${cs.w(S + "login.note")}</p>`
    + cs.act("followregister", { label: "act.followregister.label.proceeding" })));
  /* the orders held as obligations: each party's duties arising in this proceeding, with when they fall due */
  const orders = parties.map((x) => ({ party: x.party, d: P.later(cs, view, "duties:" + x.party, "dutiesof", { query: { entity: x.party, as: "obligor" } }) }));
  const held = orders.flatMap((o) => (o.d.state === "ok" ? (o.d.value.duties || []).filter((u) => !u.withdrawn && (u.arising_in === id || (u.source && u.source.kind === "court"))) : []));
  const loading = orders.find((o) => o.d.state !== "ok");
  out.push(cs.sec(S + "orders", (held.length
    ? cs.sheet(held.map((u) => cs.row(cs.mark("kind", "todo"), `${cs.esc((u.performance && u.performance.act) || "")} <span class="cs-meta">${P.refOf(cs, u.obligor, u.obligor, [])} · ${cs.esc((u.adoption && u.adoption.clause) || "")}</span>`,
      u.time && u.time.date ? cs.due(u.time.date, u.in_force && u.in_force.state === "met" ? "met" : "") : cs.mark("gap", "undetermined", { reason: cs.w(S + "nodue") }))).join(""))
    : loading ? cs.state(loading.d, () => "") : `<p>${cs.w(S + "orders.none")}</p>`)
    + cs.field("pr-obligor", S + "obligor", { help: S + "party.help" }) + cs.field("pr-act", S + "act", { area: true, rec: true })
    + cs.field("pr-clause", S + "clause", {}) + cs.field("pr-due", S + "due", { type: "date" })
    + cs.act("declare", { label: "act.declare.label.proceeding" })
    + cs.field("pr-court", S + "court", { help: S + "court.help" }) + cs.field("pr-law", S + "law", {}) + cs.field("pr-citation", S + "citation", {})
    + cs.choice("pr-type", S + "type", ["interprets", "applies", "holds_invalid", "requires"].map((k) => [k, S + "type." + k]), {})
    + cs.act("courtlink", { label: "act.courtlink.label.proceeding" })
    + `<p class="cs-note">${cs.w(S + "facts")}</p>`));
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
      return { body: Object.assign({ address }, cs.value("pr-login-0") === true ? { gated: { kind: "account" } } : {}) };
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

export const PROCEEDING_WORDS = [
  ["none", "No proceeding is open here. Register one from its caption."],
  ["caption", "No. {number} · a neutral label: \"{label}\""],
  ["parties", "Parties"],
  ["parties.none", "No party is recorded yet."],
  ["role", "{role}"],
  ...["plaintiff", "defendant", "petitioner", "respondent", "appellant", "appellee", "intervenor", "amicus", "complainant", "applicant", "real_party_in_interest", "interested_party", "other"]
    .map((r) => ["roles." + r, { plaintiff: "Plaintiff", defendant: "Defendant", petitioner: "Petitioner", respondent: "Respondent", appellant: "Appellant", appellee: "Appellee",
      intervenor: "Intervenor", amicus: "Amicus", complainant: "Complainant", applicant: "Applicant", real_party_in_interest: "Real party in interest", interested_party: "Interested party", other: "Other party" }[r]]),
  ["cited", "where it appears"],
  ["party", "The party"],
  ["party.help", "The person or organisation, by its record id."],
  ["rolepick", "Their role"],
  ["sha", "The document it appears in"],
  ["sha.help", "The document's fingerprint, as its page shows it."],
  ["page", "Page (optional)"],
  ["register.head", "The register"],
  ["register.none", "The group follows no register yet."],
  ["new", "New"],
  ["read", "read {date}"],
  ["notread", "not read yet"],
  ["gated", "needs a login"],
  ["register.address", "The register's address"],
  ["login", "Its register"],
  ["login.yes", "needs a login"],
  ["login.note", "A register that needs a login is not read by your group's Civicsmith: new filings come only by a member's own capture."],
  ["orders", "Orders, held as obligations"],
  ["orders.none", "No order is held as an obligation yet."],
  ["nodue", "the order states no date"],
  ["obligor", "Who the order binds"],
  ["act", "What the order requires"],
  ["clause", "Where it says so (the order's paragraph)"],
  ["due", "By when (optional)"],
  ["court", "The decision (a court standard's id)"],
  ["court.help", "The decision, held as a standard."],
  ["law", "What it interprets (a standard's id)"],
  ["citation", "The passage (a content id)"],
  ["type", "The decision"],
  ["type.interprets", "Interprets it"],
  ["type.applies", "Applies it"],
  ["type.holds_invalid", "Holds it invalid"],
  ["type.requires", "Requires it"],
  ["facts", "Procedural facts (which form, which court, which deadline) are facts, never advice on what to file."],
  ["register", "Register a proceeding"],
  ["forum", "The court or tribunal"],
  ["forum.help", "The court, by its record id."],
  ["number", "Its number"],
  ["kind", "The kind of proceeding"],
  ["kind.help", "As the court names it, for example \"civil\"."],
  ["label", "A neutral label"],
  ["label.help", "How the group refers to it, saying nothing of who is right, for example \"the lease rent case\"."],
  ["note", "Where its caption comes from"],
  ["create.empty", "Give the court, the number, the kind and where the caption comes from."],
  ["party.empty", "Name the party and the passage it appears in."],
  ["register.empty", "Give the register's public address, starting https://."],
  ["order.empty", "Name who the order binds, what it requires and its paragraph."],
  ["link.empty", "Name the decision, what it interprets and the passage."],
].map(([k, en]) => row("screen.proceeding." + k, en));

const words = ["screen.proceeding.name", "screen.proceeding.purpose",
  ...["entitycreate", "recordline", "followregister", "declare", "courtlink"].flatMap((op) => ["act." + op + ".label.proceeding", "act." + op + ".does"]),
  "mark.kind.todo.name", "mark.kind.todo.means", "mark.due.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "state.empty", "state.loading", "state.failed", ...PROCEEDING_WORDS];

export const PROCEEDING_SCREEN = Object.freeze({ id: "proceeding", reads, render, acts, words, parts: PARTS });
