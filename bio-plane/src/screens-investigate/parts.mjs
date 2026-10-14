/* screens-investigate: the small readers every screen of the module shares, handed to each screen as `view.parts`
 * (interface-shell R21, K3002: each part self-contained, serialised by the shell beside the screen's functions). Each
 * takes what it needs as parameters, never another part, so its text alone is its whole meaning. */

export const PARTS = Object.freeze({
  /** A refusal drawn in words beside what it answers (interface-shell R13): its translation, else the code. */
  said(cs, f) {
    const words = f && f.translation ? cs.esc(f.translation) : cs.w("state.failed", { reason: (f && f.code) || cs.w("shell.noanswer") });
    return `<p class="cs-gap" data-gap="refused" role="alert" data-refusal="${cs.esc((f && f.code) || "")}">${words}</p>`;
  },
  /** A read made as the screen draws, once per key: its outcome, in R10's four states, kept in the screen's memory
   *  (`view.ui.later`) and drawn on arrival. A refusal (the plane's `ok: false` or explore's `refused`) is `failed`. */
  later(cs, view, key, op, o) {
    const L = view.ui.later || (view.ui.later = {});
    const q = JSON.stringify(o || {});
    if (!L[key] || L[key].q !== q) {
      L[key] = { q, state: "loading", value: null, refusal: null };
      const settle = (x) => { L[key] = Object.assign({ q }, x); cs.set("later", L); };
      cs.call(op, o || {}).then((a) => {
        const r = a && typeof a === "object" && a.result !== undefined ? a.result : a;
        const bad = !a || a.ok === false || (r && typeof r === "object" && (r.ok === false || typeof r.refused === "string"));
        if (bad) {
          const f = !a ? {} : a.ok === false ? a : r;
          const code = String(f.code || f.reason || f.refused || "");
          const t = f.translation || f.why || null;
          settle({ state: "failed", value: null, refusal: { code, words: t ? cs.esc(t) : cs.esc(code || cs.w("shell.noanswer")) } });
        } else settle({ state: "ok", value: r, refusal: null });
      }, () => settle({ state: "failed", value: null, refusal: { code: "", words: cs.w("shell.noanswer") } }));
    }
    return L[key];
  },
  /** The page clock's calendar day, `YYYY-MM-DD` (the shell's `cs.now()`, the harness's fake clock in tests). */
  today(cs) {
    return new Date(cs.now()).toISOString().slice(0, 10);
  },
  /** A passage the member names: a capture's SHA-256 and, optionally, its page (counted from 1), in content's extent
   *  grammar (a PDF page counted from 0, else the whole document). */
  passage(sha, page) {
    const s = String(sha || "").trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(s)) return null;
    const n = Number(String(page || "").trim());
    return { captureSha: s, extent: Number.isInteger(n) && n > 0 ? { kind: "pdf-page", page: n - 1 } : { kind: "document" } };
  },
  /** A record id drawn as a reference to its screen (interface-shell R16): a person or organisation the record follows
   *  opens `person`, a document, capture, question or project its own; anything else carries its card only. */
  refOf(cs, id, label, facts, kind) {
    const s = String(id || "");
    const k = kind || (/^ENT-/.test(s) ? "person" : /^[0-9a-f]{64}$/.test(s) ? "capture" : /^(INFO|INF)-/.test(s) ? "document"
      : /^INQ-/.test(s) ? "question" : /^PROJ-/.test(s) ? "project" : "record");
    return cs.ref(k, s, label || s, facts || []);
  },
  /** A record document's front matter: its top-level scalars, and its `references` as `{target, rel, status}`. */
  front(text) {
    const out = { refs: [] };
    if (typeof text !== "string") return out;
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    let inRefs = false, cur = null;
    for (const line of head.split("\n")) {
      if (/^references:\s*$/.test(line)) { inRefs = true; continue; }
      if (inRefs && /^\s+-\s*/.test(line)) { cur = {}; out.refs.push(cur); }
      if (inRefs && /^\s+/.test(line) && cur) {
        const m = /^\s+(?:-\s*)?(\w+):\s*(.*)$/.exec(line);
        if (m) cur[m[1]] = m[2].trim();
        continue;
      }
      inRefs = false;
      const m = /^(\w+):\s*(.*)$/.exec(line);
      if (m) {
        let v = m[2].trim();
        try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* the raw value is kept */ }
        out[m[1]] = v;
      }
    }
    return out;
  },
  /** A date known only by its month (`YYYY-MM`): its month's name, as `date.month.*` holds it (interface-shell R6). */
  month(cs, ym) {
    const m = /^(\d{4})-(\d{2})$/.exec(String(ym || ""));
    if (!m) return null;
    const names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const n = Number(m[2]) - 1;
    return n >= 0 && n < 12 ? { month: cs.w("date.month." + names[n]), year: m[1] } : null;
  },

  /** R18: the connection graph, drawn from `exploregraph`'s answer `g` ({centre, nodes, steps, stopped}) as the design's SVG
   *  (lines in their class's mark, a grade chip on each, the stops dashed) and beneath it the same things as a list: each
   *  node a reference with its kind's word and a control to make it the centre, each step with its word, grade and
   *  citation. `o`: `{names, groupOf(kind), trail, act}`; `act` names the op a node's control sends (or null: a plain link
   *  to Explore). No score, rank or "most connected" is drawn (K1486). */
  graph(cs, g, o) {
    /* a read that answered nothing is a read that failed, never an empty graph (R18) */
    if (!g || !Array.isArray(g.nodes)) return `<p class="cs-state" data-state="failed" role="alert">${cs.w("state.failed", { reason: cs.w("shell.noanswer") })}</p>`;
    const W = 860, H = 660, CX = 430, CY = 322, R1 = 160, R2 = 300;
    const names = (o && o.names) || {};
    const nodes = Array.isArray(g.nodes) ? g.nodes : [];
    const steps = Array.isArray(g.steps) ? g.steps : [];
    const centre = g.centre;
    const stops = (Array.isArray(g.stopped) ? g.stopped : []).concat((Array.isArray(g.at_depth) ? g.at_depth : []).map((n) => ({ node: n, why: "ring" })));
    const limit = new Set(stops.map((s) => s.node));
    const hidden = (st) => st.class === "declared" || st.class === "hunch" || st.label === "declared, not evidenced" || st.label === "hunch";
    const classOf = (st) => (hidden(st) ? "lead" : (o && o.groupOf && o.groupOf(st.kind)) || "ment");
    const adj = (id) => steps.filter((s) => s.from === id || s.to === id).map((s) => (s.from === id ? s.to : s.from));
    const ring1 = nodes.filter((n) => n.ring === 1).map((n) => n.id);
    const pos = {}; pos[centre] = [CX, CY];
    ring1.forEach((id, i) => { const t = -Math.PI / 2 + i * 2 * Math.PI / Math.max(1, ring1.length); pos[id] = [CX + R1 * Math.cos(t) * 1.5, CY + R1 * Math.sin(t) * 0.9]; });
    ring1.forEach((p, i) => {
      const t = -Math.PI / 2 + i * 2 * Math.PI / Math.max(1, ring1.length);
      const kids = adj(p).filter((x) => x !== centre && !ring1.includes(x) && !pos[x] && nodes.some((n) => n.id === x));
      kids.forEach((id, j) => { const a = t + (j - (kids.length - 1) / 2) * 0.55; pos[id] = [CX + R2 * Math.cos(a) * 1.25, CY + R2 * Math.sin(a) * 0.93]; });
    });
    nodes.forEach((n, i) => { if (!pos[n.id]) pos[n.id] = [60 + (i % 10) * 80, H - 30]; });
    const thingOf = (id) => {
      if (/^(INFO|INF)-/.test(id)) return "doc";
      if (/^MNY-/.test(id)) return "pay";
      if (!/^ENT-/.test(id)) return null;
      const ps = steps.filter((s) => (o && o.groupOf && o.groupOf(s.kind)) === "pos");
      if (ps.some((s) => s.to === id)) return "org";
      if (ps.some((s) => s.from === id)) return "person";
      return null;
    };
    const label = (id) => names[id] || id;
    const shape = (t, r) => (t === "person" ? `<circle r="${r}"/>` : t === "doc" ? `<path d="M${-r} ${-r * 0.85} h${r * 1.45} l${r * 0.55} ${r * 0.55} v${r * 1.15} h${-2 * r} z"/>`
      : t === "pay" ? `<path d="M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 z"/>` : `<rect x="${-r}" y="${-r * 0.78}" width="${2 * r}" height="${1.56 * r}" rx="3"/>`);
    const pairCount = {}, pairSeen = {};
    const drawn = steps.filter((s) => pos[s.from] && pos[s.to]);
    drawn.forEach((s) => { const k = [s.from, s.to].sort().join("|"); pairCount[k] = (pairCount[k] || 0) + 1; });
    const ringOf = (id) => (id === centre ? 0 : ring1.includes(id) ? 1 : 2);
    const edgeSvg = drawn.map((s) => {
      const [ax, ay] = pos[s.from], [bx, by] = pos[s.to];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      const k = [s.from, s.to].sort().join("|"); const idx = pairSeen[k] = (pairSeen[k] || 0) + 1;
      const off = (idx - 1 - (pairCount[k] - 1) / 2) * 26; const side = off === 0 ? (ny < 0 ? 1 : -1) : Math.sign(off);
      const ra = (s.from === centre ? 30 : 22) + 3, rb = (s.to === centre ? 30 : 22) + 3;
      const x1 = ax + ux * ra + nx * off, y1 = ay + uy * ra + ny * off, x2 = bx - ux * rb + nx * off, y2 = by - uy * rb + ny * off;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const f = ringOf(s.from) < ringOf(s.to) ? (uy < -0.6 ? 0.5 : 0.66) : ringOf(s.from) > ringOf(s.to) ? (uy > 0.6 ? 0.5 : 0.34) : 0.5;
      const px = x1 + (x2 - x1) * f, py = y1 + (y2 - y1) * f, ldy = ny * side * 14, ldx = nx * side * 14;
      const vert = Math.abs(nx) > 0.6, anchor = vert ? (ldx > 0 ? "start" : "end") : "middle";
      const lx = px + ldx * (vert ? 1.15 : 1), ly = py + (vert ? 4 : ldy + (ldy > 0 ? 7 : 0));
      const line = `x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"`;
      const c = classOf(s);
      const letter = s.grade && /^[A-D]$/.test(s.grade.assertion || "") ? s.grade.assertion : "";
      const tip = `<b>${cs.w("connection.kind." + c + ".name")}</b>: ${cs.esc(s.word || s.kind)}${letter ? " · " + cs.esc(letter) : ""}`;
      return `<g class="edge" tabindex="0" data-tip="${cs.esc(tip)}"><line class="hit" ${line}/><line class="e e-${c}" ${line}/>${c === "money" ? `<line class="e e-money-in" ${line}/>` : ""}`
        + `<text class="w${c === "lead" ? " lead" : ""}" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}">${cs.esc(s.word || s.kind)}${c === "same" ? " =" : ""}</text>`
        + (letter ? `<g class="gchip${c === "same" ? " subject" : ""}" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><rect x="-9" y="-8" width="18" height="16" rx="2"/><text text-anchor="middle" y="4">${cs.esc(letter)}</text></g>` : "") + "</g>";
    }).join("");
    const nodeSvg = nodes.map((n) => {
      const [x, y] = pos[n.id]; const c = n.id === centre, r = c ? 30 : 22, t = thingOf(n.id), lim = limit.has(n.id) && !c;
      const nm = label(n.id); const short = nm.length > 26 ? nm.slice(0, 25) + "…" : nm;
      return `<g class="node${c ? " center" : ""}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-node="${cs.esc(n.id)}">${shape(t, r)}${lim ? `<circle class="lim" r="${r + 7}"/>` : ""}`
        + `<text class="n" y="${r + 16}" text-anchor="middle">${cs.esc(short)}</text>${lim ? `<text class="lim" y="${r + 30}" text-anchor="middle">${cs.w("connection.graph.limit")}</text>` : ""}</g>`;
    }).join("");
    /* the same things as a list: references, the controls, the limits and each step's citation */
    const press = (id) => (o && o.act ? cs.act(o.act, { label: "connection.graph.click", data: { node: id } })
      : `<a class="cs-btn" data-tone="quiet" data-nav href="/app/explore/${encodeURIComponent(id)}">${cs.w("connection.graph.click")}</a>`);
    const list = nodes.map((n) => {
      const t = thingOf(n.id);
      return cs.row("", `<b>${cs.ref(/^ENT-/.test(n.id) ? "person" : /^(INFO|INF)-/.test(n.id) ? "document" : "record", n.id, label(n.id), [])}</b>${t ? ` <span class="mk-small">${cs.w("connection.thing." + t)}</span>` : ""}`
        + (limit.has(n.id) && n.id !== centre ? ` <span class="mk-small" data-limit="${cs.esc(n.id)}"><b>${cs.w("connection.graph.limit")}</b> · ${cs.w("connection.graph.limit.means")}</span>` : ""),
        n.id === centre ? `<span class="mk-small">${cs.w("connection.graph.centre.means")}</span>` : press(n.id));
    }).join("");
    const stepList = drawn.map((s) => {
      const c = classOf(s);
      const ev = (Array.isArray(s.evidence) ? s.evidence : []).map((e) => (e.capture_sha ? cs.ref("capture", e.capture_sha, cs.w(o.words.cited), []) : e.source ? cs.esc(String(e.source)) : "")).filter(Boolean).join(" ");
      const letter = s.grade && /^[A-D]$/.test(s.grade.assertion || "") ? cs.grade("connection", s.grade.assertion) : "";
      return cs.row(letter, `<b>${cs.esc(label(s.from))}</b> → <i>${cs.esc(s.word || s.kind)}</i> → <b>${cs.esc(label(s.to))}</b>`
        + (c === "lead" ? ` <b>${cs.w(s.label === "hunch" || s.class === "hunch" ? o.words.hunch : o.words.declared)}</b>` : ""),
        (ev ? ev : c === "lead" ? "" : cs.mark("gap", "undetermined", { reason: cs.w(o.words.nosource) })));
    }).join("");
    const trail = (o && Array.isArray(o.trail) ? o.trail : [centre]);
    const trailHtml = `<div class="mk-trail"><span class="k" data-tip="${cs.esc(cs.w("connection.graph.trail.means"))}">${cs.w("connection.graph.trail.label")}</span>`
      + trail.map((id, i) => (i === trail.length - 1 ? `<b class="mk-trailbtn now">${cs.esc(label(id))}</b>` : (o && o.act ? cs.act(o.act, { label: "connection.graph.trail.label", data: { node: id } }) : ""))).join("") + "</div>";
    const legendKinds = ["pos", "part", "money", "ment", "same", "lead"];
    const legend = `<div class="mk-glegend">${legendKinds.map((k) => `<span class="li" data-tip="${cs.esc(cs.w("connection.kind." + k + ".means"))}"><svg viewBox="0 0 36 12" aria-hidden="true"><line class="e e-${k}" x1="1" y1="6" x2="35" y2="6"/>${k === "money" ? '<line class="e e-money-in" x1="1" y1="6" x2="35" y2="6"/>' : ""}</svg>${cs.w("connection.kind." + k + ".name")}</span>`).join("")}`
      + `<span class="li" data-tip="${cs.esc(cs.w("connection.graph.grade.means"))}">${cs.w("connection.graph.legend.grade")}</span></div>`;
    return `<div class="mk-graph" data-centre="${cs.esc(centre)}">${trailHtml}<div class="gwrap"><svg class="g" viewBox="0 0 ${W} ${H}" role="group" aria-label="${cs.esc(label(centre))}">${edgeSvg}${nodeSvg}</svg></div>${legend}`
      + (stops.length ? `<p class="mk-small">${cs.w("connection.graph.limit.means")}</p>` : "") + cs.sheet(list) + (stepList ? cs.sheet(stepList) : "") + "</div>";
  },
  /** R24: the group a connection kind belongs to (`pos`, `part`, `money`, `ment`, `same`), from the vocabulary `affordances` answers. */
  groupMap(v) {
    const ck = v && v.vocabularies && v.vocabularies.connection_kinds;
    const m = {};
    if (ck && Array.isArray(ck.values)) for (const k of ck.values) m[k] = (ck.words && ck.words[k] && ck.words[k].group) || (ck.groups && ck.groups[k]) || null;
    return m;
  },

  /** R23: the options of a choice among record data, from a read the screen made (`view.data[name]`): the rows `pick(v)`
   *  lists, each `{value, text}` by `map(row)`; none while the read has not answered (the choice is then empty). */
  options(view, name, pick, map) {
    const d = view.data && view.data[name];
    const rows = d && d.state === "ok" && d.value ? pick(d.value) : [];
    return (Array.isArray(rows) ? rows : []).map(map).filter((o) => o && o.value);
  },
});
