/* The `open-file` screen (R5, R6, R9; DEC-168, DEC-173; K1888, K1892), at `/app/open-file/<capture's SHA-256>`.
 * Self-contained functions over the kit `cs` (interface-shell R21 (1)). Nothing here keeps, in the browser or in any
 * request beyond the op's own, which member opened which file (R9): `ui` lives in page memory only, and every request is
 * one of the ops, carrying the capture's digest and nothing of the member's but the session header. */

/* R5: the reads for the capture; `scanstatus` is an administrators' read (file-safety R5), read only for a session that
 * administers (K2996 Q7), as an act refused to the session is not drawn (interface-shell R12). */
function openFileReads(view) {
  const sha = typeof view.subject === "string" ? view.subject.toLowerCase() : "";
  if (!/^[0-9a-f]{64}$/.test(sha)) return {};
  const q = { capture: sha };
  return { threat: { op: "threatof", query: q }, state: { op: "originalstate", query: q },
           notes: { op: "verdictnotes", query: q, empty: (v) => !v || !Array.isArray(v.notes) || !v.notes.length },
           findings: { op: "scanfindings", query: { limit: 1000 } },
           ...(view.me && view.me.administer === true ? { status: { op: "scanstatus", query: {} } } : {}) };
}

/* R5: one of the states, drawn from what `threatof` and `originalstate` answer: held (a scan hold), low, or high. */
function renderOpenFile(cs, view) {
  const sha = typeof view.subject === "string" ? view.subject.toLowerCase() : "";
  const head = `<div class="mk-h"><h1 class="t-title">${cs.w("screen.open-file.heading")}</h1></div>`;
  if (!/^[0-9a-f]{64}$/.test(sha)) return head + `<p class="mk-note">${cs.w("screen.open-file.nofile")}</p>`;
  const U = view.ui || {}, D = view.data || {};
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const refused = U.refused ? `<p class="cs-refusal" role="alert">${cs.esc(U.refused)}</p>` : "";
  const notes = cs.state(D.notes, (v) => `<div class="cs-sheet">${v.notes.map((n) => `<div class="cs-row"><span>${cs.w("screen.open-file.note.line",
      { tool: n.tool || "", engine: [n.engine, n.engine_version].filter(Boolean).join(" "), result: n.result || "" })}</span>`
      + (n.scanned_at ? `<span class="meta">${cs.w("screen.open-file.note.at")} ${cs.date(n.scanned_at)}</span>` : "") + "</div>").join("")}</div>`,
    { empty: "screen.open-file.checks.none" });
  const safeDrawn = (s) => {
    if (!s) return "";
    if (s.kind === "data") return (Array.isArray(s.sheets) ? s.sheets : []).map((sh) => `<h3>${cs.w("screen.open-file.safe.sheet", { name: sh.name || "" })}</h3>`
      + `<div class="tw"><table class="mk-table"><thead><tr><th scope="col">${cs.w("screen.open-file.safe.cell")}</th><th scope="col">${cs.w("screen.open-file.safe.value")}</th></tr></thead><tbody>`
      + (Array.isArray(sh.cells) ? sh.cells : []).map((c) => `<tr><td>${cs.esc(c.ref ?? "")}</td><td>${cs.esc(c.value ?? "")}</td></tr>`).join("")
      + "</tbody></table></div>").join("");
    return said("screen.open-file.safe.ready")
      + (Number.isFinite(s.pages) ? said(s.truncated ? "screen.open-file.safe.truncated" : "screen.open-file.safe.pages", { pages: s.pages, total: s.source_pages ?? s.pages }) : "");
  };
  const body = cs.state(D.threat, (t) => cs.state(D.state, (o) => {
    const held = !!t.scan_hold || o.why === "SCAN_HOLD";
    const kind = held ? "held" : t.threat === "low" ? "low" : "high";
    const reasons = (Array.isArray(t.reasons) ? t.reasons : []).map((r) => r && (r.translation || r.code)).filter(Boolean);
    let out = `<div class="row"><span class="cs-risk" data-risk="${kind}" tabindex="0">${cs.w(`screen.open-file.risk.${kind}`)}</span>`
      + `<span class="mk-small">${cs.w(`screen.open-file.risk.${kind}.means`)}</span></div>`
      + (reasons.length ? `<p class="mk-small">${cs.w("screen.open-file.why", { reasons: reasons.join("; ") })}</p>` : "");
    const safe = cs.sec("screen.open-file.safe", `<p class="mk-small">${cs.w("screen.open-file.safe.about")} `
      + `${cs.mark("origin", "machine")} ${cs.w("screen.open-file.safe.origin")}. ${cs.w("screen.open-file.safe.cite")}</p>`
      + `<div class="mk-acts">${cs.act("safeview", { tone: kind === "low" ? undefined : "primary" })}</div>` + safeDrawn(U.safe));
    const deep = U.deeper || t.latest_deeper;
    const deeper = cs.sec("screen.open-file.deeper", `<p class="mk-small">${cs.w("screen.open-file.deeper.about")}</p>`
      + (deep && deep.state ? `<p class="mk-small">${cs.w("screen.open-file.deeper.state", { state: cs.w(`screen.open-file.deeper.${deep.state === "done" ? "done"
        : deep.state === "running" ? "running" : "queued"}`) })}</p>` : "")
      + `<div class="mk-acts">${cs.act("deepercheck")}</div>`);
    if (kind === "low") {
      out += `<div class="mk-acts">${cs.act("openoriginal", { tone: "primary" })}</div>` + refused
        + cs.sec("screen.open-file.checks", notes) + `<p class="mk-note">${cs.w("screen.open-file.weekly")}</p>`;
    } else if (kind === "high") {
      const warned = o.may_open === true && o.path === "warned";
      out += (o.may_open === true && o.path === "deeper" ? `<div class="mk-acts">${cs.act("openoriginal", { tone: "primary", data: { override: "1" } })}</div>` : "")
        + safe + deeper + cs.sec("screen.open-file.checks", notes)
        + (warned ? cs.sec("screen.open-file.warn", `<div class="cs-dialog"><b>${cs.w("screen.open-file.warn.title")}</b>`
          + `<p class="ends">${cs.w("screen.open-file.warn.ends")}</p>`
          + `<fieldset class="mk-checks"><legend>${cs.w("screen.open-file.warn.confirm")}</legend>`
          + `<label><input type="checkbox" id="co-device"> ${cs.w("screen.open-file.warn.device")}</label>`
          + `<label><input type="checkbox" id="co-macros"> ${cs.w("screen.open-file.warn.macros")}</label></fieldset>`
          + `<div class="mk-acts">${cs.act("openwithwarning")}</div></div>`) : "")
        + refused
        + `<p class="mk-small muted">${cs.w("screen.open-file.warn.notoffered")}</p>`
        + (o.may_open !== true && o.why ? said("screen.open-file.closed", { why: o.why }) : "");
    } else {
      const names = [];
      if (D.findings && D.findings.state === "ok")
        for (const x of (Array.isArray(D.findings.value.findings) ? D.findings.value.findings : []))
          if (x && x.captureSha === sha) for (const n of (Array.isArray(x.findings) ? x.findings : [x.findings])) if (n && !names.includes(String(n))) names.push(String(n));
      out += (names.length ? `<p class="mk-small">${cs.w("screen.open-file.findings", { names: names.join(", ") })}</p>` : "")
        + safe + deeper + refused
        + cs.sec("screen.open-file.risk.held", `<p class="mk-small">${cs.w("screen.open-file.held.about")}</p>`
          + (t.scan_hold ? `<div class="mk-acts">${cs.act("releasescanhold", { tone: "primary" })}</div>` : ""))
        + cs.sec("screen.open-file.checks", notes);
    }
    if (U.opened) out += said("screen.open-file.opened");
    if (U.release) out += said(U.release === "released" ? "screen.open-file.release.done" : "screen.open-file.release.pending");
    return out;
  }), {});
  const status = D.status ? cs.sec("screen.open-file.status", cs.state(D.status, (s) => `<p class="mk-small">${cs.w("screen.open-file.status.line",
    { queued: s.queued ?? 0, overdue: s.overdue ?? 0, held: s.held ?? 0 })}</p>`)) : "";
  return head + body + status;
}

