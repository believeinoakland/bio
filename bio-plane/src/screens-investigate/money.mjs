/* screens-investigate R4: a money trail (Projects › <project> › Money trail; registry screen `money`, its 14 acts; N728;
 * K1457, K1468; DEC-176). The screen's subject is the trail (`money`' `MSR-` set; a trail names its project as its `concerns` when it
 * is started here, and a project's trails are read by `moneysets`, R28, newest first, C8), or a project: the trails it holds, listed,
 * and the start of another. Each figure is a
 * row (interface-shell R19): its kind, from, to, when it moved (the event it is tied to, never its accounting period),
 * stage, period, amount, source grade, and whether the trail includes it with its reason. A value the source does not
 * state is drawn undetermined and opens the row's panel at that item with the evidence that would help; a filter keeps
 * only rows with something undetermined (the address `…/<trail>/undetermined`). Two sources that disagree are both
 * drawn, compared, never one picked. */

import { PARTS } from "./parts.mjs";
import { GRAPH_SHARED, FORM_SHARED } from "./graphwords.mjs";
import { rereading } from "./rereads.mjs";

const S = "screen.money.";

function reads(view) {
  const S = "screen.money.";
  const id = String(view.subject || "").split("/")[0];
  return /^MSR-/.test(id)
    ? { docs: { op: "heldcaptures", after: ["acquire"], query: { limit: "200", state: "held_and_vouched", fields: "picker" }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length }, questions: { op: "list", query: { type: "inquiry", limit: "500" } }, contracts: { op: "peopledirectory", query: { show: "contracts", limit: "200" } }, trail: { op: "moneyset", query: { id }, subject: true, empty: (v) => !v || v.found === false } }
    : { project: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
      /* C8, R4: the project's trails (money R28), the owner's order (newest first) kept; the last of 500 is the owner's cut */
      trails: { op: "moneysets", query: { concerns: id, purpose: "trail", limit: "500" }, empty: (v) => !v || !Array.isArray(v.sets) || !v.sets.length } };
}

/** R8's project step: the trail's project (its `concerns`), its title as read. */
function place(view) {
  const S = "screen.money.";
  const id = String(view.subject || "").split("/")[0];
  const t = view.data && view.data.trail;
  const project = /^MSR-/.test(id) ? (t && t.state === "ok" && t.value.set && t.value.set.concerns) || "" : id;
  const L = view.ui && view.ui.later && view.ui.later.project;
  const img = /^MSR-/.test(id) ? L && L.state === "ok" ? L.value : null : view.data && view.data.project && view.data.project.state === "ok" ? view.data.project.value : null;
  const text = img && img["bundle.md"];
  const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw title is drawn */ }
  return { project: { id: String(project || ""), title: title || String(project || "") } };
}

