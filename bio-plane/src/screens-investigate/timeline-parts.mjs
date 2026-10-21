/* screens-investigate R33 (2), (3): the timeline's states b and c, handed to the screen as `view.parts` beside PARTS (each part
 * self-contained, interface-shell R21). State b is one matter the project follows through a progression: its steps in order
 * with the documents threaded to them, how sure the chain is, and the findings; state c is the progression itself: its steps,
 * its basis, every version. A finding reports and never decides, and nothing here says "overdue" or "late": the sentence of a
 * missing step is the finding's own `says` (progressions R45), read through `word`, never composed here. The three sections that
 * are the reads `instance` (states a and b) and `progression` (state c) carry that act, as the design draws them (B14). */

export const TIMELINE_PARTS = Object.freeze({
  /** R33 (2): one matter (`instance`), drawn under the project's timeline. */
  matter(cs, view, project) {
    const P = view.parts;
    const S = "screen.timeline.";
    const [, , key, eid] = String(view.subject || "").split("/");
    const back = `<p class="mk-small"><a data-nav href="/app/timeline/${encodeURIComponent(project)}">${cs.w(S + "name")}</a></p>`;
    return back + cs.state("matter", view, (m) => {
      if (!m || m.found === false) return `<p class="cs-state" data-state="empty">${cs.w("state.empty")}</p>`;
      const stages = Array.isArray(m.stages) ? m.stages : [];
      const findings = Array.isArray(m.findings) ? m.findings : [];
      const threads = Array.isArray(m.threads) ? m.threads : [];
      const last = threads.length ? threads[threads.length - 1] : null;
      const words = { always: "always", usually: "usually", sometimes: "sometimes", unless_exception: "unless", never: "never" };
      const handle = (h) => String(h || "").replace(/^member:/, "");
      const labelOf = (st, i) => `${i + 1} · ${cs.esc(st.label || st.stage_key)}`;
      const titleOf = (sha) => {
        const rows = view.data.docs && view.data.docs.state === "ok" && view.data.docs.value && Array.isArray(view.data.docs.value.held) ? view.data.docs.value.held : [];
        const r = rows.find((x) => x && x.capture && x.capture.sha256 === sha);
        return (r && r.title) || "";
      };
      const docLine = (d) => {
        const title = titleOf(d.capture_sha) || (d.bundle_id ? "" : "");
        const ref = P.refOf(cs, d.bundle_id || d.capture_sha, title || P.plain(cs, S + "source"), [], d.bundle_id ? "document" : "capture");
        const dated = d.own_date && d.own_date.value
          ? cs.w("progression.threadedby", { date: cs.date(String(d.own_date.value).slice(0, 10), { year: true }), who: cs.esc(handle(last && last.threaded_by)), when: cs.date(String((last && last.at) || "").slice(0, 10), { year: true }) })
          : cs.mark("gap", "undetermined", { reason: d.own_date_why || "" });
        return `${ref} <span class="mk-small">${dated}</span>`;
      };
      const says = (stage) => {
        const f = findings.find((x) => x && x.stage_key === stage && x.says && x.says.key);
        return f ? cs.w(f.says.key, f.says.vars || {}) : "";
      };
      const stepRow = (st, i) => {
        const req = cs.w("progression.req." + (words[st.required] || "sometimes"));
        const docs = Array.isArray(st.documents) ? st.documents : [];
        const body = docs.length ? docs.map(docLine).join("<br>")
          : st.discharged ? `<span class="mk-small">${cs.w("progression.discharge")}</span>`
          : `<span class="mk-small">${says(st.stage_key) ? cs.w("progression.nodoc") + " " + says(st.stage_key) : st.required === "sometimes" || st.required === "never" ? cs.w(S + "step.none.optional") : cs.w("progression.nodoc")}</span>`;
        return cs.row(st.present && /^[A-D]$/.test(st.grade || "") ? cs.grade("capture", st.grade) : "", `<b>${labelOf(st, i)}</b> · ${req}<br>${body}`);
      };
      const stageOpts = stages.map((st, i) => ({ value: st.stage_key, text: `${i + 1} · ${st.label || st.stage_key}` }));
      const findingOpts = findings.filter((f) => f && f.stage_key).map((f) => ({ value: f.stage_key + "|" + f.definition_version, text: `${stages.findIndex((s) => s.stage_key === f.stage_key) + 1} · ${f.stage_label || f.stage_key}` }));
      const findingRow = (f) => {
        const n = stages.findIndex((s) => s.stage_key === f.stage_key) + 1;
        const d = f.disposition && f.disposition.applies ? f.disposition : null;
        /* R45: a finding's state (`progressions` R46) is read by key; one with no decision is Open */
        const state = ["open", "dismissed", "deferred"].includes(f.state) ? f.state : "open";
        return cs.row(cs.mark("gap", "undetermined", { reason: d ? String(d.reason || "") : "" }),
          `<b>${n || ""} · ${cs.esc(f.stage_label || f.stage_key || "")}</b> <span class="mk-small" data-finding-state="${state}" tabindex="0" data-level="1" data-tip="${cs.esc(cs.w("progression.finding.state.help"))}">${cs.w("progression.finding.state." + state)}</span> <span class="mk-small">${f.says && f.says.key ? cs.w(f.says.key, f.says.vars || {}) : cs.w("progression.nodoc")}</span>`
          + (d ? ` <span class="rec">${cs.esc(String(d.reason || ""))}</span>` : ""));
      };
      const fold = (summary, inner) => `<details class="mk-details" open><summary>${cs.w(summary)}</summary>${inner}</details>`;
      const chain = m.grade_determined && m.grade ? `<p>${cs.grade("capture", m.grade)}</p>` : `<p>${cs.w("progression.chain.undetermined")}</p>`;
      return `<p class="mk-sub"><b>${cs.esc((m.entity && m.entity.label) || "")}</b> · ${cs.w("progression.followed", { progression: cs.esc(m.label || ""), n: String(m.definition_version) })}</p>`
        + `<p class="mk-note">${cs.w("progression.finding.never")}</p>`
        + P.actSec(cs.sec("progression.steps", cs.sheet(stages.map(stepRow).join("")), { help: S + "tip.steps" }), "instance")
        + cs.sec("progression.chain", chain, { help: S + "tip.sure" })
        + (findings.length ? cs.sec("progression.findings", cs.sheet(findings.map(findingRow).join("")), { help: S + "tip.findings" }) : "")
        + fold("progression.thread", cs.choice("pm-thread-stage", "progression.steps", stageOpts, {}) + P.docChoice(cs, view, "pm-thread-doc") + cs.act("thread", { label: "progression.thread" }))
        + fold("progression.discharge", cs.choice("pm-dis-stage", "progression.steps", stageOpts, {}) + P.docChoice(cs, view, "pm-dis-doc")
          + cs.field("pm-dis-reason", "entity.relation.why", { area: true, rec: true }) + cs.field("pm-dis-cite", "entity.relation.cite", { help: "entity.relation.cite.help" })
          + cs.act("discharge", { label: "progression.discharge" }))
        + (findingOpts.length ? fold("progression.setaside", cs.choice("pm-aside-finding", "progression.findings", findingOpts, {})
          + cs.field("pm-aside-reason", "entity.relation.why", { area: true, rec: true }) + cs.act("proposedispose", { label: "progression.setaside" })) : "");
    });
  },
  /** R33 (3): one progression (`progression`), drawn under the project's timeline. */
  progressionDef(cs, view, project) {
    const S = "screen.timeline.";
    const [, , key] = String(view.subject || "").split("/");
    const back = `<p class="mk-small"><a data-nav href="/app/timeline/${encodeURIComponent(project)}">${cs.w(S + "name")}</a></p>`;
    return back + cs.state("def", view, (v) => {
      /* R49: a progression the record does not hold is the empty state with the form that defines it beside it */
      if (!v || v.found === false) return `<p class="cs-state" data-state="empty">${cs.w("state.empty")}</p>` + view.parts.defineFold(cs);
      const stages = Array.isArray(v.stages) ? v.stages : [];
      const handle = (h) => String(h || "").replace(/^member:/, "");
      const words = { always: "always", usually: "usually", sometimes: "sometimes", unless_exception: "unless", never: "never" };
      const sub = (n, by, at) => cs.w(S + "progression.sub", { what: cs.esc(v.label || ""), n: String(n), name: cs.esc(handle(by)), date: cs.date(String(at || "").slice(0, 10), { year: true }) });
      const noOf = (k) => stages.findIndex((s) => s.stage_key === k) + 1;
      const days = (w) => { const m = /^(\d+)\s*days?$/.exec(String(w || "")); return m ? m[1] : null; };
      const stepRow = (st, i) => cs.row("", `<b>${i + 1} · ${cs.esc(st.label || st.stage_key)}</b> · ${cs.w("progression.req." + (words[st.required] || "sometimes"))}<br><span class="mk-small">`
        + (st.after_stage ? (days(st.within_interval) !== null ? cs.w(S + "step.within", { days: days(st.within_interval), n: String(noOf(st.after_stage)) }) : cs.esc(String(st.within_interval || ""))) : "")
        + ` · ${cs.esc(String(st.cardinality || ""))}</span>`);
      const versions = Array.isArray(v.versions) ? v.versions : [];
      const basisOf = (b) => (b && b.statement ? `<span class="rec">${cs.esc(b.statement)}</span>${b.citation ? ` <span class="mk-small">${cs.esc(b.citation)}</span>` : ""}` : "");
      const stepsText = stages.map((st) => [st.stage_key, st.label || "", st.after_stage || "", st.within_interval || "", st.required, st.cardinality].join(" | ")).join("\n");
      const fold = (summary, inner) => `<details class="mk-details" open><summary>${cs.w(summary)}</summary>${inner}</details>`;
      /* R45: the six parts of a step's line, in order, each by its label */
      const columns = `<p class="mk-small" data-columns="steps">${["key", "label", "after", "within", "required", "cardinality"].map((c) => cs.w("progression.steps.label." + c)).join(" | ")}</p>`;
      return `<p class="mk-sub"><b>${cs.esc(v.label || "")}</b> · ${sub(v.version, v.declared_by, v.at)}</p>`
        + view.parts.actSec(cs.sec("progression.steps", cs.sheet(stages.map(stepRow).join("")), { help: S + "tip.stepsdef" }), "progression")
        + cs.sec("progression.basis", `<p>${basisOf(v.basis)}</p>` + cs.sheet(versions.map((x) => cs.row("", `<span class="mk-small">${sub(x.version, x.declared_by, x.at)}</span> ${basisOf(x.basis)}`)).join("")), { help: S + "tip.basis" })
        + fold("progression.revise", `<p class="mk-small">${cs.w("progression.revise.help")}</p>` + cs.field("pd-rv-basis", "progression.basis", { area: true, rec: true, help: "progression.basis.help" }) + cs.field("pd-rv-cite", "entity.relation.cite", { help: "entity.relation.cite.help" })
          + columns + cs.field("pd-rv-steps", "progression.steps", { area: true, rec: true, value: stepsText, help: "progression.steps.help" })
          + cs.act("progressiondefine", { label: "progression.revise", data: { mode: "revise", key: String(key || "") } }))
        + view.parts.defineFold(cs);
    });
  },
  /** R33 (3), R49: "Define a progression": the fold that declares one (`progressiondefine`), drawn in state c, beside the empty state of
   *  a progression the record does not hold, and on the project's timeline whether or not it follows a matter yet. */
  defineFold(cs) {
    const S = "screen.timeline.";
    const columns = `<p class="mk-small" data-columns="steps">${["key", "label", "after", "within", "required", "cardinality"].map((c) => cs.w("progression.steps.label." + c)).join(" | ")}</p>`;
    return `<details class="mk-details" open data-define="1"><summary>${cs.w("progression.define")}</summary>` + cs.field("pd-name", "theme.name.label", { help: "theme.name.help" })
      + cs.field("pd-basis", "progression.basis", { area: true, rec: true, help: "progression.basis.help" })
      + cs.field("pd-cite", "entity.relation.cite", { help: "entity.relation.cite.help" }) + `<p class="mk-small">${cs.w(S + "progression.steps.note")}</p>` + columns
      + cs.field("pd-steps", "progression.steps", { area: true, rec: true, help: "progression.steps.help" })
      + cs.act("progressiondefine", { label: "progression.define.go", tone: "primary", data: { mode: "define" } }) + "</details>";
  },
  /** R33 (3): a definition's steps from the lines a member typed: `key | label | after | within | required | cardinality`;
   *  a blank required is "sometimes" and a blank cardinality "0..n", which raise no finding on their own. */
  stagesOf(text) {
    return String(text || "").split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((c) => c[0])
      .map((c) => ({ key: c[0], label: c[1] || c[0], after: c[2] || null, within: c[3] || null, required: c[4] || "sometimes", cardinality: c[5] || "0..n" }));
  },
});
