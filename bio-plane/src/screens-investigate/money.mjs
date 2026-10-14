/* screens-investigate R4: a money trail (Projects › <project> › Money trail; registry screen `money`, its 14 acts; N728;
 * K1457, K1468; DEC-176). The screen's subject is the trail (`money`' `MSR-` set; no op lists a project's trails, so a
 * trail names its project as its `concerns` when it is started here), or a project with no trail yet. Each figure is a
 * row (interface-shell R19): its kind, from, to, when it moved (the event it is tied to, never its accounting period),
 * stage, period, amount, source grade, and whether the trail includes it with its reason. A value the source does not
 * state is drawn undetermined and opens the row's panel at that item with the evidence that would help; a filter keeps
 * only rows with something undetermined (the address `…/<trail>/undetermined`). Two sources that disagree are both
 * drawn, compared, never one picked. */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

const S = "screen.money.";

function reads(view) {
  const S = "screen.money.";
  const id = String(view.subject || "").split("/")[0];
  return /^MSR-/.test(id)
    ? { trail: { op: "moneyset", query: { id }, subject: true, empty: (v) => !v || v.found === false } }
    : { project: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] } };
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
    /* a project with no trail open here: starting one is all there is to do */
    out.push(cs.title(cs.w("screen.money.name")));
    out.push(cs.state("project", view, () => `<p>${cs.w(S + "notrail")}</p>` + cs.field("money-label", S + "label", { help: S + "label.help" })
      + cs.act("createset", { label: "act.createset.label.money", tone: "primary" })));
    return out.join("");
  }
  const t = view.data.trail;
  const set = t && t.state === "ok" ? t.value.set || {} : null;
  if (set && /^PROJ-/.test(String(set.concerns || ""))) P.later(cs, view, "project", "image", { query: { id: set.concerns } });
  out.push(cs.title(set ? set.label || id : id, { thing: { kind: "record", facts: set ? [cs.w(S + "startedby", { by: String(set.by || "").replace(/^member:/, "") })] : [] } }));
  out.push(`<div class="cs-actrow">${cs.act("recordfact", { label: S + "read", tone: "primary" })}${cs.act("createset", { label: "act.createset.label.money" })}${cs.act("committedagainstpaid", { label: "act.committedagainstpaid.label.money" })}</div>`);
  /* the rows: every fact the trail holds, included or left out, and those read here not yet in it */
  const entries = t && t.state === "ok"
    ? (t.value.inclusions || []).map((x) => ({ key: x.fact_id, state: "included", reason: x.reason, trail: x.trail }))
      .concat((t.value.exclusions || []).map((x) => ({ key: x.fact_id, state: "excluded", reason: x.reason, trail: null })))
      .concat((t.value.proposals || []).map((x) => ({ key: x.fact_id, state: "proposed", reason: x.label, trail: x.trail })))
      .concat((Array.isArray(ui.recent) ? ui.recent : []).filter((k) => !(t.value.inclusions || []).concat(t.value.exclusions || []).some((x) => x.fact_id === k)).map((k) => ({ key: k, state: "none", reason: "", trail: null })))
    : [];
  const fact = (e) => P.later(cs, view, "fact:" + e.key, "money", { query: { id: e.key } });
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
  const cells = (e) => {
    const L = fact(e);
    if (L.state !== "ok") return [cs.state(L, () => ""), "", "", "", "", "", "", "", ""];
    const f = L.value;
    const tr = e.trail || {};
    const moved = f.phase !== "actual" ? cs.w(S + "didnotmove", { phase: cs.w(S + "phase." + (f.phase || "adopted")) })
      : tr.moved && tr.moved.state === "dated" ? (cs.date((tr.moved.when && (tr.moved.when.value || tr.moved.when.start)) || "") || cs.esc((tr.moved.when && tr.moved.when.value) || ""))
        + (tr.moved.event ? " " + P.refOf(cs, tr.moved.event, cs.w(S + "event"), [], "event") : "")
      : gap(e, "moved", (tr.moved && tr.moved.why) || cs.w(S + "moved.why"));
    const per = f.period ? (f.period.fiscal ? cs.esc(f.period.fiscal) : f.period.to
      ? cs.w(S + "period", { from: cs.date(f.period.from || ""), to: cs.date(f.period.to) }) : gap(e, "period", cs.w(S + "period.why"))) : gap(e, "period", cs.w(S + "period.why"));
    const amount = typeof f.amount === "object" && f.amount
      ? cs.w(S + "range", { low: f.amount.low, high: f.amount.high, currency: f.currency || "" })
      : cs.w(S + "amount", { sign: f.sign === "-" ? "−" : "", amount: String(f.amount || ""), currency: f.currency || "" });
    const src = f.source && f.source.capture_sha ? P.refOf(cs, f.source.capture_sha, f.citation || cs.w(S + "source"), [f.as_read || ""], "capture") : "";
    const grade = f.grade && /^[A-D]$/.test(f.grade.reading || "") ? cs.grade("capture", f.grade.reading) : cs.mark("gap", "unrated");
    const inTrail = e.state === "included" ? cs.w(S + "included", { reason: e.reason || "" }) : e.state === "excluded" ? cs.w(S + "excluded", { reason: e.reason || "" })
      : e.state === "proposed" ? cs.w(S + "proposed") : cs.w(S + "notyet");
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
      + `<p class="cs-meta">${cs.w(S + "evidence." + g)}</p></div>`).join("");
    const auth = ui.auth && ui.auth[e.key];
    const rec = ui.rec && ui.rec[e.key];
    const note = ui.note && ui.note[e.key];
    return (f && f.as_read ? `<p class="cs-meta">${cs.w(S + "asread", { as_read: f.as_read, by: String(f.by || "").replace(/^member:/, "") })}</p>` : "") + help
      + (rec ? `<p class="cs-meta">${cs.w(rec.consistent ? S + "rec.same" : S + "rec.differs", { dims: (rec.differs || []).map((x) => x.dimension).join(", ") })}</p>` : "")
      + (auth ? `<p class="cs-meta">${auth.chains && auth.chains.length ? auth.chains.map((c) => cs.w(S + "auth.chain", { n: String((c.hops || []).length), event: c.event_id || "" })).join("; ") : cs.w(S + "auth.none")}</p>` : "")
      + (note ? `<p class="cs-meta">${cs.esc(note)}</p>` : "")
      + `<div class="cs-actrow">`
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
  out.push(cs.state("trail", view, () => `<div class="mk-tablebar"><a class="cs-btn" data-tone="quiet" data-nav href="/app/money/${encodeURIComponent(id)}${onlyGaps ? "" : "/undetermined"}" aria-pressed="${onlyGaps}">`
    + cs.w(onlyGaps ? S + "filter.all" : S + "filter.gaps", { n: String(nGaps) }) + "</a></div>"
    + (shown.length ? cs.rows({ id: "money", pick: true, items: shown, key: (e) => e.key, name: (e) => e.key,
      cols: ["column.money.figure.name", "column.money.from.name", "column.money.to-where-it-went.name", "column.money.when-it-moved.name", "column.money.stage.name",
        "column.money.period.name", "column.money.amount.name", "column.money.source.name", "column.money.in-this-trail.name"],
      cells, acts: panel,
      hold: (picked) => cs.act("include", { label: "act.include.label.money" }) + cs.act("exclude", { label: "act.exclude.label.money" })
        + (picked.length === 2 ? cs.act("reconcile", { label: "act.reconcile.label.money" }) : "") + cs.act("checkrequest", { label: "act.checkrequest.label.money" }) })
      : `<p>${cs.w(onlyGaps ? S + "nogaps" : S + "empty")}</p>`)));
  out.push(`<p class="cs-note">${cs.w(S + "tension")}</p>`);
  if (ui.cap) out.push(cs.sec(S + "cap.head", `<p>${ui.cap.difference && ui.cap.difference.figure
    ? cs.w(S + "cap.diff", { committed: (ui.cap.committed && ui.cap.committed.sum && ui.cap.committed.sum.value) || "", paid: (ui.cap.paid && ui.cap.paid.sum && ui.cap.paid.sum.value) || "", difference: ui.cap.difference.figure.value || "" })
    : cs.mark("gap", "undetermined", { reason: (ui.cap.difference && (ui.cap.difference.why || ui.cap.difference.says)) || cs.w(S + "cap.none") })}</p>`));
  /* the forms the acts read: a figure from a passage; the contract for committed against paid; the member's own words */
  const ch = (fid, key, list) => cs.choice(fid, key, list.map((x) => [x, key + "." + x]), {});
  out.push(cs.sec(S + "form.head", (ui.readFor ? `<p class="cs-meta">${cs.w(S + "readfor", { fact: ui.readFor })}</p>` : "")
    + cs.field("mf-amount", S + "f.amount", { help: S + "f.amount.help" }) + cs.field("mf-asread", S + "f.asread", { rec: true })
    + cs.field("mf-currency", S + "f.currency", { value: "USD" })
    + ch("mf-sign", S + "f.sign", ["+", "-"].map((x) => (x === "+" ? "in" : "out"))).replace(/value="in"/, 'value="+"').replace(/value="out"/, 'value="-"')
    + ch("mf-kind", S + "f.kind", ["expenditure", "payment", "transfer", "allocation", "revenue", "contribution", "settlement", "other"])
    + ch("mf-phase", S + "f.phase", ["adopted", "proposed", "adjusted", "actual"]) + ch("mf-stage", S + "f.stage", ["none", "encumbered", "incurred", "paid", "assessed", "collected"])
    + ch("mf-basis", S + "f.basis", ["undetermined", "budgetary", "cash", "modified_accrual", "accrual"])
    + cs.field("mf-from-date", S + "f.periodfrom", { type: "date" }) + cs.field("mf-to-date", S + "f.periodto", { type: "date" }) + cs.field("mf-fiscal", S + "f.fiscal", {})
    + cs.field("mf-payer", S + "f.payer", {}) + cs.field("mf-payee", S + "f.payee", {})
    + cs.field("mf-sha", S + "f.sha", { help: S + "f.sha.help" }) + cs.field("mf-page", S + "f.page", {})
    + cs.field("mf-contract", S + "f.contract", {}) + cs.field("mf-label", S + "label", {})
    + cs.field("mf-expertise", S + "f.expertise", { value: "municipal budget", help: S + "f.expertise.help" })
    + cs.field("mf-address", S + "f.address", { help: S + "f.address.help" })
    + cs.field("mf-question", S + "f.question", { help: S + "f.question.help" }) + cs.field("mf-hunch", S + "f.hunch", { area: true, rec: true })));
  return out.join("");
}

