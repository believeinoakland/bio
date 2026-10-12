/* The `held` screen (Add › Held captures; R4; DEC-97). Self-contained functions over the kit `cs` (interface-shell
 * R21 (1)). */

/* R4: one read, `heldcaptures` (capture R77): each row's title, project, age, source, batch eligibility (R78) and the
 * questions it was captured for; an archive's row with its held files beside it. */
function heldReads() {
  return { held: { op: "heldcaptures", query: { limit: 200 }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length } };
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
      + (Array.isArray(r.files) ? r.files : []).map((f) => `<li>${cs.ref("open-file", f.sha256, cs.esc(f.name || f.document), [])}`
        + (f.grade ? ` ${cs.grade("capture", f.grade)}` : "")
        + (f.eligible === false ? ` ${cs.mark("gap", "refused")}` : "") + "</li>").join("") + "</ul>"
      + (r.files_truncated ? `<span class="meta">${cs.w("screen.held.archivemore", { shown: (r.files || []).length, total: r.files_total })}</span>` : "");
  };
  const list = cs.state(view.data.held, (v) => cs.rows({
    cols: ["screen.held.col"],
    items: v.held,
    key: (r) => r.bundle_id,
    pick: true,
    cells: (r) => [`${cs.ref("document", r.bundle_id, cs.esc(r.title || cs.w("screen.held.untitled")), [])}`
      + `<span class="meta">${age(r.age_days)} · ${r.project ? cs.w("screen.held.project", { project: r.project }) : cs.w("screen.held.noproject")}`
      + (r.source && r.source.address ? ` · ${cs.w("screen.held.from", { address: r.source.address })}` : "") + "</span>"
      + eligibility(r) + asked(r) + files(r)],
  }) + (v.truncated ? `<p class="mk-small">${cs.w("screen.held.more", { count: v.held.length })}</p>` : "")
    + `<div class="cs-hold mk-hold" data-hold="picked"><span class="acts">${cs.act("heldsetaside")}${cs.act("release", { tone: "primary" })}</span></div>`,
  { empty: "screen.held.empty" });
  const aside = Array.isArray(U.setAside) && U.setAside.length
    ? cs.sec("screen.held.setaside", said("screen.held.setasidecount", { count: U.setAside.length })
      + (Array.isArray(U.waiting) ? U.waiting : []).map((q) => said("screen.held.waiting", { asker: q.asker || "", title: q.title || "" })).join("")
      + `<div class="mk-acts">${cs.act("heldrestore")}</div>`) : "";
  return `<div class="mk-h"><h1 class="t-title">${cs.w("screen.held.heading")}</h1><p class="mk-sub">${cs.w("screen.held.sub")}</p></div>`
    + `<div class="mk-acts">${cs.act("heldcaptures")}</div>`
    + list
    + (U.released ? said("screen.held.released", { count: U.released }) : "")
    + (U.restored ? said("screen.held.restored", { count: U.restored }) : "")
    + aside;
}

/* R4: "Vouch for them" (`release`, ratification R20–R26) over the picked rows: an enumerated selection of them
 * (`op=select`, retrieval R18; K2996), then the release over its handle, with the acknowledgment and mitigation the
 * signed act's dialog asks, each checked as R20 bounds it before anything is sent. */
async function sendRelease(view, el, cs, extra) {
  const ids = (extra && Array.isArray(extra.picked) ? extra.picked : []).filter((x) => typeof x === "string" && x);
  const f = (extra && extra.fields) || {};
  const ack = String(f.acknowledgment || "").trim(), mitigation = String(f.mitigation || "").trim();
  if (!ids.length) return { refuse: "screen.held.none" };
  const missing = [!ack && "screen.held.ack", !mitigation && "screen.held.mitigation"].filter(Boolean);
  if (missing.length) return { refuse: "screen.held.vouchmissing", fills: { fields: missing.map((k) => cs.w(k)).join(", ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  for (const [k, v] of [["screen.held.ack", ack], ["screen.held.mitigation", mitigation]])
    if (Array.from(v).length > 500 || /["\\\r\n]/.test(v)) return { refuse: "screen.held.vouchbad", fills: { field: cs.w(k).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  const sel = await cs.call("select", { body: { ids } });
  const s = sel && (sel.result || sel);
  if (!s || s.ok === false || typeof s.handle !== "string") return { refuse: "screen.held.selectfailed" };
  return { body: { handle: s.handle, acknowledgment: ack, mitigation } };
}
function doneRelease(view, answer, cs) {
  cs.set("released", answer && Array.isArray(answer.released) ? answer.released.length : 0);
  cs.set("restored", 0);
}

/* R4: "Set aside with a reason" (`heldsetaside`, capture R79): one reason for every picked row, asked by the shell's
 * reason field (a reasoned act, R11), never with writing help (K1841). The rows set aside leave the list, so this view
 * keeps them with "Restore" (K2996 Q6). */
function sendSetAside(view, el, cs, extra) {
  const ids = (extra && Array.isArray(extra.picked) ? extra.picked : []).filter((x) => typeof x === "string" && x);
  if (!ids.length) return { refuse: "screen.held.none" };
  cs.set("pendingAside", ids);
  return { body: { ids } };
}
function doneSetAside(view, answer, cs) {
  const a = answer || {};
  const waiting = [];
  for (const d of (Array.isArray(a.documents) ? a.documents : [])) for (const q of (d && Array.isArray(d.waiting) ? d.waiting : [])) waiting.push(q);
  cs.set("setAside", Array.isArray(a.ids) ? a.ids : (view.ui && view.ui.pendingAside) || []);
  cs.set("waiting", waiting);
  cs.set("released", 0);
  cs.set("restored", 0);
}

/* R4: "Restore" (`heldrestore`, capture R81) for the rows this view set aside, with one reason (the shell's field). */
function sendRestore(view) {
  const ids = view.ui && Array.isArray(view.ui.setAside) ? view.ui.setAside : [];
  if (!ids.length) return { refuse: "screen.held.none" };
  return { body: { ids } };
}
function doneRestore(view, answer, cs) {
  const n = view.ui && Array.isArray(view.ui.setAside) ? view.ui.setAside.length : 0;
  cs.set("setAside", []);
  cs.set("waiting", []);
  cs.set("restored", n);
}

/* R4: "See held captures": the list asked again (a read, so nothing changes), then drawn by the reads made again. */
function sendRefresh(view, el, cs) {
  cs.set("released", 0);
  return { query: { limit: 200 } };
}

export const HELD_SCREEN = Object.freeze({
  id: "held",
  reads: heldReads,
  render: renderHeld,
  acts: Object.freeze([
    Object.freeze({ op: "heldcaptures", label: "act.heldcaptures.label.held", send: sendRefresh }),
    Object.freeze({ op: "release", label: "act.release.label.held", send: sendRelease, done: doneRelease,
                    dialog: Object.freeze([Object.freeze({ name: "acknowledgment", label: "screen.held.ack" }),
                                           Object.freeze({ name: "mitigation", label: "screen.held.mitigation" })]) }),
    Object.freeze({ op: "heldsetaside", label: "act.heldsetaside.label.held", send: sendSetAside, done: doneSetAside }),
    Object.freeze({ op: "heldrestore", label: "act.heldrestore.label.held", send: sendRestore, done: doneRestore }),
  ]),
});
