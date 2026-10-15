/* screens-investigate R1: a person the record follows (People › Person; registry screen `person`, its 7 acts with
 * "Explore connections"; N719; DEC-142, DEC-170, DEC-181). Reads `people`' `person` (as of the page's own day: the read
 * takes a date, never "now") and `samepersoncandidates`. Each position and fact is a reference to its source passage; a
 * fact is removed for good only by `personexpunge`, behind its consequence statement (op-grades R21), with the
 * Irreversible weight, and at the phone width it is read and not done (interface-shell R11). */

import { PARTS } from "./parts.mjs";
import { GRAPH_SHARED } from "./graphwords.mjs";

const S = "screen.person.";

function reads(view) {
  const S = "screen.person.";
  const id = String(view.subject || "");
  const at = new Date(Date.now()).toISOString().slice(0, 10);
  return {
    person: { op: "person", query: { id, at }, subject: true, empty: (v) => !v || v.found === false },
    candidates: { op: "samepersoncandidates", query: { id } },
    vocab: { op: "affordances", query: {} },
    people: { op: "peopledirectory", query: { limit: "200" } },
  };
}

function render(cs, view) {
  const S = "screen.person.";
  const P = view.parts;
  const id = String(view.subject || "");
  const d = view.data.person;
  const p = d && d.state === "ok" ? d.value : null;
  const name = p && Array.isArray(p.names) && p.names.length ? p.names[0].name : id;
  const out = [cs.title(name, { thing: { kind: "person", facts: p ? (p.names || []).slice(1).map((n) => n.name) : [] } })];
  out.push(`<div class="mk-acts">${cs.act("person", { label: "act.person.label.person" })}${cs.act("explore", { label: "act.explore.label.person", data: { entity: id } })}</div>`);
  /* R18: "Connections": the graph from this person, as of today, two rings out; a node pressed becomes the centre */
  const vocab = view.data.vocab && view.data.vocab.state === "ok" ? view.data.vocab.value : null;
  const groups = P.groupMap(vocab);
  const centre = String(view.ui.centre || id);
  const gq = P.later(cs, view, "graph", "exploregraph", { body: { centre, at: { value: P.today(cs), precision: "day", zone: "UTC" }, rings: 2 } });
  out.push(cs.sec(S + "connections", cs.state(gq, (g) => P.graph(cs, g, { groupOf: (k) => groups[k] || null, trail: Array.isArray(view.ui.trail) && view.ui.trail.length ? view.ui.trail : [centre], act: "explore", names: { [id]: name }, words: { cited: S + "g.cited", declared: S + "g.declared", hunch: S + "g.hunch", nosource: S + "g.nosource" } }))));
  /* each item cited, dated and graded: its passage a reference to the capture, its grade one mark */
  const cite = (c, label) => (c && (c.captureSha || c.capture_sha)
    ? P.refOf(cs, c.captureSha || c.capture_sha, label || cs.w(S + "source"), [c.extent && c.extent.page !== undefined ? cs.w(S + "page", { page: String(Number(c.extent.page) + 1) }) : ""], "capture")
    : cs.mark("gap", "undetermined", { reason: cs.w(S + "nocitation") }));
  const span = (v) => {
    if (!v) return "";
    const from = v.from ? cs.date(typeof v.from === "string" ? v.from : v.from.value || "", { year: true }) : "";
    const to = v.to ? cs.date(typeof v.to === "string" ? v.to : v.to.value || "", { year: true }) : "";
    return from || to ? cs.w(to ? S + "span" : S + "since", { from, to }) : "";
  };
  const gradeOf = (g) => (typeof g === "string" && /^[A-D]$/.test(g) ? cs.grade("capture", g)
    : g && /^[A-D]$/.test(g.assertion || "") ? cs.grade("connection", g.assertion) : cs.mark("gap", "unrated"));
  /* R22: a section that holds nothing is not drawn (loading and failed are still drawn) */
  if (!p || (p.posts || []).length) out.push(cs.sec(S + "positions", cs.state("person", view, (v) => {
    const posts = v.posts || [];
    return cs.sheet(posts.map((x) => cs.row(gradeOf(x.grade),
      `${P.refOf(cs, x.to, x.title || x.to, [x.capacity || ""])}${x.capacity ? " · " + cs.esc(x.capacity) : ""} · ${span(x.valid)}`,
      cite(x.citation))).join(""));
  })));
  const facts = p ? (p.facts || []).filter((f) => !f.withdrawn) : [];
  const kinds = ["name", "birth", "death", "locality", "address", "contact"];
  out.push(cs.sec(S + "facts", cs.state("person", view, () => (facts.length
    ? cs.sheet(facts.map((f) => cs.row(gradeOf(f.grade), `<b>${cs.w(S + "kind." + (kinds.includes(f.kind) ? f.kind : "other"))}</b> · ${cs.esc(f.value)}${span(f.valid) ? " · " + span(f.valid) : ""}`, cite(f.citation))).join(""))
    : ""))
    + cs.choice("person-fact-kind", S + "fact.kind", kinds.map((k) => [k, S + "kind." + k]), {})
    + cs.field("person-fact-value", S + "fact.value", { rec: true })
    + cs.field("person-fact-from", S + "fact.from", { type: "date" })
    + cs.field("person-fact-sha", S + "fact.sha", { help: S + "fact.sha.help" })
    + cs.field("person-fact-page", S + "fact.page", {})
    + cs.act("recordpersonfact", { label: "act.recordpersonfact.label.person" })
    + cs.field("person-follow", S + "follow.address", { help: S + "follow.help" })
    + cs.act("followregister", { label: "act.followregister.label.person" })));
  /* same person? the cluster the claims link (never merged), the candidates (not claims), and the claim acts */
  const others = p && p.cluster && Array.isArray(p.cluster.members) ? p.cluster.members.filter((m) => m !== id) : [];
  /* R21: the claims as `person` answers them, each named by its `claim_id` when withdrawn */
  const claims = p && Array.isArray(p.claims) ? p.claims : [];
  out.push(cs.sec(S + "same", (others.length ? cs.sheet(others.map((m) => cs.row("", P.refOf(cs, m, m, []), `<span class="mk-small">${cs.w(S + "same.claimed")}</span>`)).join(""))
      : p && p.cluster && p.cluster.state === "undetermined" ? cs.mark("gap", "undetermined", { reason: p.cluster.why || "" }) : "")
    + (claims.length ? cs.sheet(claims.map((c) => cs.row(cs.grade("subject", c.grade || ""),
      `<b>${cs.w(S + "claim." + (["same_as", "not_same_as", "unsure"].includes(c.kind) ? c.kind : "unsure"))}</b> · ${P.refOf(cs, c.a === id ? c.b : c.a, c.a === id ? c.b : c.a, [])} · ${cs.esc(c.why || "")}`
      + ` <span class="mk-small">${cs.w(S + "claim.by", { by: String(c.by || "").replace(/^member:/, ""), date: cs.date(c.at || "") })}</span>`,
      cs.act("withdrawidentityclaim", { label: "act.withdrawidentityclaim.label.person", data: { claim: c.claim_id } }))).join("")) : "")
    + cs.state("candidates", view, (v) => ((v.candidates || []).length
      ? `<p class="mk-small">${cs.w(S + "candidates")}</p>` + cs.sheet(v.candidates.map((c) => cs.row("", P.refOf(cs, c.entity_id, c.entity_id, []),
        `<span class="mk-small">${["names", "identifiers", "posts", "life"].map((k) => cs.w(S + "field." + k) + ": " + cs.w(S + "state." + ((c.fields && c.fields[k] && c.fields[k].state) || "absent"))).join(" · ")}</span>`)).join(""))
      : ""))
    + cs.choice("person-claim-other", S + "claim.other", view.parts.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || r.entity })).filter((o) => o.value !== id), {})
    + cs.choice("person-claim-kind", S + "claim.kind", [["same_as", S + "claim.same_as"], ["not_same_as", S + "claim.not_same_as"], ["unsure", S + "claim.unsure"]], {})
    + cs.choice("person-claim-basis", S + "claim.basis", [["testimony", S + "basis.testimony"], ["name", S + "basis.name"], ["corroborated_name", S + "basis.corroborated_name"], ["identifier", S + "basis.identifier"]], {})
    + cs.field("person-claim-sha-a", S + "claim.sha.a", {}) + cs.field("person-claim-sha-b", S + "claim.sha.b", {})
    + cs.field("person-claim-note", S + "claim.note", { area: true, rec: true })
    + cs.act("identityclaim", { label: "act.identityclaim.label.person" })
));
  /* R1: removing a fact for good: the consequence statement (op-grades R21), filled with the day and the member, the
     law or order that requires it, and the Irreversible act (the shell's dialog; read only at the phone width) */
  const removable = facts.filter((f) => f.fact_id);
  if (removable.length) {
    out.push(cs.sec(S + "expunge.head",
      `<div class="cs-dialog" data-consequence="personexpunge"><p class="ends">${cs.w(S + "expunge.statement", { date: cs.date(P.today(cs), { year: true }), member: (view.me && view.me.handle) || "" })}</p>`
      + cs.choice("person-x-fact", S + "expunge.fact", removable.map((f) => ({ value: f.fact_id, text: (f.kind || "") + ": " + (f.value || "") })), {})
      + cs.choice("person-x-ground", S + "expunge.ground", [["court_order", S + "ground.court_order"], ["unlawful", S + "ground.unlawful"], ["confidential", S + "ground.confidential"], ["lawful_demand", S + "ground.lawful_demand"]], {})
      + cs.field("person-x-order", S + "expunge.order", { rec: true, help: S + "expunge.order.help" })
      + cs.act("personexpunge", { label: "act.personexpunge.label.person", tone: "primary" }) + "</div>"));
  }
  return out.join("");
}