function render(cs, view) {
  const S = "screen.money.";
  const P = view.parts;
  const [id, mode] = String(view.subject || "").split("/");
  const ui = view.ui;
  const out = [];
  if (!/^MSR-/.test(id)) {
    /* a project: the trails it holds, each opening its own page (the owner's order, newest first); with none, saying so; starting
       another is always offered */
    out.push(cs.title(cs.w("screen.money.name")));
    const tr = view.data && view.data.trails;
    out.push(cs.state(tr, (v) => cs.sheet((v.sets || []).filter((x) => x && /^MSR-/.test(String(x.set_id)))
      .map((x) => cs.row("", `<b>${P.refOf(cs, x.set_id, x.label || x.set_id, [], "money")}</b>`, "")).join("")), { empty: S + "notrail" }));
    out.push(cs.state("project", view, () => cs.field("money-label", S + "label", { help: S + "label.help" })
      + cs.act("createset", { label: "act.createset.label.money", tone: "primary" })));
    return out.join("");
  }
  const t = view.data.trail;
  const set = t && t.state === "ok" ? t.value.set || {} : null;
  if (set && /^PROJ-/.test(String(set.concerns || ""))) P.later(cs, view, "project", "image", { query: { id: set.concerns } });
  out.push(cs.title(set ? set.label || id : id, { thing: { kind: "record", facts: set ? [cs.w(S + "startedby", { by: P.who(cs, set.by) })] : [] } }));
  out.push(`<div class="mk-acts">${cs.act("recordfact", { label: S + "read", tone: "primary" })}${cs.act("createset", { label: "act.createset.label.money" })}${cs.act("committedagainstpaid", { label: "act.committedagainstpaid.label.money" })}</div>`);
  if (ui.proposeRefusal) out.push(P.said(cs, ui.proposeRefusal));
  /* the rows: every fact the trail holds, included or left out, and those read here not yet in it */
  const entries = t && t.state === "ok"
    ? (t.value.inclusions || []).map((x) => ({ key: x.fact_id, state: "included", reason: x.reason, trail: x.trail }))
      .concat((t.value.exclusions || []).map((x) => ({ key: x.fact_id, state: "excluded", reason: x.reason, trail: null })))
      .concat((t.value.proposals || []).map((x) => ({ key: x.fact_id, state: "proposed", reason: x.label, by: x.by, trail: x.trail })))
    : [];
  /* the figure is the `fact` of `money`'s answer (`{ok, found, fact}`), never the answer itself; an answer that holds none is a read that failed (C8) */
  const fact = (e) => {
    const L = P.later(cs, view, "fact:" + e.key, "money", { query: { id: e.key } });
    const f = L.state === "ok" && L.value && typeof L.value === "object" && L.value.fact && typeof L.value.fact === "object" ? L.value.fact : null;
    return L.state === "ok" && !f ? { state: "failed", value: null, refusal: { code: "", words: cs.w("shell.noanswer") } } : L.state === "ok" ? { ...L, value: f } : L;
  };
  const party = (p) => (!p ? null : p.as_written || p.entity || p.fund || p.account || null);
  /* an item the source does not state: its mark, a control that opens the row's panel at that item */
  const gap = (e, what, why) => `<button type="button" class="cs-btn" data-tone="quiet" data-shell="row" data-table="money" data-id="${cs.esc(e.key)}" aria-label="${cs.esc(cs.w(S + "gap.open", { what: cs.w(S + "col." + what) }))}">${cs.mark("gap", "undetermined", { reason: why })}</button>`;
  const gapsOf = (e, f) => {
    const g = [];
    const tr = e.trail || {};
    if (!f || !f.from || (tr.from && tr.from.stated === false)) g.push("from");
    if (!f || !f.to || (tr.to && tr.to.stated === false)) g.push("to");
    if (f && f.phase === "actual" && (!tr.moved || tr.moved.state === "undetermined")) g.push("moved");
    if (f && f.basis === "undetermined") g.push("basis");
    if (f && f.period && !f.period.to && !f.period.fiscal) g.push("period");
    return g;
  };
  const heldDocs = P.docsAll(cs, view).rows;
  const sourceLabel = (s) => {
    const r = heldDocs.find((x) => x && x.capture && x.capture.sha256 === s.capture_sha);
    const title = (r && r.title) || P.plain(cs, S + "source");
    return s.row !== undefined && s.row !== null ? P.plain(cs, "contradiction.text.row_table", { source_row: String(s.row), source_table: title }) : title;
  };
  const cells = (e) => {
    const L = fact(e);
    if (L.state !== "ok") return [cs.state(L, () => ""), "", "", "", "", "", "", "", ""];
    const f = L.value;
    const tr = e.trail || {};
    const moved = f.phase !== "actual" ? cs.w(S + "didnotmove", { phase: cs.w(S + "phase." + (f.phase || "adopted")) })
      : tr.moved && tr.moved.state === "dated" ? (cs.date((tr.moved.when && (tr.moved.when.value || tr.moved.when.start)) || "") || cs.esc((tr.moved.when && tr.moved.when.value) || ""))
        + (tr.moved.event ? " " + P.refOf(cs, tr.moved.event, cs.w(S + "event"), [cs.date((tr.moved.when && (tr.moved.when.value || tr.moved.when.start)) || "")], "event") : "")
      : gap(e, "moved", (tr.moved && tr.moved.why) || cs.w(S + "moved.why"));
    const per = f.period ? (f.period.fiscal ? cs.esc(f.period.fiscal) : f.period.to
      ? cs.w(S + "period", { from: cs.date(f.period.from || ""), to: cs.date(f.period.to) }) : gap(e, "period", cs.w(S + "period.why"))) : gap(e, "period", cs.w(S + "period.why"));
    const amount = typeof f.amount === "object" && f.amount
      ? cs.w(S + "range", { low: f.amount.low, high: f.amount.high, currency: f.currency || "" })
      : cs.w(S + "amount", { sign: f.sign === "-" ? "−" : "", amount: String(f.amount || ""), currency: f.currency || "" });
    /* R33 (K5148; WALK-FINAL-07 R61): the source is the document by its title and, for a row read from a table, its row; the plane's `citation` names
       the capture and the binding by their fingerprints, which a member never reads */
    const src = f.source && f.source.capture_sha ? P.refOf(cs, f.source.capture_sha, sourceLabel(f.source), [f.as_read || ""], "capture") : "";
    const grade = f.grade && /^[A-D]$/.test(f.grade.reading || "") ? cs.grade("capture", f.grade.reading) : cs.mark("gap", "unrated");
    const inTrail = e.state === "included" ? cs.w(S + "included", { reason: e.reason || "" }) : e.state === "excluded" ? cs.w(S + "excluded", { reason: e.reason || "" })
      : e.state === "proposed" ? cs.w(/^(class|machine|agent):/.test(String(e.by || "")) ? S + "proposed" : S + "proposed.member") : cs.w(S + "notyet");
    return [cs.esc(cs.w(S + "kind." + String(f.kind || "other").replace(/ /g, "_"))),
      party(f.from) ? P.refOf(cs, (f.from && (f.from.entity || f.from.fund)) || "", party(f.from), []) : gap(e, "from", (tr.from && tr.from.says) || cs.w(S + "notstated")),
      party(f.to) ? P.refOf(cs, (f.to && (f.to.entity || f.to.fund)) || "", party(f.to), []) : gap(e, "to", (tr.to && tr.to.says) || cs.w(S + "notstated")),
      moved, cs.w(S + "stage", { phase: cs.w(S + "phase." + (f.phase || "adopted")), stage: f.stage ? cs.w(S + "stage." + f.stage) : "" }), per, amount, src + " " + grade, inTrail];
  };
  /* a row's panel: its facts, what is undetermined and the evidence that would help, and every act on that one row */
  const panel = (e) => {
    const L = fact(e);
    const f = L.state === "ok" ? L.value : null;
    const k = { fact: e.key };
    const others = entries.filter((x) => x.key !== e.key);
    const gaps = gapsOf(e, f);
    const help = gaps.map((g) => `<div class="mk-gapblock" data-gap-item="${g}"><b>${cs.w(S + "col." + g)}</b> ${cs.mark("gap", "undetermined", { reason: cs.w(S + "gap." + g) })}`
      + `<p class="mk-small">${cs.w(S + "evidence." + g)}</p></div>`).join("");
    const auth = ui.auth && ui.auth[e.key];
    const rec = ui.rec && ui.rec[e.key];
    const note = ui.note && ui.note[e.key];
    return (f && f.as_read ? `<p class="mk-small">${cs.w(S + "asread", { as_read: f.as_read, by: P.who(cs, f.by) })}</p>` : "") + help
      + (rec ? `<p class="mk-small">${cs.w(rec.consistent ? S + "rec.same" : S + "rec.differs", { dims: (rec.differs || []).map((x) => x.dimension).join(", ") })}</p>` : "")
      + (auth ? `<p class="mk-small">${auth.chains && auth.chains.length ? auth.chains.map((c) => cs.w(S + "auth.chain", { n: String((c.hops || []).length), event: c.event_id || "" })).join("; ") : cs.w(S + "auth.none")}</p>` : "")
      + (note ? `<p class="mk-small">${cs.esc(note)}</p>` : "")
      + `<div class="mk-acts">`
      + (f && f.phase !== "actual" && others.length ? cs.choice("money-with-" + e.key, S + "with", others.map((o) => ({ value: o.key, text: o.key })), {}) + cs.act("reconcile", { label: "act.reconcile.label.money", data: k }) : "")
      + cs.act("authoritychain", { label: "act.authoritychain.label.money", data: k })
      + (e.state === "included" ? cs.act("exclude", { label: "act.exclude.label.money", data: k }) : cs.act("include", { label: "act.include.label.money", data: k }))
      + (f && f.source && f.source.capture_sha ? cs.act("gradenote", { label: "act.gradenote.label.money", data: { fact: e.key, capture: f.source.capture_sha } }) : "")
      + cs.act("acquire", { label: "act.acquire.label.money", data: k })
      + (gaps.length ? cs.act("findin", { label: "act.findin.label.money", data: k }) + cs.act("recordfact", { label: S + "readother", data: k })
        + cs.act("actioncreate", { label: "act.actioncreate.label.money", data: k }) : "")
      + (gaps.includes("moved") ? cs.act("createevent", { label: "act.createevent.label.money", data: k }) : "")
      + cs.act("checkrequest", { label: "act.checkrequest.label.money", data: k })
      + cs.act("hypothesishold", { label: "act.hypothesishold.label.money", data: k }) + "</div>";
  };
  const onlyGaps = mode === "undetermined";
  const shown = onlyGaps ? entries.filter((e) => { const L = fact(e); return L.state !== "ok" || gapsOf(e, L.value).length; }) : entries;
  const nGaps = entries.filter((e) => { const L = fact(e); return L.state === "ok" && gapsOf(e, L.value).length; }).length;
  /* R18: the connection graph, its centre the trail's set, as of today; a node opens Explore connections at it */
  const gq = P.later(cs, view, "graph", "exploregraph", { body: { centre: id, at: { value: P.today(cs), precision: "day", zone: "UTC" }, rings: 2 } });
  out.push(cs.sec(S + "graph", cs.state(gq, (g) => P.graph(cs, g, { idonly: P.idonlyMap(P.unnamedIds(g) ? P.later(cs, view, "idonly", "entityidonly", { query: { ids: P.unnamedIds(g) } }) : null), groupOf: ((groups) => (k) => groups[k] || null)(P.groupsFor(cs, view, g, P.later)), trail: [id], act: null, names: { [id]: set ? set.label || id : id }, words: { cited: S + "g.cited", declared: S + "g.declared", hunch: S + "g.hunch", nosource: S + "g.nosource", attached: "screen.explore.attached" } }))));
  out.push(cs.state("trail", view, () => `<div class="mk-tablebar"><a class="cs-btn" data-tone="quiet" data-nav href="/app/money/${encodeURIComponent(id)}${onlyGaps ? "" : "/undetermined"}" aria-pressed="${onlyGaps}">`
    + cs.w(onlyGaps ? S + "filter.all" : nGaps ? S + "filter.gaps" : S + "filter.gaps.none", { n: String(nGaps) }) + "</a></div>"
    + (shown.length ? cs.rows({ id: "money", pick: true, items: shown, key: (e) => e.key, name: (e) => e.key,
      cols: ["column.money.figure.name", "column.money.from.name", "column.money.to-where-it-went.name", "column.money.when-it-moved.name", "column.money.stage.name",
        "column.money.period.name", "column.money.amount.name", "column.money.source.name", "column.money.in-this-trail.name"],
      cells, acts: panel,
      hold: (picked) => cs.act("include", { label: "act.include.label.money" }) + cs.act("exclude", { label: "act.exclude.label.money" })
        + (picked.length === 2 ? cs.act("reconcile", { label: "act.reconcile.label.money" }) : "") + cs.act("checkrequest", { label: "act.checkrequest.label.money" }) })
      : `<p>${cs.w(onlyGaps ? S + "nogaps" : S + "empty")}</p>`)));
  out.push(`<p class="mk-note">${cs.w(S + "tension")}</p>`);
  if (ui.cap) out.push(cs.sec(S + "cap.head", `<p>${ui.cap.difference && ui.cap.difference.figure
    ? cs.w(S + "cap.diff", { committed: (ui.cap.committed && ui.cap.committed.sum && ui.cap.committed.sum.value) || "", paid: (ui.cap.paid && ui.cap.paid.sum && ui.cap.paid.sum.value) || "", difference: ui.cap.difference.figure.value || "" })
    : cs.mark("gap", "undetermined", { reason: (ui.cap.difference && (ui.cap.difference.why || ui.cap.difference.says)) || cs.w(S + "cap.none") })}</p>`));
  /* R23, C57: the contract for "committed against paid" is chosen among the contracts the record follows (`peopledirectory`'s `contracts`),
     never typed: with none held the choice's empty state is drawn, and the act refuses in words */
  const cd = view.data.contracts;
  const contractRows = cd && (cd.state === "ok" || cd.state === "empty") && cd.value && Array.isArray(cd.value.rows) ? cd.value.rows.filter((r) => r && r.entity) : [];
  /* a read that has not answered or failed draws its own state; one that answered none (the shell calls it `empty`) is the choice's empty state, under its label */
  const contractChoice = cd && (cd.state === "loading" || cd.state === "failed") ? cs.state("contracts", view, () => "")
    : contractRows.length ? cs.choice("mf-contract", S + "f.contract", contractRows.map((r) => ({ value: r.entity, text: r.name || "" })), {})
      : P.emptyChoice(cs, "mf-contract", S + "f.contract");
  /* the forms the acts read: a figure from a passage; the contract for committed against paid; the member's own words */
  /* C95, R34: the project's cited question first and chosen, as the page was opened for it; none cited, none chosen */
  const pimg = view.ui && view.ui.later && view.ui.later.project;
  const pdoc = pimg && pimg.state === "ok" && pimg.value && typeof pimg.value["bundle.md"] === "string" ? P.front(pimg.value["bundle.md"]) : null;
  const asked = P.asked(view, "questions", pdoc ? pdoc.refs.filter((r) => /^INQ-/.test(String(r.target || "")) && r.status !== "severed").map((r) => r.target) : []);
  const ch = (fid, key, list) => cs.choice(fid, key, list.map((x) => [x, key + "." + x]), {});
  out.push(cs.sec(S + "form.head", (ui.readFor ? `<p class="mk-small">${cs.w(S + "readfor", { fact: ui.readFor })}</p>` : "")
    + cs.field("mf-amount", S + "f.amount", { help: S + "f.amount.help" }) + cs.field("mf-asread", S + "f.asread", { rec: true })
    + cs.field("mf-currency", S + "f.currency", { value: "USD" })
    + ch("mf-sign", S + "f.sign", ["+", "-"].map((x) => (x === "+" ? "in" : "out"))).replace(/value="in"/, 'value="+"').replace(/value="out"/, 'value="-"')
    + ch("mf-kind", S + "f.kind", ["expenditure", "payment", "transfer", "allocation", "revenue", "contribution", "settlement", "other"])
    + ch("mf-phase", S + "f.phase", ["adopted", "proposed", "adjusted", "actual"]) + ch("mf-stage", S + "f.stage", ["none", "encumbered", "incurred", "paid", "assessed", "collected"])
    + ch("mf-basis", S + "f.basis", ["undetermined", "budgetary", "cash", "modified_accrual", "accrual"])
    + cs.field("mf-from-date", S + "f.periodfrom", { type: "date" }) + cs.field("mf-to-date", S + "f.periodto", { type: "date" }) + cs.field("mf-fiscal", S + "f.fiscal", {})
    + cs.field("mf-payer", S + "f.payer", {}) + cs.field("mf-payee", S + "f.payee", {})
    + P.docChoice(cs, view, "mf-doc", { project: set && typeof set.concerns === "string" ? set.concerns : "", passage: false, drive: true }) + P.passagePick(cs, view, "mf-doc", "mf-passage", P.later)
    + contractChoice + cs.field("mf-label", S + "label", {})
    + cs.field("mf-expertise", S + "f.expertise", { help: S + "f.expertise.help" })
    + cs.field("mf-address", S + "f.address", { help: S + "f.address.help" })
    + cs.choice("mf-question", S + "f.question", asked.options, Object.assign({ help: S + "f.question.help" }, asked.value ? { value: asked.value } : {})) + cs.field("mf-hunch", S + "f.hunch", { area: true, rec: true })));
  return out.join("");
}

