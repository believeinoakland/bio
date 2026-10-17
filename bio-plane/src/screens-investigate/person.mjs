/* screens-investigate R1: a person the record follows (People › Person; registry screen `person`; N719; DEC-142, DEC-170,
 * DEC-181, DEC-233). Reads `people`' `person` (as of the page's own day: the read takes a date, never "now") and
 * `samepersoncandidates`. Each position and fact is a reference to its source passage; a fact is removed for good only by
 * `personexpunge`, behind its consequence statement (op-grades R21), with the Irreversible weight, and at the phone width it
 * is read and not done (interface-shell R11).
 * R32: what the team says about them (other names, declared ties, the documents that may name them), every fact recorded
 * (those valid today, those whose validity is not settled, the withdrawn in a fold), and a sentence in place of an empty
 * graph. R38, R39: "Same person?" in the design's words, its two acts each explained. */

import { PARTS } from "./parts.mjs";
import { GRAPH_SHARED, FORM_SHARED } from "./graphwords.mjs";

function reads(view) {
  const id = String(view.subject || "");
  const at = new Date(Date.now()).toISOString().slice(0, 10);
  return {
    person: { op: "person", query: { id, at }, subject: true, empty: (v) => !v || v.found === false },
    candidates: { op: "samepersoncandidates", query: { id } },
    vocab: { op: "affordances", query: {} },
    people: { op: "peopledirectory", query: { limit: "200" } },
    entity: { op: "entity", query: { id } },
    naming: { op: "readingname", query: { entity: id } },
    docs: { op: "heldcaptures", query: { limit: "200" }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length },
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
  /* R32 (3): the person's own page has no "Open the person" */
  out.push(`<div class="mk-acts">${cs.act("explore", { label: "act.explore.label.person", data: { entity: id } })}</div>`);
  const vocab = view.data.vocab && view.data.vocab.state === "ok" ? view.data.vocab.value : null;
  const groups = P.groupMap(vocab);
  const ent = view.data.entity && view.data.entity.state === "ok" && view.data.entity.value ? view.data.entity.value.entity : null;
  const org = !!(ent && ent.kind && ent.kind !== "person");
  const who = P.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || "" }));
  const nameOf = (x) => (who.find((o) => o.value === x) || {}).text || P.plain(cs, "connection.node.unnamed");
  const docTitle = (sha) => {
    const rows = view.data.docs && view.data.docs.state === "ok" && view.data.docs.value && Array.isArray(view.data.docs.value.held) ? view.data.docs.value.held : [];
    const r = rows.find((x) => x && x.capture && x.capture.sha256 === sha);
    return (r && r.title) || "";
  };
  const handleOf = (by) => String(by || "").replace(/^member:/, "");
  /* R18: "Connections": the graph from this person, as of today, two rings out; a node pressed becomes the centre */
  const centre = String(view.ui.centre || id);
  const gq = P.later(cs, view, "graph", "exploregraph", { body: { centre, at: { value: P.today(cs), precision: "day", zone: "UTC" }, rings: 2 } });
  out.push(cs.sec(S + "connections", cs.state(gq, (g) => (g && Array.isArray(g.nodes) && !(Array.isArray(g.steps) ? g.steps : []).length && g.nodes.length <= 1
    ? `<p class="cs-state" data-state="empty">${cs.w("person.graph.none")}</p>`
    : P.graph(cs, g, { groupOf: (k) => groups[k] || null, trail: Array.isArray(view.ui.trail) && view.ui.trail.length ? view.ui.trail : [centre], act: "explore", names: { [id]: name },
      words: { cited: S + "g.cited", declared: S + "g.declared", hunch: S + "g.hunch", nosource: S + "g.nosource", attached: "screen.explore.attached", withdraw: "screen.explore.withdraw" } })))));
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
      `${P.refOf(cs, x.to, x.title || nameOf(x.to), [x.capacity || ""])}${x.capacity ? " · " + cs.esc(x.capacity) : ""} · ${span(x.valid)}`,
      cite(x.citation))).join(""));
  })));
  /* R32 (2): every fact recorded about the person: those valid today, then those whose validity is not stated or settled,
     each marked undetermined with its reason and source, and the withdrawn ones apart in a fold; none dropped */
  const kinds = ["name", "birth", "death", "locality", "address", "contact"];
  const kindWord = (f) => cs.w(S + "kind." + (kinds.includes(f.kind) ? f.kind : "other"));
  const factRow = (f) => cs.row(gradeOf(f.grade), `<b>${kindWord(f)}</b> · ${cs.esc(f.value)}${span(f.valid) ? " · " + span(f.valid) : ""}`, cite(f.citation));
  const standing = p ? (p.facts || []).filter((f) => !f.withdrawn) : [];
  const undet = p ? (p.undetermined || []).filter((f) => f && f.fact_id && !f.withdrawn) : [];
  const have = new Set(standing.map((f) => f.fact_id));
  const undetRows = undet.filter((f) => !have.has(f.fact_id));
  const withdrawn = p ? (p.facts || []).concat(p.undetermined || []).filter((f) => f && f.fact_id && f.withdrawn) : [];
  const seen = new Set();
  const gone = withdrawn.filter((f) => (seen.has(f.fact_id) ? false : seen.add(f.fact_id)));
  const undetLine = (f) => {
    const c = f.citation || {};
    const sha = c.captureSha || c.capture_sha || "";
    const reason = !f.valid ? P.plain(cs, "people.why.validity_stated") : String((f.undetermined && f.undetermined.why) || "");
    const document = docTitle(sha) || (sha ? P.plain(cs, S + "source") : "");
    return cs.row(gradeOf(f.grade), `<b>${kindWord(f)}</b> · ${cs.esc(f.value)}`,
      `${cs.mark("gap", "undetermined", { reason })} <span class="mk-small">${cs.w(S + "facts.undetermined", { reason: cs.esc(reason), document: cs.esc(document) })}</span> ${cite(c)}`);
  };
  const goneLine = (f) => {
    const w = f.withdrawn || {};
    return cs.row(gradeOf(f.grade), `<b>${kindWord(f)}</b> · ${cs.esc(f.value)}`,
      `<span class="mk-small">${cs.w(S + "facts.withdrawn.by", { name: cs.esc(String(w.handle || w.by_handle || handleOf(w.by))), date: cs.date(w.at || "", { year: true }), reason: cs.esc(String(w.reason || "")) })}</span>`);
  };
  const removable = standing.filter((f) => f.fact_id);
  const factsInner = cs.state("person", view, () => (standing.length ? cs.sheet(standing.map(factRow).join("")) : "")
    + (undetRows.length ? cs.sheet(undetRows.map(undetLine).join("")) : "")
    + (gone.length ? `<details class="mk-details"><summary>${cs.w(S + "facts.withdrawn", { n: String(gone.length) })}</summary>${cs.sheet(gone.map(goneLine).join(""))}</details>` : ""))
    + cs.choice("person-fact-kind", S + "fact.kind", kinds.map((k) => [k, S + "kind." + k]), {})
    + cs.field("person-fact-value", S + "fact.value", { rec: true })
    + cs.field("person-fact-from", S + "fact.from", { type: "date" })
    + P.docChoice(cs, view, "person-fact-doc")
    + cs.act("recordpersonfact", { label: "act.recordpersonfact.label.person" })
    + cs.field("person-follow", S + "follow.address", { help: S + "follow.help" })
    + cs.act("followregister", { label: "act.followregister.label.person" });
  out.push(cs.sec(S + "facts", factsInner));

  /* R32 (1): what the team says about them: other names, ties a member declared, and the documents that may name them */
  if (ent) {
    const says = [];
    const aliases = (ent.aliases || []).filter((a) => !a.withdrawn);
    const aliasRow = (a) => cs.row("", `<b>${cs.esc(a.alias)}</b>`,
      `<span class="mk-small">${/^member:/.test(String(a.declared_by || "")) ? cs.w("entity.alias.by", { who: cs.esc(handleOf(a.declared_by)), date: cs.date(a.at || "", { year: true }) }) : cs.w("entity.alias.roster")}</span>`
      + (!a.canonical && /^member:/.test(String(a.declared_by || "")) ? cs.act("aliaswithdraw", { label: "act.owed_aliaswithdraw.label.person", data: { alias: a.alias } }) : ""));
    says.push(cs.sec("entity.alias.title", (aliases.length ? cs.sheet(aliases.map(aliasRow).join("")) : "")
      + cs.field("person-alias", org ? "entity.alias.label.org" : "entity.alias.label", { help: "entity.alias.help" })
      + cs.act("entityalias", { label: "entity.alias.add" })));
    const rels = (ent.relations || []).filter((r) => !r.withdrawn);
    const relRow = (r) => {
      const other = r.direction === "in" ? r.from_entity : r.to_entity;
      const kind = ["member_of", "proxy_for", "overlaps"].includes(r.relation) ? r.relation : "overlaps";
      return cs.row("", `<b>${cs.w("entity.relation." + kind)}</b> · ${P.refOf(cs, other, nameOf(other), [])}`,
        `<span class="mk-small">${cs.w("entity.relation.declared", { who: cs.esc(handleOf(r.declared_by)), date: cs.date(r.at || "", { year: true }), where: cs.esc(String(r.citation || "")) })}</span>`
        + (r.justification ? ` <span class="rec">${cs.esc(r.justification)}</span>` : ""));
    };
    says.push(cs.sec("entity.relation.title", (rels.length ? cs.sheet(rels.map(relRow).join("")) : `<p class="cs-state" data-state="empty">${cs.w("entity.relation.none")}</p>`)
      + cs.choice("person-rel-kind", "entity.relation.kind", ["member_of", "proxy_for", "overlaps"].map((k) => [k, "entity.relation." + k]), {})
      + `<p class="mk-small">${cs.w("entity.relation.kind.help")}</p>`
      + cs.choice("person-rel-with", "entity.relation.with", who.filter((o) => o.value !== id), {})
      + cs.field("person-rel-why", "entity.relation.why", { area: true, rec: true })
      + (view.reachable ? cs.act("writinghelp", { label: "act.writinghelp.label.person", data: { field: "justification" } }) : "")
      + cs.field("person-rel-cite", "entity.relation.cite", { help: "entity.relation.cite.help" })
      + cs.act("relationdeclare", { label: "entity.relation.declare" })));
    const nm = view.data.naming && view.data.naming.state === "ok" && view.data.naming.value ? view.data.naming.value : null;
    const docs = nm ? (nm.documents || []).filter((x) => x && x.capture_sha) : [];
    if (docs.length) {
      const docRow = (x) => cs.row("", `<b>${P.refOf(cs, x.bundle_id || x.capture_sha, x.label || x.ref || P.plain(cs, S + "source"), [x.matched_alias || ""], x.bundle_id ? "document" : "capture")}</b>`
        + ` <span class="mk-small">${x.page !== undefined ? cs.w("entity.naming.row", { page: String(x.page), alias: cs.esc(x.matched_alias || "") }) : cs.esc(x.matched_alias || "")}</span>`,
      cs.act("resolve", { label: "entity.naming.match", data: { sha: x.capture_sha, ref: x.ref } })
        + cs.act("resolvetestify", { label: "entity.naming.testify", data: { sha: x.capture_sha, ref: x.ref } }));
      says.push(cs.sec("entity.naming.title", `<p class="mk-small">${cs.w("entity.naming.says")}</p>` + cs.sheet(docs.map(docRow).join(""))
        + cs.field("person-naming-basis", "entity.naming.basis", { area: true, rec: true, help: "entity.naming.basis.help" })
        + (view.reachable ? cs.act("writinghelp", { label: "act.writinghelp.label.person", data: { field: "basis" } }) : "")));
    }
    says.push(`<div class="mk-acts">${cs.act("connect", { label: org ? "entity.connect.org" : "entity.connect" })}</div>`);
    out.push(cs.sec(org ? "entity.says.title.org" : "entity.says.title", says.join(""), { help: org ? "entity.says.help.org" : "entity.says.help" }));
  }

  /* R38, R39: "Same person?": the standing claims as rows, the cluster the claims link (never merged), the candidates (not
     claims), and the two claim acts, each explained where it stands */
  const others = p && p.cluster && Array.isArray(p.cluster.members) ? p.cluster.members.filter((m) => m !== id) : [];
  const claims = p && Array.isArray(p.claims) ? p.claims.filter((c) => c && !c.withdrawn) : [];
  const bases = ["identifier", "corroborated_name", "name", "testimony"];
  const claimRow = (c, i) => {
    const kind = ["same_as", "not_same_as", "unsure"].includes(c.kind) ? c.kind : "unsure";
    const otherId = c.a === id ? c.b : c.a;
    const because = bases.includes(c.basis) ? cs.w(S + "same.because", { grade: cs.esc(c.grade || ""), basis: cs.w(S + "basis.row." + c.basis) }) : cs.esc(c.why || "");
    return cs.row(cs.grade("subject", c.grade || ""),
      `<b>${cs.w("label.identityclaimkinds." + kind)}</b> · ${P.refOf(cs, otherId, nameOf(otherId), [])} · ${because}`
      + ` <span class="mk-small">${cs.w(S + "claim.by", { by: cs.esc(handleOf(c.by)), date: cs.date(c.at || "") })}</span>`
      + (c.why && bases.includes(c.basis) ? ` <span class="rec">${cs.esc(c.why)}</span>` : ""),
      `<details class="mk-details" open><summary>${cs.w("act.withdrawidentityclaim.label.person")}</summary><p class="mk-small">${cs.w("act.withdrawidentityclaim.does")}</p>`
        + cs.field("person-wd-reason-" + i, S + "claim.withdraw.reason", { area: true, rec: true })
        + cs.act("withdrawidentityclaim", { label: "act.withdrawidentityclaim.label.person", data: { claim: c.claim_id, field: "person-wd-reason-" + i } }) + "</details>");
  };
  const cand = view.data.candidates;
  const fieldsWord = (c, state) => ["names", "identifiers", "posts", "life"].filter((k) => c.fields && c.fields[k] && c.fields[k].state === state).map((k) => P.plain(cs, S + "field." + k)).join(", ");
  const candList = cand && cand.state === "ok" && cand.value && Array.isArray(cand.value.candidates) ? cand.value.candidates : [];
  const candOptions = candList.map((c) => ({ value: c.entity_id, text: P.plain(cs, S + "claim.candidate", { record: nameOf(c.entity_id), agrees: fieldsWord(c, "agrees"), differs: fieldsWord(c, "differs") }) }));
  const otherOptions = candOptions.length ? candOptions : who.filter((o) => o.value !== id);
  const basisNow = bases.includes(view.ui["choice:person-claim-basis"]) ? view.ui["choice:person-claim-basis"] : "testimony";
  const claimForm = !(cand && cand.state === "loading") && !(cand && cand.state === "failed") && otherOptions.length
    ? `<details class="mk-details" open><summary>${cs.w("act.identityclaim.label.person")}</summary><p class="mk-small">${cs.w("act.identityclaim.does")}</p>`
      + cs.choice("person-claim-other", S + "claim.other", otherOptions, {})
      + cs.choice("person-claim-kind", S + "claim.kind", ["same_as", "not_same_as", "unsure"].map((k) => [k, S + "claim.kind." + k]), {})
      + cs.choice("person-claim-basis", S + "claim.basis", bases.map((b) => [b, "label.claimbases." + b]), { acts: {} })
      + `<p class="mk-small">${cs.w(S + "claim.basis.help")}</p>`
      + (basisNow !== "testimony" ? `<p class="mk-small">${cs.w(S + "claim.evidence")}</p>`
        + P.docChoice(cs, view, "person-claim-doc-a", { label: S + "claim.sha.a", passage: false }) + P.docChoice(cs, view, "person-claim-doc-b", { label: S + "claim.sha.b", passage: false }) : "")
      + cs.field("person-claim-note", S + "claim.note", { area: true, rec: true })
      + cs.act("identityclaim", { label: "act.identityclaim.label.person" })
      + (view.ui.claimEmpty ? `<details class="mk-details" open><summary>${cs.w(S + "claim.empty.summary")}</summary><p>${cs.w(S + "claim.empty")}</p></details>` : "")
      + "</details>" : "";
  out.push(cs.sec(S + "same", (others.length ? cs.sheet(others.map((m) => cs.row("", P.refOf(cs, m, nameOf(m), []), `<span class="mk-small">${cs.w(S + "same.claimed")}</span>`)).join(""))
      : p && p.cluster && p.cluster.state === "undetermined" ? cs.mark("gap", "undetermined", { reason: p.cluster.why || "" }) : "")
    + (claims.length ? cs.sheet(claims.map(claimRow).join("")) : "")
    + cs.state("candidates", view, (v) => ((v.candidates || []).length ? `<p class="mk-small">${cs.w(S + "candidates")}</p>` : ""))
    + claimForm));
  /* R1: removing a fact for good: the consequence statement (op-grades R21), filled with the day and the member, the
     law or order that requires it, and the Irreversible act (the shell's dialog; read only at the phone width) */
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
      const citation = view.parts.chosen(cs, "person-fact-doc");
      if (!value || !citation) return { refuse: "screen.person.fact.empty" };
      const from = String(cs.value("person-fact-from") || "").trim();
      return { body: { person: String(view.subject || ""), kind: String(cs.value("person-fact-kind") || "name"), value,
        valid: { from: from || null, to: null }, citation } };
    } },
  { op: "identityclaim", label: "act.identityclaim.label.person", reasonField: "note",
    send(view, el, cs) {
      const b = String(cs.value("person-claim-other") || "").trim();
      const note = String(cs.value("person-claim-note") || "").trim();
      /* R38: with the other record or the note missing nothing is sent, and the fold says why */
      if (!b || !note) { cs.set("claimEmpty", true); return null; }
      view.ui.claimEmpty = false;
      const basis = String(cs.value("person-claim-basis") || "testimony");
      const body = { a: String(view.subject || ""), b, kind: String(cs.value("person-claim-kind") || "same_as"), basis, note };
      if (basis !== "testimony") {
        const ea = view.parts.chosen(cs, "person-claim-doc-a"), eb = view.parts.chosen(cs, "person-claim-doc-b");
        if (!ea || !eb) return { refuse: "screen.person.claim.evidence" };
        body.evidence = { a: ea, b: eb };
      }
      return { body };
    } },
  { op: "withdrawidentityclaim", label: "act.withdrawidentityclaim.label.person", reasonField: "reason",
    send(view, el, cs) {
      const claimId = String((el && el.dataset && el.dataset.claim) || "").trim();
      if (!claimId) return null;
      const reason = String(cs.value(String((el.dataset && el.dataset.field) || "")) || "").trim();
      if (!reason) return { refuse: "screen.person.claim.withdraw.reason" };
      return { body: { claimId, reason } };
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
  /* R32 (1): another name, a declared tie, a document matched to them, and a name taken off, each with the owner's arguments */
  { op: "entityalias", label: "entity.alias.add",
    send(view, el, cs) {
      const alias = String(cs.value("person-alias") || "").trim();
      return { body: { entityId: String(view.subject || ""), alias } };
    } },
  { op: "aliaswithdraw", label: "act.owed_aliaswithdraw.label.person",
    send(view, el) {
      const alias = String((el && el.dataset && el.dataset.alias) || "").trim();
      return alias ? { body: { entityId: String(view.subject || ""), alias } } : null;
    } },
  { op: "relationdeclare", label: "entity.relation.declare", reasonField: "justification",
    send(view, el, cs) {
      const toEntity = String(cs.value("person-rel-with") || "").trim(), justification = String(cs.value("person-rel-why") || "").trim();
      const citation = String(cs.value("person-rel-cite") || "").trim();
      return { body: { fromEntity: String(view.subject || ""), toEntity, relation: String(cs.value("person-rel-kind") || "member_of"), justification, citation } };
    } },
  { op: "resolve", label: "entity.naming.match",
    send(view, el) {
      const captureSha = String((el && el.dataset && el.dataset.sha) || ""), ref = String((el && el.dataset && el.dataset.ref) || "");
      return captureSha ? { body: { captureSha, ref } } : null;
    } },
  { op: "resolvetestify", label: "entity.naming.testify", reasonField: "basis",
    send(view, el, cs) {
      const captureSha = String((el && el.dataset && el.dataset.sha) || ""), ref = String((el && el.dataset && el.dataset.ref) || "");
      const basis = String(cs.value("person-naming-basis") || "").trim();
      if (!captureSha) return null;
      return { body: { captureSha, ref, entityId: String(view.subject || ""), basis } };
    } },
  { op: "connect", label: "entity.connect",
    send(view) { return { body: { entityId: String(view.subject || "") } }; } },
  /* the assistant's draft of the words of a tie's why or of the basis, labeled and kept only by the member's own act */
  { op: "writinghelp", label: "act.writinghelp.label.person", reasonField: "told", rereads: [],
    send(view, el, cs) {
      const field = String((el && el.dataset && el.dataset.field) || "");
      const told = String(cs.value(field === "basis" ? "person-naming-basis" : "person-rel-why") || "").trim();
      return { body: { op: field === "basis" ? "resolvetestify" : "relationdeclare", field, told } };
    },
    done(view, answer, cs) {
      const a = answer || {};
      const field = a.field === "basis" ? "person-naming-basis" : "person-rel-why";
      cs.fill(field, String(a.text || ""));
    } },
];

const PERSON_KEYS = [
  "screen.person.g.cited", "screen.person.g.declared", "screen.person.g.hunch", "screen.person.g.nosource", "screen.person.connections",
  "screen.person.connections.holds", "screen.person.source", "screen.person.page", "screen.person.nocitation", "screen.person.span",
  "screen.person.since", "screen.person.positions", "screen.person.positions.holds", "screen.person.facts", "screen.person.kind.name",
  "screen.person.kind.birth", "screen.person.kind.death", "screen.person.kind.locality", "screen.person.kind.address", "screen.person.kind.contact",
  "screen.person.kind.other", "screen.person.fact.kind", "screen.person.fact.value", "screen.person.fact.from",
  "screen.person.fact.empty", "screen.person.follow.address", "screen.person.follow.help",
  "screen.person.follow.empty", "screen.person.same", "screen.person.same.holds", "screen.person.same.claimed", "screen.person.candidates",
  "screen.person.field.names", "screen.person.field.identifiers", "screen.person.field.posts", "screen.person.field.life",
  "screen.person.claim.other", "screen.person.claim.kind",
  "screen.person.claim.kind.same_as", "screen.person.claim.kind.not_same_as", "screen.person.claim.kind.unsure", "screen.person.claim.basis", "screen.person.claim.basis.help",
  "screen.person.claim.sha.a", "screen.person.claim.sha.b", "screen.person.claim.note", "screen.person.claim.empty", "screen.person.claim.empty.summary", "screen.person.claim.evidence",
  "screen.person.claim.by", "screen.person.claim.candidate", "screen.person.claim.withdraw.reason", "screen.person.same.because",
  "screen.person.basis.row.identifier", "screen.person.basis.row.corroborated_name", "screen.person.basis.row.name", "screen.person.basis.row.testimony",
  "label.identityclaimkinds.same_as", "label.identityclaimkinds.not_same_as", "label.identityclaimkinds.unsure",
  "label.claimbases.identifier", "label.claimbases.corroborated_name", "label.claimbases.name", "label.claimbases.testimony",
  "screen.person.facts.undetermined", "screen.person.facts.withdrawn", "screen.person.facts.withdrawn.by", "people.why.validity_stated", "person.graph.none",
  "entity.says.title", "entity.says.title.org", "entity.says.help", "entity.says.help.org", "entity.alias.title", "entity.alias.label", "entity.alias.label.org",
  "entity.alias.help", "entity.alias.add", "entity.alias.by", "entity.alias.roster", "entity.relation.title", "entity.relation.kind", "entity.relation.kind.help",
  "entity.relation.member_of", "entity.relation.proxy_for", "entity.relation.overlaps", "entity.relation.with", "entity.relation.why", "entity.relation.cite",
  "entity.relation.cite.help", "entity.relation.declare", "entity.relation.declared", "entity.relation.none", "entity.naming.title", "entity.naming.says",
  "entity.naming.row", "entity.naming.match", "entity.naming.testify", "entity.naming.basis", "entity.naming.basis.help", "entity.connect", "entity.connect.org",
  "screen.person.expunge.head", "screen.person.expunge.statement", "screen.person.expunge.fact",
  "screen.person.expunge.ground", "screen.person.ground.court_order", "screen.person.ground.unlawful", "screen.person.ground.confidential",
  "screen.person.ground.lawful_demand", "screen.person.expunge.order", "screen.person.expunge.order.help", "screen.person.expunge.reason",
  "screen.person.expunge.empty", "screen.person.expunge.noorder",
];

const words = ["screen.person.name", "screen.person.purpose",
  ...["explore", "recordpersonfact", "identityclaim", "withdrawidentityclaim", "followregister", "entityalias", "relationdeclare", "resolve", "resolvetestify", "connect", "writinghelp"]
    .flatMap((op) => ["act." + op + ".label.person", "act." + op + ".does"]),
  "act.owed_aliaswithdraw.label.person", "act.owed_aliaswithdraw.does",
  "act.personexpunge.label.person", "act.personexpunge.does",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.scale.subject.name", "mark.scale.subject.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  ...GRAPH_SHARED, ...FORM_SHARED,
  "state.empty", "state.loading", "state.failed", ...PERSON_KEYS];

export const PERSON_SCREEN = Object.freeze({ id: "person", ABSENT_CODES: Object.freeze(["NO_ENTITY", "NO_CALC"]), reads, render, acts, words, parts: PARTS });