/* every act names its trail and fact; a hold-strip act receives the picked keys (`extra.picked`) */
const acts = [
  { op: "recordfact", label: "act.recordfact.label.money",
    send(view, el, cs) {
      const amount = String(cs.value("mf-amount") || "").trim(), as_read = String(cs.value("mf-asread") || "").trim();
      const src = view.parts.passage(cs.value("mf-sha"), cs.value("mf-page"));
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
    done(view, answer) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.fact_id) view.ui.recent = (Array.isArray(view.ui.recent) ? view.ui.recent : []).concat([r.fact_id]);
      view.ui.readFor = null;
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
      const at = view.parts.passage(cs.value("mf-sha"), cs.value("mf-page"));
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
  { op: "acquire", label: "act.acquire.label.money",
    send(view, el, cs) {
      const locator = String(cs.value("mf-address") || "").trim();
      if (!/^https:\/\//.test(locator)) return { refuse: "screen.money.f.noaddress" };
      const t = view.data.trail;
      const project = t && t.state === "ok" && t.value.set && t.value.set.concerns;
      return { body: Object.assign({ locator }, project ? { project } : {}) };
    } },
  /* "Ask a member who knows budgets": a check of the project's record, to the members declaring that expertise */
  { op: "checkrequest", label: "act.checkrequest.label.money",
    send(view, el, cs, extra) {
      const t = view.data.trail;
      const target = String((t && t.state === "ok" && t.value.set && t.value.set.concerns) || "");
      const label = String(cs.value("mf-expertise") || "").trim();
      if (!target || !label) return { refuse: "screen.money.f.noexpertise" };
      const keys = el && el.dataset && el.dataset.fact ? [el.dataset.fact] : (extra && extra.picked) || [];
      return { body: { target, label, note: cs.w("screen.money.check.note", { facts: keys.join(", ") }) } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; cs.set("checked", r && r.addressed); } },
  { op: "hypothesishold", label: "act.hypothesishold.label.money",
    send(view, el, cs) {
      const inquiry = String(cs.value("mf-question") || "").trim(), statement = String(cs.value("mf-hunch") || "").trim();
      if (!inquiry || !statement) return { refuse: "screen.money.f.nohunch" };
      return { body: { inquiry, kind: "flow", statement, about: [String(el.dataset.fact || "")] } };
    } },
];

const ROWS = [
  ["notrail", "No money trail is open here yet. Start one: a named set of figures you include or leave out, each with a reason."],
  ["label", "The trail's name"],
  ["label.help", "What the trail follows, for example \"Sewer fund transfers, FY2022\"."],
  ["startedby", "started by {by}"],
  ["read", "Read a figure"],
  ["readother", "Read it from another source"],
  ["readfor", "Reading another source for {fact}: fill in the figure below and press Read a figure."],
  ["event", "the event"],
  ["source", "the source"],
  ["notstated", "not stated in this source"],
  ["didnotmove", "did not move: a {phase} figure"],
  ["moved.why", "the source gives no date it moved"],
  ["period", "{from} to {to}"],
  ["period.why", "the source states no end to its period"],
  ["range", "{low} to {high} {currency}"],
  ["amount", "{sign}{amount} {currency}"],
  ["stage", "{phase} {stage}"],
  ["included", "included · \"{reason}\""],
  ["excluded", "left out · \"{reason}\""],
  ["proposed", "proposed by the machine; not included"],
  ["notyet", "read here, not yet in this trail"],
  ["gap.open", "Open this figure at {what}"],
  ["col.from", "Where it came from"],
  ["col.to", "Where it went"],
  ["col.moved", "When it moved"],
  ["col.basis", "Its accounting basis"],
  ["col.period", "Its period"],
  ["gap.from", "not stated in the only source holding this figure"],
  ["gap.to", "not stated in the only source holding this figure"],
  ["gap.moved", "no source dates it"],
  ["gap.basis", "the source does not say on what basis it counts"],
  ["gap.period", "the source states no end to its period"],
  ["evidence.from", "Evidence that names the payer would help: a journal entry, a transfer schedule, a contract. Read it in from there, citing the passage; if the group holds none, ask the city for the record."],
  ["evidence.to", "Evidence that names the payee would help: a cost-allocation plan, a journal entry, the budget's transfer schedule. Read it in from there, citing the passage; if the group holds none, ask the city for the record."],
  ["evidence.moved", "A passage that dates it would help: a ledger line, a journal entry, a council report. Record the movement as an event, citing that passage; until a source dates it, it is never placed by its year."],
  ["evidence.basis", "The source's own notes on its accounting basis would help: read the figure again from a source that states it."],
  ["evidence.period", "A passage that states the period's end would help: the report's cover, its notes, a schedule."],
  ["asread", "As the source writes it: \"{as_read}\" · read by {by}"],
  ["rec.same", "The two readings agree in every dimension compared."],
  ["rec.differs", "The two readings differ in: {dims}. Both stay, compared, never merged."],
  ["rec.two", "Choose the two figures to compare."],
  ["with", "Compare with"],
  ["auth.chain", "{n} authorising steps toward {event}"],
  ["auth.none", "The record holds nothing that authorised it."],
  ["note.none", "No grade note is held for this copy."],
  ["filter.gaps", "Only figures with something undetermined · {n}"],
  ["filter.all", "Every figure"],
  ["empty", "This trail holds no figure yet. Read one in from a document."],
  ["nogaps", "No figure in this trail has anything undetermined."],
  ["tension", "Each column is read from the figure's own source, as it writes it, never guessed; when it moved comes from the event the figure is tied to, never its accounting period. Adding evidence never changes a figure: it is a new fact or event beside it, with its own source. Where two sources disagree, both stay, shown in tension, and the table never picks one."],
  ["cap.head", "Committed against paid"],
  ["cap.diff", "Committed {committed}, paid {paid}: {difference} committed and not yet paid."],
  ["cap.none", "the record holds no committed or no paid figure for this contract"],
  ["form.head", "Read a figure, and what the acts ask"],
  ["f.amount", "The amount"],
  ["f.amount.help", "Exactly as printed, without the currency sign: 1,250,000.00."],
  ["f.asread", "As the source writes it"],
  ["f.currency", "Currency"],
  ["f.sign", "Money"],
  ["f.sign.in", "in"],
  ["f.sign.out", "out"],
  ["f.kind", "What kind of figure"],
  ["f.kind.expenditure", "An expenditure"],
  ["f.kind.payment", "A payment"],
  ["f.kind.transfer", "A transfer"],
  ["f.kind.allocation", "An allocation"],
  ["f.kind.revenue", "Revenue"],
  ["f.kind.contribution", "A contribution"],
  ["f.kind.settlement", "A settlement"],
  ["f.kind.other", "Something else"],
  ["f.phase", "Stage"],
  ["f.phase.adopted", "Adopted (budgeted)"],
  ["f.phase.proposed", "Proposed"],
  ["f.phase.adjusted", "Adjusted"],
  ["f.phase.actual", "Actual"],
  ["f.stage", "For an actual figure"],
  ["f.stage.none", "Not stated"],
  ["f.stage.encumbered", "Committed"],
  ["f.stage.incurred", "Incurred"],
  ["f.stage.paid", "Paid"],
  ["f.stage.assessed", "Assessed"],
  ["f.stage.collected", "Collected"],
  ["f.basis", "Accounting basis"],
  ["f.basis.undetermined", "Not stated"],
  ["f.basis.budgetary", "Budgetary"],
  ["f.basis.cash", "Cash"],
  ["f.basis.modified_accrual", "Modified accrual"],
  ["f.basis.accrual", "Accrual"],
  ["f.periodfrom", "Period from"],
  ["f.periodto", "Period to"],
  ["f.fiscal", "Or its fiscal year (FY2022-23)"],
  ["f.payer", "Who paid (as written, or a record id)"],
  ["f.payee", "Who received it (as written, or a record id)"],
  ["f.sha", "The document"],
  ["f.sha.help", "The document's fingerprint, as its page shows it; the figure cites the passage."],
  ["f.page", "Page (optional)"],
  ["f.contract", "The contract, for committed against paid (a record id)"],
  ["f.expertise", "The expertise asked for"],
  ["f.expertise.help", "Members who declared this expertise are asked; the one who read the figure is not."],
  ["f.address", "The city's own address for the document"],
  ["f.address.help", "Fetched by your group's Civicsmith and kept exactly as the city sends it."],
  ["f.question", "Beside which question (its id)"],
  ["f.question.help", "A hunch is kept beside a question, labelled as yours, and is never evidence."],
  ["f.hunch", "Your reading, as a hunch"],
  ["f.empty", "Give the amount, how the source writes it, and the passage it comes from."],
  ["f.nocontract", "Name the contract by its record id."],
  ["f.nopassage", "Name the passage that dates the movement."],
  ["f.noaddress", "Give the city's address for the document, starting https://."],
  ["f.noexpertise", "Name the expertise to ask for."],
  ["f.nohunch", "Name the question and write your reading."],
  ["check.note", "Please check how these figures were read: {facts}"],
  ["phase.adopted", "adopted"],
  ["phase.proposed", "proposed"],
  ["phase.adjusted", "adjusted"],
  ["phase.actual", "actual"],
  ["stage.encumbered", "(committed)"],
  ["stage.incurred", "(incurred)"],
  ["stage.paid", "(paid)"],
  ["stage.assessed", "(assessed)"],
  ["stage.collected", "(collected)"],
  ...["revenue", "expenditure", "transfer", "allocation", "payment", "contribution", "gift", "income", "behested", "settlement", "debt", "balance", "fee_charged", "other"]
    .map((k) => ["kind." + k, { revenue: "Revenue", expenditure: "Expenditure", transfer: "Transfer", allocation: "Allocation", payment: "Payment", contribution: "Contribution",
      gift: "Gift", income: "Income", behested: "Behested payment", settlement: "Settlement", debt: "Debt", balance: "Balance", fee_charged: "Fee charged", other: "Other" }[k]]),
];
export const MONEY_WORDS = ROWS.map(([k, en]) => row(S + k, en));

const words = ["screen.money.name", "screen.money.purpose",
  ...["recordfact", "createset", "include", "exclude", "reconcile", "committedagainstpaid", "authoritychain", "findin", "actioncreate", "createevent", "gradenote", "acquire", "checkrequest", "hypothesishold"]
    .flatMap((op) => ["act." + op + ".label.money", "act." + op + ".does"]),
  ...["figure", "from", "to-where-it-went", "when-it-moved", "stage", "period", "amount", "source", "in-this-trail"].flatMap((c) => ["column.money." + c + ".name", "column.money." + c + ".shows"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "state.empty", "state.loading", "state.failed", ...MONEY_WORDS];

export const MONEY_SCREEN = Object.freeze({ id: "money", reads, place, render, acts, words, parts: PARTS });