/* R6: an original's bytes, fetched with the session header and handed to the browser as a file (`cs.download`: a `Blob`
 * behind an object address released once the download starts, setup-page R26's form); no link written carries a token.
 * A refusal is drawn beside the act with the owner's words. */
async function sendOpenOriginal(view, el, cs) {
  const sha = String(view.subject || "").toLowerCase();
  const override = el && el.dataset && el.dataset.override === "1";
  const got = await cs.download("openoriginal", { query: { capture: sha, ...(override ? { override: "1" } : {}) } });
  cs.set("refused", got && got.ok ? null : ((got && got.answer && (got.answer.translation || got.answer.reason || got.answer.code)) || ""));
  cs.set("opened", !!(got && got.ok));
  return null;
}

/* R5, R6: the warned path (DEC-173): sent only once both confirmations are ticked; nothing keeps that they were. */
async function sendOpenWithWarning(view, el, cs) {
  if (cs.value("co-device") !== true || cs.value("co-macros") !== true) return { refuse: "screen.open-file.warn.both" };
  const sha = String(view.subject || "").toLowerCase();
  const got = await cs.download("openwithwarning", { query: { capture: sha }, body: { warned: { own_device: true, no_macros: true } } });
  cs.set("refused", got && got.ok ? null : ((got && got.answer && (got.answer.translation || got.answer.reason || got.answer.code)) || ""));
  cs.set("opened", !!(got && got.ok));
  return null;
}

