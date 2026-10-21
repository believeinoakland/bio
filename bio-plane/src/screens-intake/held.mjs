/* The `held` screen (Add › Held captures; R4; DEC-97). Self-contained functions over the kit `cs` (interface-shell
 * R21 (1)). */

/* R4: one read, `heldcaptures` (capture R77): each row's title, project, age, source, batch eligibility (R78) and the
 * questions it was captured for; an archive's row with its held files beside it. */
function heldReads(view) {
  /* R4 (C23): opened for a project (`/app/held/<PROJ-…>`), both lists read that project's captures; opened bare, every project's */
  const s = String((view && view.subject) || "");
  const filter = /^PROJ-[A-Za-z0-9-]+$/.test(s) ? { project: s } : {};
  return { held: { op: "heldcaptures", query: { limit: 50, ...filter }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length },
           /* R13 (capture R88): the documents set aside, in an earlier visit or this one */
           aside: { op: "heldcaptures", query: { limit: 50, state: "set_aside", ...filter }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length },
           /* R40 (membership R17, R147): the handles an upload's uploader is named by; the stamp names a member by id */
           members: { op: "memberlist" },
           /* B6: a row names its project by the project's name, never by its record id */
           projects: { op: "projectlist" } };
}

function renderHeld(cs, view) {
  const U = view.ui || {};
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const age = (d) => d === 0 ? cs.w("screen.held.age.today") : d === 1 ? cs.w("screen.held.age.one")
    : Number.isFinite(d) ? cs.w("screen.held.age", { days: d }) : "";
  /* R23: a row's refusal is drawn by its words: the class `ratification` names (`CRUCIAL_IN_BATCH`, `CONTESTED_IN_BATCH`, in
     the case it gives them), never the catalogue's sentence for it, which is not the member's */
  const eligibility = (r) => {
    if (r.whole === false) return `${cs.mark("gap", "refused")}`;
    if (r.eligible === true) return "";
    if (r.eligible !== false) return `${cs.mark("gap", "undetermined")} ${cs.w("screen.held.eligibility.undetermined")}`;
    const why = String(r.class || "").toUpperCase();
    const reason = why.startsWith("CRUCIAL") ? "screen.held.ineligible.crucial" : why.startsWith("CONTESTED") ? "screen.held.ineligible.contested" : null;
    /* R51 (DEC-384): the sentence is not left without a door: "Open it" is a reference to the row's document */
    const door = cs.ref("document", r.bundle_id, cs.w("screen.capture.openit").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), [cs.w("screen.capture.openit.help").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")]);
    return `${cs.mark("gap", "refused")} ${reason ? cs.w("screen.held.ineligible", { reason: { html: cs.w(reason) } }) + " " : ""}${cs.w("screen.held.ineligible.alone")} ${door}`;
  };
  const asked = (r) => {
    const f = r.captured_for;
    if (!f) return r.captured_for_basis ? `${cs.mark("gap", "undetermined")} ${cs.w("screen.held.forundetermined", { reason: r.captured_for_basis })}` : "";
    return (Array.isArray(f.questions) ? f.questions : [])
      .map((q) => `<span class="meta">${cs.w("screen.held.for", { asker: q.asker || "", title: q.title || "" })}</span>`).join("")
      + (f.withheld ? `${cs.mark("gap", "withheld")} ${cs.w("screen.held.withheld")}` : "");
  };
  /* R37 (DEC-310 (5); capture R77): a row whose answer carries `archive` draws its summary (each part only above zero) and one
     door, "Open its files", a reference of kind `archive` opening `archive` for the archive's own digest; the files the row
     lists are drawn under it. A row whose `files` is null says nothing of a count it does not hold. */
  const files = (r) => {
    const a = r.archive && typeof r.archive === "object" && r.archive.entries !== undefined ? r.archive : null;
    if (!a) return "";
    const parts = [["filed", a.filed], ["notfiled", a.not_filed]].filter(([, n]) => n > 0).map(([k, n]) => cs.w(`screen.held.archive.${k}`, { count: n })).join(", ");
    const door = typeof a.sha256 === "string" && a.sha256 ? `<span class="meta">${cs.ref("archive", a.sha256, cs.w("screen.held.archivefiles").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), [r.title || ""])}</span>` : "";
    return (parts ? `<span class="meta">${cs.w("screen.held.archive", { parts: { html: parts } })}</span>` : "")
      + door
      + (Array.isArray(r.files) && r.files.length ? `<ul class="mk-list">`
      + r.files.map((f) => `<li>${cs.ref("capture", f.sha256, f.name || cs.w("screen.held.untitled").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), [])}`
        + (f.grade ? ` ${cs.grade("capture", f.grade)}` : "")
        + (f.eligible === false ? ` ${cs.mark("gap", "refused")}` : "") + "</li>").join("") + "</ul>" : "")
      + (r.files_truncated ? `<span class="meta">${cs.w("screen.held.archivemore", { shown: (r.files || []).length, total: r.files_total })}</span>` : "");
  };
  /* R35, R40 (N1185, N1235; DEC-299 (8); DEC-323): an upload's row names who uploaded it and when, never `upload:<hex>`, and its size
     by `size.kb` / `size.mb` / `size.small`, after the uploader in the same row. The uploader, the day and the size are the row's
     own `actor`, `retrieved` and `bytes` (`capture` R77); the uploader is named by the handle `memberlist` gives for the stamp's
     member (its `member:` prefix removed), never by the id; a row answering none of them draws none. */
  const projectRows = view.data.projects && view.data.projects.state === "ok" && view.data.projects.value && Array.isArray(view.data.projects.value.projects)
    ? view.data.projects.value.projects : [];
  /* B6: the project's name; a project the viewer's list does not name is not named at all (no slug, no id) */
  /* C23: a project's name opens the list for that project (a link to `/app/held/<id>`); inside the filter it is not a door to itself */
  const filtered = /^PROJ-[A-Za-z0-9-]+$/.test(String(view.subject || "")) ? String(view.subject) : "";
  const projectOf = (r) => {
    const p = r.project ? projectRows.find((x) => x && x.id === r.project) : null;
    if (!p || !p.name) return r.project ? "" : cs.w("screen.held.noproject");
    return cs.w("screen.held.project", { project: filtered ? p.name : { html: `<a href="/app/held/${encodeURIComponent(r.project)}" data-nav>${cs.esc(p.name)}</a>` } });
  };
  const roster = view.data.members && view.data.members.state === "ok" && view.data.members.value && Array.isArray(view.data.members.value.members)
    ? view.data.members.value.members : [];
  const source = (r) => {
    const s = r.source;
    if (!s || !s.address) return "";
    if (!(s.via === "upload" || /^upload:/.test(String(s.address)))) return ` · ${cs.w("screen.held.from", { address: s.address })}`;
    const id = typeof r.actor === "string" ? r.actor.replace(/^member:/, "") : "";
    const handle = id ? ((roster.find((m) => m && m.member_id === id) || {}).handle || "") : "";
    const n = Number.isFinite(r.bytes) ? r.bytes : null;
    const size = n === null ? "" : n < 1024 ? cs.w("size.small") : n >= 1048576 ? cs.w("size.mb", { n: (n / 1048576).toFixed(1) }) : cs.w("size.kb", { n: String(Math.round(n / 1024)) });
    const by = handle && r.retrieved ? cs.w("document.uploaded.by", { member: handle, date: { html: cs.date(r.retrieved) } }) : "";
    return by || size ? ` · ${[by, size].filter(Boolean).join(" · ")}` : "";
  };
  /* R11 (capture R77's `capture`): the row's grade as one mark, as provenance states it (a received or authored capture
     never drawn as measured); its thumbnail opens `open-file` for the capture. No capture: undetermined, no thumbnail. */
  const grade = (r) => {
    const c = r.capture, g = c && c.grade;
    if (!c || !g || typeof g !== "object") return `<span class="meta">${cs.w("state.undetermined", { reason: cs.w(c ? "screen.held.grade.unread" : "screen.held.grade.nocapture") })}</span>`;
    if (g.grade && g.determined === true) return cs.grade("capture", g.grade);
    if (g.grade) return `${cs.grade("capture", g.grade)} <span class="meta">${cs.w("screen.held.grade.stated")}</span>`;
    const basis = { CAPTURE_RECEIVED_NOT_FETCHED: "screen.held.grade.received", CAPTURE_AXIS_AUTHORED: "screen.held.grade.testimony" }[g.basis];
    return `<span class="meta">${basis ? cs.w(basis) : cs.w("state.undetermined", { reason: cs.w("screen.held.grade.ungraded") })}</span>`;
  };
  /* R4 (C23; capture R77, R100): a document filed in the project from another project (`also_here`) is marked, and said to be held under its
     home (`screen.capture.address.filedhere`, a stand-in key until the design writes the row; before it the row's project, which is the home) */
  const alsoHere = (r) => {
    if (!r.also_here || typeof r.also_here !== "object") return "";
    const id = typeof r.also_here.home === "string" ? r.also_here.home : "";
    const home = id ? (projectRows.find((x) => x && x.id === id) || {}).name || "" : "";
    return `<span class="meta" data-also-here="1">${home && cs.w("screen.capture.address.filedhere") !== "screen.capture.address.filedhere" ? cs.w("screen.capture.address.filedhere", { project: home }) : ""}</span>`;
  };
  const thumb = (r) => r.capture && typeof r.capture.sha256 === "string" && r.capture.sha256
    ? `<span class="mk-thumb">${cs.ref("capture", r.capture.sha256, cs.w("screen.held.thumb").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), [r.title || ""])}</span>` : "";
  const list = cs.state(view.data.held, (v) => cs.rows({
    id: "held",
    cols: ["screen.held.col"],
    name: (r) => r.title || cs.w("screen.held.untitled"),
    /* R4: the hold strip (shell R19): one reason to set the picked aside; or vouching, in the member's own words */
    hold: () => `${cs.act("heldsetaside")}`
      + cs.field("ch-ack", "screen.held.ack", { help: "screen.held.ackhelp", max: 500 })
      + cs.field("ch-mitigation", "screen.held.mitigation", { help: "screen.held.mitigationhelp", max: 500 })
      + cs.act("release", { tone: "primary" }),
    items: v.held,
    key: (r) => r.bundle_id,
    pick: true,
    cells: (r) => [`${thumb(r)}${cs.ref("document", r.bundle_id, r.title || cs.w("screen.held.untitled"), [])}`
      /* C23: the one word for the state a held capture is in, the Find chip's (`state.item.review.name`) */
      + `<span class="meta">${cs.w("state.item.review.name")} · ${grade(r)} ${[age(r.age_days), projectOf(r)].filter(Boolean).join(" · ")}`
      + source(r) + "</span>"
      + alsoHere(r) + eligibility(r) + asked(r) + files(r)],
  }) + (v.truncated ? `<p class="mk-small">${cs.w("screen.held.more", { count: v.held.length })}</p>` : "")
    ,
  { empty: "screen.held.empty" });
  /* R13: the "Set aside" list: who set each aside, when, and why, as `set_aside` answers it; `heldrestore` with a reason in
     its row's panel, and in the hold strip for picked rows */
  const asideSec = cs.sec("screen.held.setaside", (Array.isArray(U.waiting) && U.waiting.length
      ? U.waiting.map((q) => said("screen.held.waiting", { asker: q.asker || "", capture: q.capture || "" })).join("") : "")
    + cs.state(view.data.aside, (v) => cs.rows({
      id: "aside",
      cols: ["screen.held.col"],
      name: (r) => r.title || cs.w("screen.held.untitled"),
      hold: () => cs.act("heldrestore"),
      items: v.held,
      key: (r) => r.bundle_id,
      pick: true,
      cells: (r) => {
        const a = r.set_aside || {};
        return [`${thumb(r)}${cs.ref("document", r.bundle_id, r.title || cs.w("screen.held.untitled"), [])}`
          + `<span class="meta">${grade(r)} ${projectOf(r)}</span>`
          + `<span>${cs.w("screen.held.asideby", { author: a.author || "", reason: a.reason || "" })}${a.at ? ` ${cs.date(a.at)}` : ""}</span>`];
      },
      acts: (r) => cs.act("heldrestore", { data: { id: r.bundle_id } }),
    }) + (v.truncated ? `<p class="mk-small">${cs.w("screen.held.more", { count: v.held.length })}</p>` : ""),
    { empty: "screen.held.asideempty" }));
  /* R19: "Set aside" is drawn only when it holds something (or a set-aside just made left a waiting question, or its read
     failed, still drawn as failed); nothing is drawn for it while it loads or when it is empty */
  const A = view.data.aside, W = Array.isArray(U.waiting) && U.waiting.length;
  const aside = W || (A && (A.state === "failed" || (A.state === "ok" && Array.isArray(A.value.held) && A.value.held.length))) ? asideSec : "";
  return `<div class="mk-h">${cs.title()}<p class="mk-sub">${cs.w("screen.held.sub")}</p></div>`
    + (filtered ? `<p class="mk-small"><a href="/app/held" data-nav>${cs.w("screen.held.name")}</a></p>` : "")
    + `<div class="mk-acts">${cs.act("heldcaptures")}</div>`
    + list
    + (U.released ? said("screen.held.released", { count: U.released }) : "")
    + (U.setAside ? said("screen.held.setasidecount", { count: U.setAside }) : "")
    + (U.restored ? said("screen.held.restored", { count: U.restored }) : "")
    + aside;
}

/* R4: "Vouch for them" (`release`, ratification R20–R26) over the picked rows: an enumerated selection of them
 * (`op=select`, retrieval R18; K2996), then the release over its handle, with the acknowledgment and mitigation the
 * signed act's dialog asks, each checked as R20 bounds it before anything is sent. */
async function sendRelease(view, el, cs, extra) {
  /* capture R77 `whole` (CAPTURE #41): a document with no object under its fingerprint (`whole: false`) is not vouched for */
  const rows = view.data && view.data.held && view.data.held.state === "ok" && Array.isArray(view.data.held.value.held) ? view.data.held.value.held : [];
  const partial = new Set(rows.filter((r) => r && r.whole === false).map((r) => r.bundle_id));
  const ids = (extra && Array.isArray(extra.picked) ? extra.picked : []).filter((x) => typeof x === "string" && x && !partial.has(x));
  const ack = String(cs.value("ch-ack") || "").trim(), mitigation = String(cs.value("ch-mitigation") || "").trim();
  if (!ids.length) return { refuse: "screen.held.none" };
  const missing = [!ack && "screen.held.ack", !mitigation && "screen.held.mitigation"].filter(Boolean);
  if (missing.length) return { refuse: "screen.held.vouchmissing", fills: { fields: missing.map((k) => cs.w(k)).join(", ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  for (const [k, v] of [["screen.held.ack", ack], ["screen.held.mitigation", mitigation]])
    if (Array.from(v).length > 500 || /["\\\r\n]/.test(v)) return { refuse: "screen.held.vouchbad", fills: { field: cs.w(k).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  const sel = await cs.call("select", { body: { ids } });
  const s = sel && (sel.result || sel);
  if (!s || s.ok === false || typeof s.handle !== "string") return { refuse: "screen.held.selectfailed" };
  /* ratification reads the three from the body, else the query (its R51; K3114): both carry them, the body also for the
     shell's own-words check of `reasonField` (interface-shell R11) */
  return { query: { handle: s.handle, acknowledgment: ack, mitigation }, body: { handle: s.handle, acknowledgment: ack, mitigation } };
}
function doneRelease(view, answer, cs) {
  cs.set("released", answer && Array.isArray(answer.released) ? answer.released.length : 0);
  cs.set("restored", 0);
  cs.set("setAside", 0);
}

/* R4: "Set aside with a reason" (`heldsetaside`, capture R79): one reason for every picked row, asked by the shell's
 * reason field (a reasoned act, R11), never with writing help (K1841). The rows set aside move to the "Set aside" list
 * (R13), read again after the act. */
function sendSetAside(view, el, cs, extra) {
  const ids = (extra && Array.isArray(extra.picked) ? extra.picked : []).filter((x) => typeof x === "string" && x);
  if (!ids.length) return { refuse: "screen.held.none" };
  return { body: { ids } };
}
function doneSetAside(view, answer, cs) {
  const a = answer || {};
  const waiting = [];
  /* the question waits for the capture set aside: its title, as the Held list drew it, else its id */
  const rows = view.data && view.data.held && view.data.held.state === "ok" && Array.isArray(view.data.held.value.held) ? view.data.held.value.held : [];
  for (const d of (Array.isArray(a.documents) ? a.documents : [])) {
    const row = rows.find((x) => x && x.bundle_id === (d && d.id));
    for (const q of (d && Array.isArray(d.waiting) ? d.waiting : [])) waiting.push({ asker: q.asker || "", capture: (row && row.title) || (d && d.id) || "" });
  }
  cs.set("setAside", Array.isArray(a.ids) ? a.ids.length : 0);
  cs.set("waiting", waiting);
  cs.set("released", 0);
  cs.set("restored", 0);
}

/* R13 (capture R81): "Restore" with one reason (the shell's field): the row its panel opened from, or the picked rows of
 * the "Set aside" list, whenever they were set aside. */
function sendRestore(view, el, cs, extra) {
  const one = el && el.dataset && el.dataset.id;
  const ids = one ? [one] : (extra && Array.isArray(extra.picked) ? extra.picked : []).filter((x) => typeof x === "string" && x);
  if (!ids.length) return { refuse: "screen.held.none" };
  return { body: { ids } };
}
function doneRestore(view, answer, cs) {
  cs.set("restored", answer && Array.isArray(answer.ids) ? answer.ids.length : 0);
  cs.set("setAside", 0);
  cs.set("waiting", []);
  cs.set("released", 0);
}

/* R4: "See held captures": the list asked again (a read, so nothing changes), then drawn by the reads made again. */
function sendRefresh(view, el, cs) {
  cs.set("released", 0);
  const s = String((view && view.subject) || "");
  return { query: { limit: 50, ...(/^PROJ-[A-Za-z0-9-]+$/.test(s) ? { project: s } : {}) } };
}

/* R23: `release`'s refusals in words. `refusal.CRUCIAL_IN_BATCH` counts the crucial documents and `refusal.ENTRY_REQUIREMENTS`
 * names each document with what it lacks, from the answer's `offenders`; any other code is the shell's (R13). */
const RELEASE_REFUSALS = Object.freeze({
  CRUCIAL_IN_BATCH: function (refusal, cs) {
    return cs.w("refusal.CRUCIAL_IN_BATCH", { count: Array.isArray(refusal.offenders) ? refusal.offenders.length : 0 });
  },
  ENTRY_REQUIREMENTS: function (refusal, cs) {
    const named = (Array.isArray(refusal.offenders) ? refusal.offenders : []).map(function (o) {
      return o && typeof o === "object" ? String(o.id || "") + (Array.isArray(o.missing) && o.missing.length ? " (" + o.missing.join(", ") + ")" : "") : String(o);
    }).filter(Boolean);
    return cs.w("refusal.ENTRY_REQUIREMENTS", { offenders: named.join("; ") });
  },
});

export { sendRelease, RELEASE_REFUSALS };

export const HELD_SCREEN = Object.freeze({
  id: "held",
  reads: heldReads,
  render: renderHeld,
  acts: Object.freeze([
    Object.freeze({ op: "heldcaptures", label: "act.heldcaptures.label.held", send: sendRefresh, rereads: Object.freeze(["held"]) }),
    Object.freeze({ op: "release", label: "act.release.label.held", send: sendRelease, done: doneRelease, rereads: Object.freeze(["held"]), reasonField: "acknowledgment", refusals: RELEASE_REFUSALS }),
    Object.freeze({ op: "heldsetaside", label: "act.heldsetaside.label.held", send: sendSetAside, done: doneSetAside }),
    Object.freeze({ op: "heldrestore", label: "act.heldrestore.label.held", send: sendRestore, done: doneRestore }),
  ]),
});
