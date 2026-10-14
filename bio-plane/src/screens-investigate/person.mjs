/* screens-investigate R1: a person the record follows (People › Person; registry screen `person`, its 7 acts with
 * "Explore connections"; N719; DEC-142, DEC-170, DEC-181). Reads `people`' `person` (as of the page's own day: the read
 * takes a date, never "now") and `samepersoncandidates`. Each position and fact is a reference to its source passage; a
 * fact is removed for good only by `personexpunge`, behind its consequence statement (op-grades R21), with the
 * Irreversible weight, and at the phone width it is read and not done (interface-shell R11). */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

const S = "screen.person.";

function reads(view) {
  const S = "screen.person.";
  const id = String(view.subject || "");
  const at = new Date(Date.now()).toISOString().slice(0, 10);
  return {
    person: { op: "person", query: { id, at }, subject: true, empty: (v) => !v || v.found === false },
    candidates: { op: "samepersoncandidates", query: { id } },
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
  out.push(`<div class="cs-actrow">${cs.act("person", { label: "act.person.label.person" })}${cs.act("explore", { label: "act.explore.label.person", data: { entity: id } })}</div>`);
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
  out.push(cs.sec(S + "positions", cs.state("person", view, (v) => {
    const posts = v.posts || [];
    if (!posts.length) return `<p>${cs.w(S + "positions.none")}</p>`;
    return cs.sheet(posts.map((x) => cs.row(gradeOf(x.grade),
      `${P.refOf(cs, x.to, x.title || x.to, [x.capacity || ""])}${x.capacity ? " · " + cs.esc(x.capacity) : ""} · ${span(x.valid)}`,
      cite(x.citation))).join(""));
  })));
  const facts = p ? (p.facts || []).filter((f) => !f.withdrawn) : [];
  const kinds = ["name", "birth", "death", "locality", "address", "contact"];
  out.push(cs.sec(S + "facts", cs.state("person", view, () => (facts.length
    ? cs.sheet(facts.map((f) => cs.row(gradeOf(f.grade), `<b>${cs.w(S + "kind." + (kinds.includes(f.kind) ? f.kind : "other"))}</b> · ${cs.esc(f.value)}${span(f.valid) ? " · " + span(f.valid) : ""}`, cite(f.citation))).join(""))
    : `<p>${cs.w(S + "facts.none")}</p>`))
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
  const mine = Array.isArray(view.ui.claims) ? view.ui.claims : [];
  out.push(cs.sec(S + "same", (others.length ? cs.sheet(others.map((m) => cs.row("", P.refOf(cs, m, m, []), `<span class="cs-meta">${cs.w(S + "same.claimed")}</span>`)).join(""))
      : p && p.cluster && p.cluster.state === "undetermined" ? cs.mark("gap", "undetermined", { reason: p.cluster.why || "" }) : `<p>${cs.w(S + "same.none")}</p>`)
    + (mine.length ? cs.sheet(mine.map((c) => cs.row(cs.grade("subject", c.grade || ""), cs.esc(c.why || "") + ` <span class="cs-meta">${cs.esc(c.claim_id)}</span>`,
      cs.act("withdrawidentityclaim", { label: "act.withdrawidentityclaim.label.person", data: { claim: c.claim_id } }))).join("")) : "")
    + cs.state("candidates", view, (v) => ((v.candidates || []).length
      ? `<p class="cs-meta">${cs.w(S + "candidates")}</p>` + cs.sheet(v.candidates.map((c) => cs.row("", P.refOf(cs, c.entity_id, c.entity_id, []),
        `<span class="cs-meta">${["names", "identifiers", "posts", "life"].map((k) => cs.w(S + "field." + k) + ": " + cs.w(S + "state." + ((c.fields && c.fields[k] && c.fields[k].state) || "absent"))).join(" · ")}</span>`)).join(""))
      : `<p class="cs-meta">${cs.w(S + "candidates.none")}</p>`))
    + cs.field("person-claim-other", S + "claim.other", { help: S + "claim.other.help" })
    + cs.choice("person-claim-kind", S + "claim.kind", [["same_as", S + "claim.same_as"], ["not_same_as", S + "claim.not_same_as"], ["unsure", S + "claim.unsure"]], {})
    + cs.choice("person-claim-basis", S + "claim.basis", [["testimony", S + "basis.testimony"], ["name", S + "basis.name"], ["corroborated_name", S + "basis.corroborated_name"], ["identifier", S + "basis.identifier"]], {})
    + cs.field("person-claim-sha-a", S + "claim.sha.a", {}) + cs.field("person-claim-sha-b", S + "claim.sha.b", {})
    + cs.field("person-claim-note", S + "claim.note", { area: true, rec: true })
    + cs.act("identityclaim", { label: "act.identityclaim.label.person" })
    + cs.field("person-claim-id", S + "claim.id", { help: S + "claim.id.help" })
    + cs.act("withdrawidentityclaim", { label: "act.withdrawidentityclaim.label.person" })));
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
    send(view, el, cs) { cs.go("explore", String(view.subject || "")); return null; } },
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
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.claim_id) cs.set("claims", (Array.isArray(view.ui.claims) ? view.ui.claims : []).concat([{ claim_id: r.claim_id, grade: r.grade, why: r.why }]));
    } },
  { op: "withdrawidentityclaim", label: "act.withdrawidentityclaim.label.person",
    send(view, el, cs) {
      const claimId = String((el && el.dataset && el.dataset.claim) || cs.value("person-claim-id") || "").trim();
      if (!claimId) return { refuse: "screen.person.claim.noid" };
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

export const PERSON_WORDS = [
  row(S + "source", "the source passage"),
  row(S + "page", "page {page}"),
  row(S + "nocitation", "the record holds no passage for this"),
  row(S + "span", "{from}–{to}"),
  row(S + "since", "since {from}"),
  row(S + "positions", "Positions"),
  row(S + "positions.holds", "The posts and offices the record holds for this person, each dated and cited, with how easily the link can be checked."),
  row(S + "positions.none", "The record holds no position for this person yet."),
  row(S + "facts", "Career, credentials, memberships, interests and statements"),
  row(S + "facts.none", "The record holds no other fact about this person yet."),
  row(S + "kind.name", "Name"),
  row(S + "kind.birth", "Born"),
  row(S + "kind.death", "Died"),
  row(S + "kind.locality", "Where they live or work"),
  row(S + "kind.address", "Address"),
  row(S + "kind.contact", "Contact"),
  row(S + "kind.other", "Fact"),
  row(S + "fact.kind", "What the passage says"),
  row(S + "fact.value", "The fact, as the passage states it"),
  row(S + "fact.from", "True from (optional)"),
  row(S + "fact.sha", "The document it is read from"),
  row(S + "fact.sha.help", "The document's fingerprint, as its page shows it. The fact cites the passage."),
  row(S + "fact.page", "Page (optional)"),
  row(S + "fact.empty", "Give the fact as the passage states it and the document it comes from."),
  row(S + "follow.address", "The register's address"),
  row(S + "follow.help", "A public register (licences, filings) that lists this person. You are told when an entry changes."),
  row(S + "follow.empty", "Give the register's public address, starting https://."),
  row(S + "same", "Same person?"),
  row(S + "same.holds", "Records claimed to be this person stay linked, never merged; each claim is graded and anyone can see its reason or withdraw it with theirs."),
  row(S + "same.claimed", "claimed the same person; the records stay linked, never merged"),
  row(S + "same.none", "No other record is claimed to be this person."),
  row(S + "candidates", "Records that might be the same person. These are not claims: a member decides."),
  row(S + "candidates.none", "No other record looks like the same person."),
  row(S + "field.names", "names"),
  row(S + "field.identifiers", "identifiers"),
  row(S + "field.posts", "posts"),
  row(S + "field.life", "birth and death"),
  row(S + "state.agrees", "agree"),
  row(S + "state.differs", "differ"),
  row(S + "state.absent", "not recorded"),
  row(S + "claim.other", "The other record"),
  row(S + "claim.other.help", "The record you say is, or is not, this person."),
  row(S + "claim.kind", "You say"),
  row(S + "claim.same_as", "It is the same person"),
  row(S + "claim.not_same_as", "It is not the same person"),
  row(S + "claim.unsure", "You are unsure"),
  row(S + "claim.basis", "Because"),
  row(S + "basis.testimony", "I know it myself"),
  row(S + "basis.name", "Both records carry the name"),
  row(S + "basis.corroborated_name", "The name, and the same post on the dates cited"),
  row(S + "basis.identifier", "The same identifier, on the dates cited"),
  row(S + "claim.sha.a", "The document for this person (unless you know it yourself)"),
  row(S + "claim.sha.b", "The document for the other record"),
  row(S + "claim.note", "Why, in your words"),
  row(S + "claim.empty", "Name the other record and say why."),
  row(S + "claim.evidence", "This basis cites a document for each record."),
  row(S + "claim.id", "The claim to withdraw"),
  row(S + "claim.noid", "Name the claim to withdraw."),
  row(S + "claim.id.help", "A claim made earlier, by its id (IDC-…); one made here is withdrawn from its own row."),
  row(S + "expunge.head", "Correction"),
  row(S + "expunge.statement", "This removes the value for good: from the person's page, from every question that cited it and from every export. It cannot be undone, by you or by anyone. A marker stays in its place: \"Removed where the law requires, {date}, by {member}\". Published cases change only through the docket. Confirm with a reason naming the law or order that requires it: \"Remove it for good, with this reason\".", true),
  row(S + "expunge.fact", "The value to remove"),
  row(S + "expunge.ground", "What requires it"),
  row(S + "ground.court_order", "A court order"),
  row(S + "ground.unlawful", "Holding it is unlawful"),
  row(S + "ground.confidential", "The law makes it confidential"),
  row(S + "ground.lawful_demand", "A lawful demand"),
  row(S + "expunge.order", "The order"),
  row(S + "expunge.order.help", "For a court order: which order, as captured."),
  row(S + "expunge.reason", "The law or order that requires it", true),
  row(S + "expunge.empty", "Choose the value and name the law or order that requires its removal."),
  row(S + "expunge.noorder", "Name the court order."),
];

const words = ["screen.person.name", "screen.person.purpose",
  ...["person", "explore", "recordpersonfact", "identityclaim", "withdrawidentityclaim", "followregister"].flatMap((op) => ["act." + op + ".label.person", "act." + op + ".does"]),
  "act.personexpunge.label.person", "act.personexpunge.does",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.scale.subject.name", "mark.scale.subject.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "state.empty", "state.loading", "state.failed", ...PERSON_WORDS];

export const PERSON_SCREEN = Object.freeze({ id: "person", reads, render, acts, words, parts: PARTS });