/* R5: the safe view (`op=safeview`): a spreadsheet's figures drawn as data; a page view handed over as a file, marked a
 * derived copy. */
async function sendSafeView(view, el, cs) {
  const sha = String(view.subject || "").toLowerCase();
  const got = await cs.download("safeview", { query: { capture: sha } });
  const a = (got && got.answer) || {};
  if (!got || !got.ok) { cs.set("refused", a.translation || a.reason || a.code || ""); return null; }
  cs.set("refused", null);
  cs.set("safe", a.kind === "data" ? a : { kind: "pdf", pages: a.pages, source_pages: a.source_pages, truncated: a.truncated === true });
  return null;
}

/* R5: a deeper check (`op=deepercheck`), any member who may see the file. */
function sendDeeperCheck(view) {
  return { query: { capture: String(view.subject || "").toLowerCase() } };
}
function doneDeeperCheck(view, answer, cs) {
  cs.set("deeper", { state: answer && answer.state });
}

/* R5: a hold released with a reason (`op=releasescanhold`, file-safety R17; the shell's reason field, R11), offered only
 * while file-safety answers the file held. The first reason waits for a second member's. */
function sendReleaseScanHold(view) {
  return { query: { capture: String(view.subject || "").toLowerCase() } };
}
function doneReleaseScanHold(view, answer, cs) {
  cs.set("release", answer && answer.state === "released" ? "released" : "pending");
}

export const OPEN_FILE_SCREEN = Object.freeze({
  id: "open-file",
  reads: openFileReads,
  render: renderOpenFile,
  acts: Object.freeze([
    Object.freeze({ op: "openoriginal", label: "act.openoriginal.label.open-file", send: sendOpenOriginal }),
    Object.freeze({ op: "openwithwarning", label: "act.openwithwarning.label.open-file", send: sendOpenWithWarning }),
    Object.freeze({ op: "safeview", label: "act.safeview.label.open-file", send: sendSafeView }),
    Object.freeze({ op: "deepercheck", label: "act.deepercheck.label.open-file", send: sendDeeperCheck, done: doneDeeperCheck }),
    Object.freeze({ op: "releasescanhold", label: "act.releasescanhold.label.open-file", send: sendReleaseScanHold, done: doneReleaseScanHold }),
  ]),
});
