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
          settle({ state: "failed", fields: f, refusal: { code: String(f.code || f.reason || ""), words: view.parts.refusalText(cs, f) || cs.w("shell.unread") } });
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

  /* R53 (C53; DEC-376): the `references` a project's document holds, each live or severed as `citation` R15 keeps it: `{target, rel, status,
     note}` in the document's order, read from the front matter of `image`'s `bundle.md`. [] when it holds none. */
  references: function (image) {
    const text = image && typeof image === "object" ? image["bundle.md"] : image;
    if (typeof text !== "string") return [];
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    const val = function (v) { v = String(v).trim(); try { if (v.startsWith("\"")) v = JSON.parse(v); } catch (e) { /* the raw value */ } return v; };
    const out = [];
    let on = false, cur = null;
    head.split("\n").forEach(function (line) {
      const top = /^(\w+):\s*(.*)$/.exec(line);
      if (top) { on = top[1] === "references" && top[2].trim() === ""; cur = null; return; }
      if (!on) return;
      const item = /^\s+-\s+(\w+):\s*(.*)$/.exec(line);
      if (item) { cur = {}; cur[item[1]] = val(item[2]); out.push(cur); return; }
      const sub = /^\s{4,}(\w+):\s*(.*)$/.exec(line);
      if (sub && cur) cur[sub[1]] = val(sub[2]);
    });
    return out.filter(function (r) { return r && r.target; });
  },

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

  /* A refusal the plane answered (a read that failed, or one inside a read's value: `blockers`, `first`), in the words the shell
     gives it (interface-shell R13, R61, R83; DEC-342): `refusal.<CODE>` when the list holds it, else the answer's translation,
     else `refusal.uncatalogued` with the code as the act gave it; never the builder's `detail`. "" when it names no code and
     carries no translation. */
  refusalText: function (cs, f) {
    if (!f || typeof f !== "object") return "";
    const code = String(f.code || f.reason || "");
    if (code) { const held = cs.w("refusal." + code, f); if (held !== "refusal." + code) return held; }
    if (typeof f.translation === "string" && f.translation) return cs.esc(f.translation);
    return code ? cs.w("refusal.uncatalogued") + " <code>" + cs.esc(code) + "</code>" : "";
  },

  /* What an act said once it was answered, beside the screen's own section: `{key, html, ok}` in `view.ui.said`. */
  said: function (view, key) {
    const s = view.ui.said && view.ui.said[key];
    // R20: the note is the design's `mk-note`; a refusal is drawn as the shell draws one (`cs-gap`, interface-shell R61).
    // K3742: a state drawn in a fold is a block, so it sits in a `div`, never a paragraph.
    const tag = /^<details/.test(s ? s.html : "") ? "div" : "p";
    return s ? (s.ok ? "<" + tag + ' class="mk-note" role="status" data-said="' + key + '">' : "<" + tag + ' class="cs-gap" data-gap="refused" role="alert" data-said="' + key + '">')
      + s.html + "</" + tag + ">" : "";
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

  /* K3742: a state the design draws "in a fold" is drawn inside a `details` headed by its `.summary` key, open whenever
     it is drawn (a roster row is never folded). */
  fold: function (cs, summaryKey, inner) {
    return '<details class="mk-details" open data-fold="' + cs.esc(summaryKey) + '"><summary>' + cs.w(summaryKey) + "</summary>" + inner + "</details>";
  },

  /* The review copy a ceremony draws from: the one its address names (read as the screen's own), else the newest draft's. */
  copyOf: function (view) {
    const r = view.data.copy || (view.ui.later && view.ui.later.copy);
    return r && r.state === "ok" ? r.value : null;
  },

  /* A kit sentence (`cs.w`, HTML) read back as plain text, for a kit part that escapes the text it is given. */
  plain: function (html) {
    return String(html).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, function (m, e) { return { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]; });
  },

  /* R30 (DEC-276): an act's explanation in its place: the button's explanation carries `now`'s word where the kit drew
     `was`'s (the kit names no way for a screen to choose an act's explanation); unchanged when `was` is not in it. */
  explained: function (cs, html, was, now) {
    return String(html).split(cs.esc(cs.w(was))).join(cs.esc(cs.w(now)));
  },

  /* R27, R41 (`review` R35): the team's time zone as the member door's copy answer carries it: its own top-level `zone`, else
     the first roster row's; "" when none is held, never UTC in its place. */
  copyZone: function (copy) {
    const rows = copy && Array.isArray(copy.grants) ? copy.grants : [];
    const own = copy && typeof copy.zone === "string" && copy.zone ? copy.zone : null;
    const held = own || (rows.find(function (g) { return g && typeof g.zone === "string" && g.zone; }) || {}).zone || "";
    return { zone: typeof held === "string" ? held : "" };
  },

  /* R27: the zone drawn as the browser names it: its generic name and its city (a zone with no key of its own). */
  zoneName: function (zone) {
    const city = String(zone).split("/").pop().replace(/_/g, " ");
    let generic = "";
    try {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: String(zone), timeZoneName: "longGeneric" }).formatToParts(new Date())
        .find(function (x) { return x.type === "timeZoneName"; });
      generic = p ? p.value : "";
    } catch (e) { generic = ""; }
    return generic && generic !== city ? generic + ", " + city : city;
  },

  /* R27: the wall-clock time `HH:MM` of `instant` in `zone`; "" when either is unusable. */
  localTime: function (instant, zone) {
    const t = Date.parse(String(instant || ""));
    if (isNaN(t) || !zone) return "";
    try {
      return new Intl.DateTimeFormat("en-GB", { timeZone: String(zone), hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(t));
    } catch (e) { return ""; }
  },

  /* R41 (DEC-299): a wall-clock time `HH:MM` on the 12-hour clock, as `time.clock` writes it (midnight 12:00 AM, noon 12:00 PM);
     "" when it is no time of day. */
  clock: function (cs, hhmm) {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || ""));
    if (!m || +m[1] > 23 || +m[2] > 59) return "";
    const h = +m[1];
    return cs.w("time.clock", { hour: String(h % 12 || 12), minute: m[2], ampm: cs.w(h < 12 ? "time.am" : "time.pm") });
  },

  /* R27: the end of a review link as `screen.review-outside.until.zone` says it (date, time and zone in the team's zone);
     "" when the zone or the instant is not held (no UTC is drawn in its place). */
  untilIn: function (cs, view, until, zone) {
    const P = view.parts, day = P.localDay(until, zone), time = P.localTime(until, zone);
    if (!day || !time) return "";
    return cs.w("screen.review-outside.until.zone", { date: { html: cs.date(day) }, time: { html: P.clock(cs, time) }, zone: P.zoneName(zone) });
  },

  /* A date and time the member typed, `YYYY-MM-DD` and `HH:MM`, as `publishat` and `publishatmove` take them; null when
     either is malformed. */
  at: function (date, time) {
    const d = String(date || "").trim(), t = String(time || "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}$/.test(t) ? { date: d, time: t } : null;
  },

  /* A section whose heading is explained by several sentences, each its own key, in order (R37, R38, R43). */
  secTips: function (cs, key, inner, helpKeys) { return cs.sec(key, inner, { help: helpKeys }); },

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

  /* R50 (C1; `case-authoring` R78): what the ceremony's requests name: the draft and the project. The findings, the case and the
     authored words are the draft's and are never sent again; only what the member attested in this step is added. */
  caseArgs: function (copy, draft) {
    return { draft: draft, project: copy && copy.project };
  },
  /* R44, R46, R50, R51 (C1, C2, C5, C6; DEC-376, DEC-377): what the member attested in this step, read from its controls when the act
     is pressed: the contradictions ticked, each with her words (`tensionsDisclosed`); the documents listed as self-attested only, each
     with the reason it requires (`selfAttested`); and the declared bias for this edition (`biasAcknowledgement`). `body` holds only what
     was given, so a request names nothing else; `held` is what the controls show again after a redraw. `refuse` is the word key of
     the reason a ticked document lacks. */
  attested: function (view, cs) {
    const ui = view.ui, listOf = function (v) { return Array.isArray(v) ? v : []; };
    const body = {}, held = { disc: [], words: {}, sa: [], why: {}, bias: "" };
    const tens = ui.tensionIds || [], docs = ui.confIds || [];
    listOf(cs.value("ce-disc")).forEach(function (id) {
      const i = tens.indexOf(id), words = i < 0 ? "" : String(cs.value("ce-dw-" + i) || "").trim();
      held.disc.push(id);
      if (words) held.words[id] = words;
    });
    if (held.disc.length) body.tensionsDisclosed = held.disc.map(function (id) { return held.words[id] ? { candidate: id, words: held.words[id] } : { candidate: id }; });
    let refuse = null;
    listOf(cs.value("ce-sa")).forEach(function (sha) {
      const i = docs.indexOf(sha), why = i < 0 ? "" : String(cs.value("ce-sar-" + i) || "").trim();
      held.sa.push(sha);
      held.why[sha] = why;
      if (!why) refuse = "screen.ceremony.conf.refused.noreason1";
    });
    if (held.sa.length) body.selfAttested = held.sa.map(function (sha) { return { capture: sha, reason: held.why[sha] }; });
    const bias = cs.value("ce-bias");
    if (typeof bias === "string" && bias.trim()) { held.bias = bias.trim(); body.biasAcknowledgement = held.bias; }
    return { body: body, held: held, refuse: refuse };
  },

  /* R60, R63 (L14; DEC-384): the heading of a draft is the short `title` `review` answers ("Case X, edition N", `review.title.draft` or
     `review.title.untitled`, already in the design's words), never the identity sentence, which is body text (`review.body.nocase`
     where the draft names no case). null when the copy states none. */
  titleOf2: function (cs, copy, fallback) {
    return copy && typeof copy.title === "string" && copy.title ? copy.title : fallback;
  },
  noCase: function (cs, copy) {
    const c = copy && copy.case ? copy.case : {};
    return copy && !c.case_id ? '<p class="mk-sub" data-nocase>' + cs.w("review.body.nocase") + "</p>" : "";
  },

  /* the findings a review copy names (a draft that names none cannot be published, R66) */
  findingsOf: function (copy) { return (copy && Array.isArray(copy.findings) ? copy.findings : []).map(function (f) { return f.target; }).filter(Boolean); },

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