/* every act names its trail and fact; a hold-strip act receives the picked keys (`extra.picked`) */
const acts = rereading([
  { op: "recordfact", label: "act.recordfact.label.money",
    /* C8, R4 (money R29): a period money cannot read is `MONEY_BAD_PERIOD`, its own code: the design's nearest held sentence for dates that cannot be recorded (K4476; the row of its own is T52's), then the reason the owner gives (the fiscal
       key and the body it was asked for), as record data */
    refusals: { MONEY_BAD_PERIOD: function (refusal, cs) {
      return cs ? cs.w("refusal.BAD_VALIDITY") + (typeof refusal.detail === "string" && refusal.detail.trim() ? " " + cs.esc(refusal.detail.trim()) : "") : "";
    } },
    send(view, el, cs) {
      const amount = String(cs.value("mf-amount") || "").trim(), as_read = String(cs.value("mf-asread") || "").trim();
      const src = view.parts.chosen(cs, "mf-doc", "mf-passage");
      if (el && el.dataset && el.dataset.fact && !amount) { cs.set("readFor", el.dataset.fact); return null; }
      if (!amount || !as_read || !src) return { refuse: "screen.money.f.empty" };
      const phase = String(cs.value("mf-phase") || "adopted"), stage = String(cs.value("mf-stage") || "none");
      const fiscal = String(cs.value("mf-fiscal") || "").trim(), pf = String(cs.value("mf-from-date") || ""), pt = String(cs.value("mf-to-date") || "");
      const payer = String(cs.value("mf-payer") || "").trim(), payee = String(cs.value("mf-payee") || "").trim();
      const party = (x) => (!x ? null : /^ENT-/.test(x) ? { entity: x } : { as_written: x });
      return { body: Object.assign({ amount, as_read, currency: String(cs.value("mf-currency") || "USD").trim(), sign: String(cs.value("mf-sign") || "+"),
        precision: "exact", kind: String(cs.value("mf-kind") || "other"), phase, basis: String(cs.value("mf-basis") || "undetermined").replace("modified_accrual", "modified accrual"),
        period: fiscal ? { fiscal } : { from: pf || null, to: pt || null }, from: party(payer), to: party(payee),
        source: { capture_sha: src.captureSha, extent: src.extent } }, phase === "actual" && stage !== "none" ? { stage } : {}) };
    },
    /* C8, R4: a figure read in for the open trail is proposed to it (`money`'s propose act, R13: held apart, never included until a member
       includes it), so the trail's own record holds it and the rows are drawn from the record, not from this page's memory; the
       screen sends only what the owner declares: the set, the fact and the method */
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const setId = String(view.subject || "").split("/")[0];
      view.ui.readFor = null;
      view.ui.proposeRefusal = null;
      if (!(r && r.fact_id && /^MSR-/.test(setId))) return null;
      return cs.call("moneysetpropose", { body: { setId, factId: r.fact_id, method: "member:recordfact" } }).then((a) => {
        const x = a && a.result !== undefined ? a.result : a;
        if (!x || x.ok === false) view.ui.proposeRefusal = { code: String((x && (x.code || x.reason)) || ""), translation: x && typeof x.translation === "string" ? x.translation : null };
      });
    } },
  { op: "createset", label: "act.createset.label.money", reasonField: "label",
    send(view, el, cs) {
      const label = String(cs.value("money-label") || cs.value("mf-label") || "").trim();
      const id = String(view.subject || "").split("/")[0];
      const t = view.data.trail;
      const project = /^MSR-/.test(id) ? (t && t.state === "ok" && t.value.set && t.value.set.concerns) || null : id;
      return { body: Object.assign({ purpose: "trail", label }, project ? { concerns: project } : {}) };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.set_id) cs.go("money", r.set_id);
    } },
  { op: "include", label: "act.include.label.money",
    send(view, el, cs, extra) {
      const setId = String(view.subject || "").split("/")[0];
      const keys = el && el.dataset && el.dataset.fact ? [el.dataset.fact] : (extra && extra.picked) || [];
      if (!keys.length) return null;
      /* one reason for all the picked rows: the rest are sent here, the first by the shell */
      for (const k of keys.slice(1)) cs.call("include", { body: { setId, factId: k, reason: extra && extra.reason } });
      return { body: { setId, factId: keys[0] } };
    },
    done(view) { view.ui.later = {}; } },
  { op: "exclude", label: "act.exclude.label.money",
    send(view, el, cs, extra) {
      const setId = String(view.subject || "").split("/")[0];
      const keys = el && el.dataset && el.dataset.fact ? [el.dataset.fact] : (extra && extra.picked) || [];
      if (!keys.length) return null;
      for (const k of keys.slice(1)) cs.call("exclude", { body: { setId, factId: k, reason: extra && extra.reason } });
      return { body: { setId, factId: keys[0] } };
    },
    done(view) { view.ui.later = {}; } },
  /* a budgeted figure beside a paid one: every way they differ named, nothing merged (exactly two picked, or a row's) */
  { op: "reconcile", label: "act.reconcile.label.money", rereads: [],
    send(view, el, cs, extra) {
      const a = el && el.dataset && el.dataset.fact ? el.dataset.fact : extra && extra.picked && extra.picked[0];
      const b = el && el.dataset && el.dataset.fact ? String(cs.value("money-with-" + el.dataset.fact) || "") : extra && extra.picked && extra.picked[1];
      if (!a || !b) return { refuse: "screen.money.rec.two" };
      view.ui.recFor = a;
      return { query: { a, b } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const rec = Object.assign({}, view.ui.rec || {}); rec[view.ui.recFor] = r; cs.set("rec", rec);
      return { stay: true };
    } },
  { op: "committedagainstpaid", label: "act.committedagainstpaid.label.money", rereads: [],
    send(view, el, cs) {
      const contract = String(cs.value("mf-contract") || "").trim();
      if (!/^ENT-/.test(contract)) return { refuse: "screen.money.f.nocontract" };
      return { query: { contract } };
    },
    done(view, answer, cs) { cs.set("cap", answer && answer.result !== undefined ? answer.result : answer); return { stay: true }; } },
  { op: "authoritychain", label: "act.authoritychain.label.money", rereads: [],
    send(view, el) { view.ui.authFor = el.dataset.fact; return { query: { id: String(el.dataset.fact || "") } }; },
    done(view, answer, cs) {
      const a = Object.assign({}, view.ui.auth || {}); a[view.ui.authFor] = answer && answer.result !== undefined ? answer.result : answer; cs.set("auth", a);
      return { stay: true };
    } },
  { op: "findin", label: "act.findin.label.money",
    send(view, el, cs) {
      const t = view.data.trail;
      cs.go("find-in", String((t && t.state === "ok" && t.value.set && t.value.set.concerns) || ""));
      return null;
    } },
  /* "Ask the city for the record": a records request, opened on its screen for this project */
  { op: "actioncreate", label: "act.actioncreate.label.money",
    send(view, el, cs) {
      const t = view.data.trail;
      cs.go("request", String((t && t.state === "ok" && t.value.set && t.value.set.concerns) || ""));
      return null;
    } },
  /* "Record when it moved": the movement as an event from the passage that dates it, the figure among what it concerns */
  { op: "createevent", label: "act.createevent.label.money",
    send(view, el, cs) {
      const at = view.parts.chosen(cs, "mf-doc", "mf-passage");
      if (!at) return { refuse: "screen.money.f.nopassage" };
      return { body: { kind: "payment", attestations: [at] } };
    },
    done(view) { view.ui.later = {}; } },
  { op: "gradenote", label: "act.gradenote.label.money", rereads: [],
    send(view, el) { view.ui.noteFor = el.dataset.fact; return { query: { capture: String(el.dataset.capture || "") } }; },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const n = Object.assign({}, view.ui.note || {}); n[view.ui.noteFor] = (r && r.note) || cs.w("screen.money.note.none"); cs.set("note", n);
      return { stay: true };
    } },
  /* R113: it files a copy, so only the read of the documents (`after: ["acquire"]`) is read again */
  { op: "acquire", label: "act.acquire.label.money", rereads: [],
    send(view, el, cs) {
      const locator = String(cs.value("mf-address") || "").trim();
      if (!/^https:\/\//.test(locator)) return { refuse: "screen.money.f.noaddress" };
      return { body: { locator } };
    } },
  /* "Ask a member who knows budgets": a check of the project's record, to the members declaring that expertise */
  { op: "checkrequest", label: "act.checkrequest.label.money",
    send(view, el, cs, extra) {
      const t = view.data.trail;
      const target = String((t && t.state === "ok" && t.value.set && t.value.set.concerns) || "");
      const label = String(cs.value("mf-expertise") || "").trim();
      if (!target || !label) return { refuse: "screen.money.f.noexpertise" };
      const keys = el && el.dataset && el.dataset.fact ? [el.dataset.fact] : (extra && extra.picked) || [];
      return { body: { target, label, note: view.parts.plain(cs, "screen.money.check.note", { facts: keys.join(", ") }) } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; cs.set("checked", r && r.addressed); } },
  { op: "hypothesishold", label: "act.hypothesishold.label.money",
    send(view, el, cs) {
      const inquiry = String(cs.value("mf-question") || "").trim(), statement = String(cs.value("mf-hunch") || "").trim();
      if (!inquiry || !statement) return { refuse: "screen.money.f.nohunch" };
      return { body: { inquiry, kind: "flow", statement, about: [String(el.dataset.fact || "")] } };
    } },
], ["trail", "project", "trails", "contracts", "questions"], []);

