/* screens-publish: the helpers every screen of this module hands the shell as its `parts` (interface-shell R21, K3002).
 * Each is self-contained: it refers only to its parameters and the language's own globals, so the shell serialises it
 * beside the screen's functions and hands it in as `view.parts`. A screen calls `view.parts.<name>(cs, view, …)`. */

export const PARTS = Object.freeze({
  /* A read that waits on another read's answer (a case's document once the draft names its case): sent once per query
     through `cs.call`, kept in the screen's page memory (`view.ui.later`), and answered in R10's four states, as
     `cs.state` draws them: `{state: "loading" | "empty" | "failed" | "ok", value, refusal}`. `isEmpty(value)` says when a
     value is the empty state. */
  later: function (cs, view, key, op, req, isEmpty) {
    const L = view.ui.later || (view.ui.later = {});
    const q = JSON.stringify(req || {});
    if (!L[key] || L[key].q !== q) {
      L[key] = { q: q, state: "loading", value: null, refusal: null };
      const settle = function (o) { L[key] = Object.assign({ q: q, value: null, refusal: null }, o); cs.set("later", L); };
      cs.call(op, req || {}).then(function (a) {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false)) {
          const f = r && r.ok === false ? r : a || {};
          const code = String(f.code || f.reason || "");
          settle({ state: "failed", refusal: { code: code, words: cs.esc(f.translation || f.detail || code) } });
        } else if (typeof isEmpty === "function" && isEmpty(r)) settle({ state: "empty", value: r });
        else settle({ state: "ok", value: r });
      }, function () { settle({ state: "failed", refusal: null }); });
    }
    return L[key];
  },

  /* K3171: the parts of the subject the address must carry (`<a>/<b>`), or null when one is absent: the screen then
     sends no subject read and draws interface-shell R35's "Nothing is here" (`nothing`). */
  subject: function (view, n) {
    const s = String(view.subject || "").split("/");
    for (let i = 0; i < n; i++) if (!s[i]) return null;
    return s;
  },
  nothing: function (cs) {
    // K3179: the shell's own "Nothing is here" (interface-shell R35), its title over what it says
    return '<h1 class="t-title">' + cs.w("shell.unavailable.nothing.title") + '</h1><p class="cs-state" data-state="empty" data-unavailable="nothing">'
      + cs.w("shell.unavailable.nothing.says") + '</p><p><a class="cs-btn" data-tone="quiet" href="/app" data-nav>' + cs.w("shell.unavailable.home") + "</a></p>";
  },

  /* After an act, the reads that wait on others are read again with the rest (interface-shell R10, this module's R10). */
  forget: function (view) { view.ui.later = {}; },

  /* An answer's own value: the door's `result` when it wraps one, else the answer itself. */
  value: function (answer) { return answer && typeof answer === "object" && answer.result !== undefined ? answer.result : answer; },

  /* A project's title from its bundle's front matter, as `image` answers it (the path's project step, interface-shell R8). */
  titleOf: function (image, fallback) {
    const text = image && typeof image === "object" ? image["bundle.md"] : image;
    if (typeof text !== "string") return String(fallback || "");
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    const m = /^title:\s*(.*)$/m.exec(head) || /^objective:\s*(.*)$/m.exec(head);
    let t = m ? m[1].trim() : "";
    try { if (t.startsWith("\"")) t = JSON.parse(t); } catch (e) { /* the raw value is drawn */ }
    return t || String(fallback || "");
  },

  /* A refusal the plane answered inside a read's value (`blockers`, `first`): its words as the plane gave them. */
  refusalText: function (cs, f) {
    if (!f || typeof f !== "object") return "";
    return cs.esc(f.translation || f.detail || f.code || f.reason || "");
  },

  /* What an act said once it was answered, beside the screen's own section: `{key, html, ok}` in `view.ui.said`. */
  said: function (view, key) {
    const s = view.ui.said && view.ui.said[key];
    return s ? '<p class="' + (s.ok ? "cs-note" : "cs-refusal") + '" role="' + (s.ok ? "status" : "alert") + '" data-said="' + key + '">' + s.html + "</p>" : "";
  },
  say: function (cs, view, key, html, ok) {
    const s = view.ui.said || (view.ui.said = {});
    s[key] = { html: html, ok: ok !== false };
    cs.set("said", s);
  },

  /* A date and time the member typed, `YYYY-MM-DD` and `HH:MM`, as `publishat` and `publishatmove` take them; null when
     either is malformed. */
  at: function (date, time) {
    const d = String(date || "").trim(), t = String(time || "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}$/.test(t) ? { date: d, time: t } : null;
  },

  /* The members, project and case `publish` and `publishpreflight` take for a draft, from its review copy's answer
     (`case-authoring` R34's arguments): its findings as `targets`, the case named or a new one. */
  caseArgs: function (copy, draft) {
    const c = (copy && copy.case) || {};
    const args = { draft: draft, project: copy && copy.project,
      targets: (copy && Array.isArray(copy.findings) ? copy.findings : []).map(function (f) { return f.target; }).filter(Boolean) };
    if (c.case_id && !c.newCase) args.caseId = c.case_id; else args.newCase = true;
    return args;
  },

  /* What one sitting signs (interface-shell R41; ratification R52; this module's R13): the case statement `casedocument`
     answers, one `bio-ratify <id> <sha>` line per finding the prepared edition pins, and one per piece of evidence the
     signed document cites (`citations`' `{target, version}`), each once and none a finding already. */
  sitting: function (doc, prepared) {
    if (!doc || !doc.sign || typeof doc.sign.statement !== "string") return null;
    const list = [{ kind: "case", id: doc.case_id, sha: doc.doc_sha, text: doc.sign.statement, namespace: doc.sign.namespace || "bio-ratify" }];
    const seen = {};
    const findings = prepared && Array.isArray(prepared.findings) ? prepared.findings : [];
    findings.forEach(function (f) {
      if (!f || !f.target || !f.bundleSha || seen[f.target]) return;
      seen[f.target] = true;
      list.push({ kind: "finding", id: f.target, sha: f.bundleSha, text: "bio-ratify " + f.target + " " + f.bundleSha + "\n", namespace: "bio-ratify" });
    });
    (Array.isArray(doc.citations) ? doc.citations : []).forEach(function (c) {
      const id = c && (c.target || c.bundle_id), sha = c && (c.version || c.bundle_sha);
      if (!id || typeof sha !== "string" || !/^[0-9a-f]{64}$/.test(sha) || seen[id]) return;
      seen[id] = true;
      list.push({ kind: "evidence", id: id, sha: sha, text: "bio-ratify " + id + " " + sha + "\n", namespace: "bio-ratify" });
    });
    return list;
  },

  /* The UTF-8 bytes of a statement the member's key signs (interface-shell R41's `{label, bytes, namespace}`). */
  bytes: function (text) { return new TextEncoder().encode(String(text)); },
});