const acts = [
  { op: "person", label: "act.person.label.person",
    send(view) { return { query: { id: String(view.subject || ""), at: new Date(Date.now()).toISOString().slice(0, 10) } }; } },
  { op: "explore", label: "act.explore.label.person",
    send(view, el, cs) {
      if (el && el.dataset && el.dataset.node) {
        const node = String(el.dataset.node);
        const t = Array.isArray(view.ui.trail) && view.ui.trail.length ? view.ui.trail : [String(view.ui.centre || view.subject || "")];
        const i = t.indexOf(node);
        view.ui.trail = i >= 0 ? t.slice(0, i + 1) : t.concat([node]);
        cs.set("centre", node);
        return null;
      }
      cs.go("explore", String(view.subject || ""));
      return null;
    } },
  { op: "recordpersonfact", label: "act.recordpersonfact.label.person",
    send(view, el, cs) {
      const value = String(cs.value("person-fact-value") || "").trim();
      const citation = view.parts.passage(cs.value("person-fact-sha"), cs.value("person-fact-page"));
      if (!value || !citation) return { refuse: "screen.person.fact.empty" };
      const from = String(cs.value("person-fact-from") || "").trim();
      return { body: { person: String(view.subject || ""), kind: String(cs.value("person-fact-kind") || "name"), value,
        valid: { from: from || null, to: null }, citation } };
    } },
  { op: "identityclaim", label: "act.identityclaim.label.person", reasonField: "note",
    send(view, el, cs) {
      const b = String(cs.value("person-claim-other") || "").trim();
      const note = String(cs.value("person-claim-note") || "").trim();
      if (!b || !note) return { refuse: "screen.person.claim.empty" };
      const basis = String(cs.value("person-claim-basis") || "testimony");
      const body = { a: String(view.subject || ""), b, kind: String(cs.value("person-claim-kind") || "same_as"), basis, note };
      if (basis !== "testimony") {
        const ea = view.parts.passage(cs.value("person-claim-sha-a")), eb = view.parts.passage(cs.value("person-claim-sha-b"));
        if (!ea || !eb) return { refuse: "screen.person.claim.evidence" };
        body.evidence = { a: ea, b: eb };
      }
      return { body };
    },
    },
  { op: "withdrawidentityclaim", label: "act.withdrawidentityclaim.label.person",
    send(view, el, cs) {
      const claimId = String((el && el.dataset && el.dataset.claim) || "").trim();
      if (!claimId) return null;
      return { body: { claimId } };
    } },
  { op: "followregister", label: "act.followregister.label.person",
    send(view, el, cs) {
      const address = String(cs.value("person-follow") || "").trim();
      if (!/^https:\/\//.test(address)) return { refuse: "screen.person.follow.empty" };
      return { body: { address } };
    } },
  { op: "personexpunge", label: "act.personexpunge.label.person", dialog: [{ name: "reason", label: "screen.person.expunge.reason" }],
    send(view, el, cs, extra) {
      const id = String(cs.value("person-x-fact") || "");
      const ground = String(cs.value("person-x-ground") || "");
      const order = String(cs.value("person-x-order") || "").trim();
      const reason = String((extra && extra.fields && extra.fields.reason) || "").trim();
      if (!id || !reason) return { refuse: "screen.person.expunge.empty" };
      if (ground === "court_order" && !order) return { refuse: "screen.person.expunge.noorder" };
      return { body: Object.assign({ id, ground, reason }, ground === "court_order" ? { order } : {}) };
    } },
];

const PERSON_KEYS = [
  "screen.person.g.cited", "screen.person.g.declared", "screen.person.g.hunch", "screen.person.g.nosource", "screen.person.connections",
  "screen.person.connections.holds", "screen.person.source", "screen.person.page", "screen.person.nocitation", "screen.person.span",
  "screen.person.since", "screen.person.positions", "screen.person.positions.holds", "screen.person.facts", "screen.person.kind.name",
  "screen.person.kind.birth", "screen.person.kind.death", "screen.person.kind.locality", "screen.person.kind.address", "screen.person.kind.contact",
  "screen.person.kind.other", "screen.person.fact.kind", "screen.person.fact.value", "screen.person.fact.from", "screen.person.fact.sha",
  "screen.person.fact.sha.help", "screen.person.fact.page", "screen.person.fact.empty", "screen.person.follow.address", "screen.person.follow.help",
  "screen.person.follow.empty", "screen.person.same", "screen.person.same.holds", "screen.person.same.claimed", "screen.person.candidates",
  "screen.person.field.names", "screen.person.field.identifiers", "screen.person.field.posts", "screen.person.field.life",
  "screen.person.state.agrees", "screen.person.state.differs", "screen.person.state.absent", "screen.person.claim.other", "screen.person.claim.kind",
  "screen.person.claim.same_as", "screen.person.claim.not_same_as", "screen.person.claim.unsure", "screen.person.claim.basis",
  "screen.person.basis.testimony", "screen.person.basis.name", "screen.person.basis.corroborated_name", "screen.person.basis.identifier",
  "screen.person.claim.sha.a", "screen.person.claim.sha.b", "screen.person.claim.note", "screen.person.claim.empty", "screen.person.claim.evidence",
  "screen.person.claim.by", "screen.person.expunge.head", "screen.person.expunge.statement", "screen.person.expunge.fact",
  "screen.person.expunge.ground", "screen.person.ground.court_order", "screen.person.ground.unlawful", "screen.person.ground.confidential",
  "screen.person.ground.lawful_demand", "screen.person.expunge.order", "screen.person.expunge.order.help", "screen.person.expunge.reason",
  "screen.person.expunge.empty", "screen.person.expunge.noorder",
];

const words = ["screen.person.name", "screen.person.purpose",
  ...["person", "explore", "recordpersonfact", "identityclaim", "withdrawidentityclaim", "followregister"].flatMap((op) => ["act." + op + ".label.person", "act." + op + ".does"]),
  "act.personexpunge.label.person", "act.personexpunge.does",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.scale.subject.name", "mark.scale.subject.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  ...GRAPH_SHARED,
  "state.empty", "state.loading", "state.failed", ...PERSON_KEYS];

export const PERSON_SCREEN = Object.freeze({ id: "person", ABSENT_CODES: Object.freeze(["NO_ENTITY", "NO_CALC"]), reads, render, acts, words, parts: PARTS });