const MONEY_KEYS = [
  "screen.money.graph", "screen.money.graph.holds", "screen.money.notrail", "screen.money.label", "screen.money.label.help",
  "screen.money.startedby", "screen.money.read", "screen.money.readother", "screen.money.readfor", "screen.money.event", "screen.money.source",
  "screen.money.notstated", "screen.money.didnotmove", "screen.money.moved.why", "screen.money.period", "screen.money.period.why",
  "screen.money.range", "screen.money.amount", "screen.money.stage", "screen.money.included", "screen.money.excluded", "screen.money.proposed", "screen.money.proposed.member",
  "screen.money.notyet", "screen.money.gap.open", "screen.money.col.from", "screen.money.col.to", "screen.money.col.moved", "screen.money.col.basis",
  "screen.money.col.period", "screen.money.gap.from", "screen.money.gap.to", "screen.money.gap.moved", "screen.money.gap.basis",
  "screen.money.gap.period", "screen.money.evidence.from", "screen.money.evidence.to", "screen.money.evidence.moved", "screen.money.evidence.basis",
  "screen.money.evidence.period", "screen.money.asread", "screen.money.rec.same", "screen.money.rec.differs", "screen.money.rec.two",
  "screen.money.with", "screen.money.auth.chain", "screen.money.auth.none", "screen.money.note.none", "screen.money.filter.gaps",
  "screen.money.filter.gaps.none", "screen.money.filter.all", "screen.money.empty", "screen.money.nogaps", "screen.money.tension",
  "screen.money.cap.head", "screen.money.cap.diff", "screen.money.cap.none", "screen.money.form.head", "screen.money.f.amount",
  "screen.money.f.amount.help", "screen.money.f.asread", "screen.money.f.currency", "screen.money.f.sign", "screen.money.f.sign.in",
  "screen.money.f.sign.out", "screen.money.f.kind", "screen.money.f.kind.expenditure", "screen.money.f.kind.payment", "screen.money.f.kind.transfer",
  "screen.money.f.kind.allocation", "screen.money.f.kind.revenue", "screen.money.f.kind.contribution", "screen.money.f.kind.settlement",
  "screen.money.f.kind.other", "screen.money.f.phase", "screen.money.f.phase.adopted", "screen.money.f.phase.proposed",
  "screen.money.f.phase.adjusted", "screen.money.f.phase.actual", "screen.money.f.stage", "screen.money.f.stage.none",
  "screen.money.f.stage.encumbered", "screen.money.f.stage.incurred", "screen.money.f.stage.paid", "screen.money.f.stage.assessed",
  "screen.money.f.stage.collected", "screen.money.f.basis", "screen.money.f.basis.undetermined", "screen.money.f.basis.budgetary",
  "screen.money.f.basis.cash", "screen.money.f.basis.modified_accrual", "screen.money.f.basis.accrual", "screen.money.f.periodfrom",
  "screen.money.f.periodto", "screen.money.f.fiscal", "screen.money.f.payer", "screen.money.f.payee", "screen.money.f.sha",
  "screen.money.f.sha.help", "screen.money.f.page", "screen.money.f.contract", "screen.money.f.expertise", "screen.money.f.expertise.help",
  "screen.money.f.address", "screen.money.f.address.help", "screen.money.f.question", "screen.money.f.question.help", "screen.money.f.hunch",
  "screen.money.f.empty", "screen.money.f.nocontract", "screen.money.f.nopassage", "screen.money.f.noaddress", "screen.money.f.noexpertise",
  "screen.money.f.nohunch", "screen.money.check.note", "screen.money.phase.adopted", "screen.money.phase.proposed", "screen.money.phase.adjusted",
  "screen.money.phase.actual", "screen.money.stage.encumbered", "screen.money.stage.incurred", "screen.money.stage.paid",
  "screen.money.stage.assessed", "screen.money.stage.collected", "screen.money.kind.revenue", "screen.money.kind.expenditure",
  "screen.money.kind.transfer", "screen.money.kind.allocation", "screen.money.kind.payment", "screen.money.kind.contribution",
  "screen.money.kind.gift", "screen.money.kind.income", "screen.money.kind.behested", "screen.money.kind.settlement", "screen.money.kind.debt",
  "screen.money.kind.balance", "screen.money.kind.fee_charged", "screen.money.kind.other", "screen.money.g.cited", "screen.money.g.declared",
  "screen.money.g.hunch", "screen.money.g.nosource",
];

const words = ["screen.money.name", "screen.money.purpose", "refusal.BAD_VALIDITY", "contradiction.text.row_table",
  ...["recordfact", "createset", "include", "exclude", "reconcile", "committedagainstpaid", "authoritychain", "findin", "actioncreate", "createevent", "gradenote", "acquire", "checkrequest", "hypothesishold"]
    .flatMap((op) => ["act." + op + ".label.money", "act." + op + ".does"]),
  ...["figure", "from", "to-where-it-went", "when-it-moved", "stage", "period", "amount", "source", "in-this-trail"].flatMap((c) => ["column.money." + c + ".name", "column.money." + c + ".shows"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  ...GRAPH_SHARED,
  "state.empty", "state.loading", "state.failed", ...FORM_SHARED, ...MONEY_KEYS];

export const MONEY_SCREEN = Object.freeze({ id: "money", reads, place, render, acts, words, parts: PARTS });
