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
  nothing: function (cs, to) {
    // K3179: the shell's own "Nothing is here" (interface-shell R35), its title over what it says. R21: a public screen
    // (`to` "public") offers the way an outsider can go, the group's public page, never "Go to Home".
    return '<h1 class="t-title">' + cs.w("shell.unavailable.nothing.title") + '</h1><p class="cs-state" data-state="empty" data-unavailable="nothing">'
      + cs.w("shell.unavailable.nothing.says") + "</p>"
      + (to === "public" ? '<p><a class="cs-btn" data-tone="quiet" href="/" data-public-page>' + cs.w("screen.published.grouppage") + "</a></p>"
        : '<p><a class="cs-btn" data-tone="quiet" href="/app" data-nav>' + cs.w("shell.unavailable.home") + "</a></p>");
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
    // R20: the note is the design's `mk-note`; a refusal is drawn as the shell draws one (`cs-gap`, interface-shell R61).
    return s ? (s.ok ? '<p class="mk-note" role="status" data-said="' + key + '">' : '<p class="cs-gap" data-gap="refused" role="alert" data-said="' + key + '">')
      + s.html + "</p>" : "";
  },
  say: function (cs, view, key, html, ok) {
    const s = view.ui.said || (view.ui.said = {});
    s[key] = { html: html, ok: ok !== false };
    cs.set("said", s);
  },

  /* D29 (K3324 (2)): an answer of `ok: true` that carries a refusal is not success. The refusal it carries (`ok: false`,
     `started: false`, `dispatched: false` or a `withheld` that holds something), else null. */
  carried: function (answer) {
    const r = answer && typeof answer === "object" && answer.result !== undefined ? answer.result : answer;
    if (!r || typeof r !== "object" || Array.isArray(r)) return null;
    const held = r.withheld !== undefined && r.withheld !== null && r.withheld !== false && r.withheld !== 0 && r.withheld !== "";
    return r.ok === false || r.started === false || r.dispatched === false || held ? r : null;
  },
  /* D29: draws the refusal a success-shaped answer carries as the act's refusal beside `key`, in the plane's own words, and
     says it did (true); false when the answer carries none, the act having succeeded. */
  refused: function (cs, view, key, answer) {
    const f = view.parts.carried(answer);
    if (!f) { if (view.ui.said) delete view.ui.said[key]; return false; } // an earlier refusal beside this act is not left standing
    const words = view.parts.refusalText(cs, f);
    view.parts.say(cs, view, key, words || cs.w("state.failed", { reason: String(f.code || f.reason || "") }), false);
    return true;
  },

  /* A date and time the member typed, `YYYY-MM-DD` and `HH:MM`, as `publishat` and `publishatmove` take them; null when
     either is malformed. */
  at: function (date, time) {
    const d = String(date || "").trim(), t = String(time || "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}$/.test(t) ? { date: d, time: t } : null;
  },

  /* R20: a section that holds nothing is not drawn. */
  sec: function (cs, key, inner, o) { return inner ? cs.sec(key, inner, o) : ""; },

  /* R20: a later read's list, drawn only when it holds something: loading and failed are drawn as they are (interface-shell
     R10); an empty read draws nothing. */
  listed: function (cs, r, draw) { return r && r.state === "empty" ? "" : cs.state(r, draw); },

  /* R18: the end of the local day `date` (`YYYY-MM-DD`) in the IANA zone `zone`, as an instant in the record's stamp form
     (`YYYY-MM-DDTHH:MM:SSZ`, UTC); null when the date is no calendar day or the zone is unknown. */
  endOfDay: function (date, zone) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
    if (!m || !zone) return null;
    const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], 23, 59, 59);
    if (new Date(wall).getUTCDate() !== +m[3]) return null;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-US", { timeZone: String(zone), hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric" });
    } catch (e) { return null; }
    const offsetAt = function (ms) {
      const p = {};
      fmt.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
      return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
    };
    let t = wall - offsetAt(wall);
    t = wall - offsetAt(t);
    return new Date(t).toISOString().replace(/\.\d{3}Z$/, "Z");
  },

  /* R18: the local day (`YYYY-MM-DD`) in `zone` on which `instant` falls; "" when either is unusable. */
  localDay: function (instant, zone) {
    const t = Date.parse(String(instant || ""));
    if (isNaN(t) || !zone) return "";
    try {
      const p = {};
      new Intl.DateTimeFormat("en-US", { timeZone: String(zone), year: "numeric", month: "2-digit", day: "2-digit" })
        .formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; });
      return p.year + "-" + p.month + "-" + p.day;
    } catch (e) { return ""; }
  },

  /* The group's IANA zone from `publishpreflight`'s answer (`case-authoring` R75's `publish_at.zone`); "" when none. */
  zoneOf: function (pre) {
    const steps = pre && Array.isArray(pre.steps) ? pre.steps : [];
    const s = steps.find(function (x) { return x && typeof x === "object" && x.publish_at; });
    const z = s && s.publish_at ? s.publish_at.zone || s.publish_at.time_zone : "";
    return typeof z === "string" ? z : "";
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
    const list = [{ kind: "case", id: doc.case_id, edition: doc.edition, sha: doc.doc_sha, text: doc.sign.statement, namespace: doc.sign.namespace || "bio-ratify" }];
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
