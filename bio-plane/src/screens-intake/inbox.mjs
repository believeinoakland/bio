/* The `inbox` screen (Queue › Inbox; R7): the knocks at `/app/inbox`, one knock at `/app/inbox/<knock id>`, whose acts
 * are drawn with it. Self-contained functions over the kit `cs` (see `index.mjs`). */

/* R7: `inbox` (doorbell's list) always; `inboxget` for the knock the address names. */
function inboxReads(view) {
  const id = typeof view.subject === "string" && view.subject ? view.subject : null;
  return { list: { op: "inbox", query: { limit: 200 }, empty: (v) => !v || !Array.isArray(v.inbox) || !v.inbox.length },
           ...(id ? { knock: { op: "inboxget", query: { id } } } : {}) };
}

function renderInbox(cs, view) {
  const L = view.ui || {}, D = view.data || {};
  const id = typeof view.subject === "string" && view.subject ? view.subject : null;
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const size = (n) => !Number.isFinite(n) ? "" : n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`;
  const all = D.list && D.list.state === "ok" && Array.isArray(D.list.value.inbox) ? D.list.value.inbox : [];
  const same = (k) => k.pseudonym ? all.filter((x) => x.knock_id !== k.knock_id && x.pseudonym === k.pseudonym).length : 0;
  /* R12: a read that follows from another's answer (`sourceof` by a pulled knock's capture digest, then `sourcerung`),
     made once per query and kept in page memory, as screens-inquiry's document reads its own (K3002) */
  const later = (key, op, query) => {
    const M = L.later || (L.later = {});
    const q = JSON.stringify(query);
    if (!M[key] || M[key].q !== q) {
      M[key] = { q, state: "loading" };
      const settle = (o) => { M[key] = Object.assign({ q }, o); cs.set("later", M); };
      cs.call(op, { query }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false)) settle({ state: "failed" });
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed" }));
    }
    return M[key];
  };
  const sourceOf = (k) => {
    if (!k || typeof k.capture_sha !== "string" || !k.capture_sha) return null;
    const s = later(`src:${k.capture_sha}`, "sourceof", { capture: k.capture_sha });
    return s.state === "ok" && s.value && typeof s.value.sourceId === "string" ? s.value.sourceId : s.state === "loading" ? undefined : null;
  };
  const rungs = ["unknown", "same", "partly", "group", "public"];
  const NAMED = { unknown: 0, same_knocker: 1, partly_known: 2, known_to_group: 3, publicly_known: 4 };
  /* R12: a pulled knock stands at its source's rung (`sourcerung`); one not yet in the record at "Same knocker" when the
     secret proved it (a pseudonym), else "Unknown" */
  const ladder = (at) => `<div class="cs-ladder" data-ladder="ident" role="list" aria-label="${cs.w("screen.inbox.ladder")}">`
    + rungs.map((r, i) => `<span role="listitem" class="${i <= at ? "on" : ""}"${i === at ? ' aria-current="step"' : ""}>${cs.w(`screen.inbox.ladder.${r}`)}</span>`).join("")
    + `</div><p class="mk-small muted">${cs.w("screen.inbox.ladder.basis")}</p>`;
  const facts = (k) => `<span class="meta">${cs.w("screen.inbox.knock", { size: size(k.bytes) })} ${k.received ? cs.date(k.received) : ""}`
    + ` · ${cs.w(`screen.inbox.status.${["new", "pulled", "discarded"].includes(k.status) ? k.status : "new"}`)}</span>`
    + `<span>${k.note ? cs.w("screen.inbox.note", { note: k.note }) : cs.w("screen.inbox.nonote")}</span>`
    + (same(k) ? `<span class="meta">${cs.w("screen.inbox.same", { count: same(k) })}</span>` : "")
    + (k.status === "discarded" && k.resolve_reason ? `<span class="meta">${cs.w("screen.inbox.resolved", { reason: k.resolve_reason })}</span>` : "");
  /* R10: each knock named is a reference of the kind `knock`, its card what was handed in and when (interface-shell R27) */
  const card = (k) => [size(k.bytes), k.received ? cs.date(k.received) : "", k.note || ""];
  const list = cs.state(D.list, (v) => `<div class="cs-sheet" role="list">${v.inbox.map((k) => `<div class="cs-row" role="listitem"${k.knock_id === id ? ' aria-current="true"' : ""}>`
      + `<span>${cs.ref("knock", k.knock_id, k.knock_id, card(k))}${facts(k)}</span></div>`).join("")}</div>`,
    { empty: "screen.inbox.empty" });
  const one = !id ? "" : cs.state(D.knock, (v) => {
    const k = v.item || {};
    const src = sourceOf(k);
    let at = k.pseudonym || k.knocker_digest ? 1 : 0;
    if (src) {
      const r = later(`rung:${src}`, "sourcerung", { source_id: src });
      if (r.state === "ok" && Number.isFinite(NAMED[r.value.rung])) at = NAMED[r.value.rung];
    }
    /* R12: the sources `to` may name: those the group's other pulled knocks read through `sourceof`, the same knocker's
       first, at most 20, this knock's own left out */
    const others = all.filter((x) => x.knock_id !== k.knock_id && typeof x.capture_sha === "string" && x.capture_sha)
      .sort((a, b) => (b.pseudonym && b.pseudonym === k.pseudonym) - (a.pseudonym && a.pseudonym === k.pseudonym) || String(b.received).localeCompare(String(a.received)))
      .slice(0, 20);
    const choices = [];
    if (src) for (const x of others) {
      const sid = sourceOf(x);
      if (sid && sid !== src && !choices.some((c) => c[0] === sid))
        choices.push([sid, x.pseudonym && x.pseudonym === k.pseudonym ? "screen.inbox.link.samechoice" : "screen.inbox.link.choice", { source: sid, knock: x.knock_id }]);
    }
    const link = src === undefined ? `<p class="mk-small">${cs.w("state.loading")}</p>`
      : !src ? `<p class="mk-small muted">${cs.w("screen.inbox.link.nosource")}</p>`
      : `<p class="mk-small">${cs.w("screen.inbox.source", { source: src })}</p>`
        + (choices.length ? `<div class="cs-reason">${cs.choice("cx-to", "screen.inbox.link.to", choices, { value: L.to || choices[0][0] })}`
          + `${cs.field("cx-evidence", "screen.inbox.link.evidence", { area: true, rec: true, value: L.evidence || "" })}`
          + `${cs.act("sourcelink", { data: { source: src } })}</div>` : `<p class="mk-small muted">${cs.w("screen.inbox.link.none")}</p>`);
    return `<section class="cs-section mk-sec"><h2><span class="id">${cs.esc(k.knock_id || id)}</span></h2>${facts(k)}${ladder(at)}`
      + (k.status === "new" ? `<div class="mk-acts">${cs.act("inboxpull", { tone: "primary" })}</div>`
        + `<div class="mk-acts">${cs.act("inboxresolve")}</div>` : "")
      + link + "</section>";
  });
  return `<div class="mk-h">${cs.title()}<p class="mk-sub">${cs.w("screen.inbox.sub")}</p></div>`
    + one
    + (L.pulled ? said(L.pulled === "existed" ? "screen.inbox.existed" : "screen.inbox.pulled") : "")
    + (L.discarded ? said("screen.inbox.discarded") : "")
    + (L.linked ? said("screen.inbox.link.done") : "")
    + list;
}

/* R7: "Move into the record" (`inboxpull`): the pull and its promotion are one act at the door (store-door R7). */
function sendPull(view) {
  return { body: { knockId: view.subject } };
}
function donePull(view, answer, cs) {
  cs.set("pulled", answer && answer.existed === true ? "existed" : "pulled");
  cs.set("discarded", false);
}

/* R7: "Discard with a reason" (`inboxresolve` to `discarded`): a reasoned act, so the shell asks the reason first and
 * sends it as `reason` (setup-page R11's rule); `RESOLVE_NO_REASON` drawn by its words, the knock left as it was. */
function sendDiscard(view) {
  return { body: { knockId: view.subject, status: "discarded" } };
}
function doneDiscard(view, answer, cs) {
  cs.set("discarded", true);
  cs.set("pulled", false);
}

/* R7, R12: "Record what is known of the source" (`sourcelink`, sources R6): this knock's source as `sourceof` read it,
 * the source chosen as the same person, and what shows it. No source id is typed. */
function sendSourceLink(view, el, cs) {
  const source = el && el.dataset ? String(el.dataset.source || "") : "";
  const to = String(cs.value("cx-to") || "").trim();
  const evidence = String(cs.value("cx-evidence") || "").trim();
  if (!source) return { refuse: "screen.inbox.link.nosource" };
  const missing = [!to && "screen.inbox.link.to", !evidence && "screen.inbox.link.evidence"].filter(Boolean);
  if (missing.length) return { refuse: "screen.inbox.link.missing", fills: { fields: missing.map((k) => cs.w(k)).join(", ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  cs.set("to", to);
  return { body: { source, to, evidence } };
}
function doneSourceLink(view, answer, cs) {
  cs.set("linked", true);
  cs.set("later", {});
}

export const INBOX_SCREEN = Object.freeze({
  id: "inbox",
  reads: inboxReads,
  render: renderInbox,
  acts: Object.freeze([
    Object.freeze({ op: "inboxpull", label: "act.inboxpull.label.inbox", send: sendPull, done: donePull }),
    Object.freeze({ op: "inboxresolve", label: "act.inboxresolve.label.inbox", send: sendDiscard, done: doneDiscard,
                    refusals: Object.freeze({ RESOLVE_NO_REASON: "screen.inbox.refusal.RESOLVE_NO_REASON" }) }),
    Object.freeze({ op: "sourcelink", label: "act.sourcelink.label.inbox", send: sendSourceLink, done: doneSourceLink, reasonField: "evidence" }),
  ]),
});
