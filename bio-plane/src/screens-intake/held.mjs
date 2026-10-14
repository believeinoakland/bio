/* The `held` screen (Add › Held captures; R4; DEC-97). Self-contained functions over the kit `cs` (interface-shell
 * R21 (1)). */

/* R4: one read, `heldcaptures` (capture R77): each row's title, project, age, source, batch eligibility (R78) and the
 * questions it was captured for; an archive's row with its held files beside it. */
function heldReads() {
  return { held: { op: "heldcaptures", query: { limit: 200 }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length },
           /* R13 (capture R88): the documents set aside, in an earlier visit or this one */
           aside: { op: "heldcaptures", query: { limit: 200, state: "set_aside" }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length } };
}

function renderHeld(cs, view) {
  const U = view.ui || {};
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const age = (d) => d === 0 ? cs.w("screen.held.age.today") : d === 1 ? cs.w("screen.held.age.one")
    : Number.isFinite(d) ? cs.w("screen.held.age", { days: d }) : "";
  const eligibility = (r) => r.eligible === false
    ? `${cs.mark("gap", "refused")} ${cs.w("screen.held.ineligible")} ${r.class === "crucial" ? cs.w("screen.held.ineligible.crucial")
        : r.class === "contested" ? cs.w("screen.held.ineligible.contested") : cs.esc(r.reason || "")} ${cs.w("screen.held.ineligible.alone")}`
    : r.eligible === true ? "" : `${cs.mark("gap", "undetermined")} ${cs.w("screen.held.eligibility.undetermined")}`;
  const asked = (r) => {
    const f = r.captured_for;
    if (!f) return r.captured_for_basis ? `${cs.mark("gap", "undetermined")} ${cs.w("screen.held.forundetermined", { reason: r.captured_for_basis })}` : "";
    return (Array.isArray(f.questions) ? f.questions : [])
      .map((q) => `<span class="meta">${cs.w("screen.held.for", { asker: q.asker || "", title: q.title || "" })}</span>`).join("")
      + (f.withheld ? `${cs.mark("gap", "withheld")} ${cs.w("screen.held.withheld")}` : "");
  };
  const files = (r) => {
    const a = r.archive && r.archive.entries !== undefined ? r.archive : null;
    if (!a) return "";
    return `<span class="meta">${cs.w("screen.held.archive", { filed: a.filed ?? 0, notfiled: a.not_filed ?? 0 })}</span>`
      + `<ul class="mk-list" aria-label="${cs.w("screen.held.archivefiles")}">`
      + (Array.isArray(r.files) ? r.files : []).map((f) => `<li>${cs.ref("capture", f.sha256, f.name || f.document, [])}`
        + (f.grade ? ` ${cs.grade("capture", f.grade)}` : "")
        + (f.eligible === false ? ` ${cs.mark("gap", "refused")}` : "") + "</li>").join("") + "</ul>"
      + (r.files_truncated ? `<span class="meta">${cs.w("screen.held.archivemore", { shown: (r.files || []).length, total: r.files_total })}</span>` : "");
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
      + `<span class="meta">${grade(r)} ${age(r.age_days)} · ${r.project ? cs.w("screen.held.project", { project: r.project }) : cs.w("screen.held.noproject")}`
      + (r.source && r.source.address ? ` · ${cs.w("screen.held.from", { address: r.source.address })}` : "") + "</span>"
      + eligibility(r) + asked(r) + files(r)],
  }) + (v.truncated ? `<p class="mk-small">${cs.w("screen.held.more", { count: v.held.length })}</p>` : "")
    ,
  { empty: "screen.held.empty" });
  /* R13: the "Set aside" list: who set each aside, when, and why, as `set_aside` answers it; `heldrestore` with a reason in
     its row's panel, and in the hold strip for picked rows */
  const aside = cs.sec("screen.held.setaside", (Array.isArray(U.waiting) && U.waiting.length
      ? U.waiting.map((q) => said("screen.held.waiting", { asker: q.asker || "", title: q.title || "" })).join("") : "")
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
          + `<span class="meta">${grade(r)} ${r.project ? cs.w("screen.held.project", { project: r.project }) : cs.w("screen.held.noproject")}</span>`
          + `<span>${cs.w("screen.held.asideby", { author: a.author || "", reason: a.reason || "" })}${a.at ? ` ${cs.date(a.at)}` : ""}</span>`];
      },
      acts: (r) => cs.act("heldrestore", { data: { id: r.bundle_id } }),
    }) + (v.truncated ? `<p class="mk-small">${cs.w("screen.held.more", { count: v.held.length })}</p>` : ""),
    { empty: "screen.held.asideempty" }));
  return `<div class="mk-h">${cs.title()}<p class="mk-sub">${cs.w("screen.held.sub")}</p></div>`
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
  const ids = (extra && Array.isArray(extra.picked) ? extra.picked : []).filter((x) => typeof x === "string" && x);
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
  for (const d of (Array.isArray(a.documents) ? a.documents : [])) for (const q of (d && Array.isArray(d.waiting) ? d.waiting : [])) waiting.push(q);
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
  return { query: { limit: 200 } };
}

export { sendRelease };

export const HELD_SCREEN = Object.freeze({
  id: "held",
  reads: heldReads,
  render: renderHeld,
  acts: Object.freeze([
    Object.freeze({ op: "heldcaptures", label: "act.heldcaptures.label.held", send: sendRefresh }),
    Object.freeze({ op: "release", label: "act.release.label.held", send: sendRelease, done: doneRelease, reasonField: "acknowledgment" }),
    Object.freeze({ op: "heldsetaside", label: "act.heldsetaside.label.held", send: sendSetAside, done: doneSetAside }),
    Object.freeze({ op: "heldrestore", label: "act.heldrestore.label.held", send: sendRestore, done: doneRestore }),
  ]),
});
