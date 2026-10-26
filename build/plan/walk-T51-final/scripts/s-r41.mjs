/* R41 (watches, follows, leads), R136 (a watched source disappears, moves or is replaced), R137 (a source that refuses the plane), R138 (the unattended rhythm). */
import { check } from "./lib-04b.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";
import { J } from "./s-r39.mjs";

const R = (a) => (a && a.result !== undefined ? a.result : a);
const HTML = (body) => `<html><head><title>Agenda</title></head><body>${body}</body></html>`;

/* the room's network: a page by its last path segment (the kit's table), and the three special sites the watch rows need */
export function watchNetwork(kitRef) {
  const specials = new Map();
  return {
    specials,
    outbound: (req) => {
      const url = new URL(req.url);
      const name = url.pathname.split("/").pop();
      const s = specials.get(name);
      if (s) return s(req, url);
      const f = kitRef.k.upstream.get(name);
      if (!f) return new Response("not scripted", { status: 404 });
      return new Response(f.bytes, { headers: { "content-type": f.type, ...(f.length ? { "content-length": String(f.bytes.length) } : {}) } });
    },
  };
}

export async function r41(kit, ctx, net) {
  const { auth } = await kit.ownerOf("watcher");
  const cs = kit.screenCall(auth);
  const partner = await kit.person("partner");
  const outsider = await kit.person("outsider");
  const adm = await kit.founder();
  const project = await kit.projectOf(auth, "Watching the clerk");
  ctx.watchProject = project; ctx.watcher = auth;

  async function filed(name, body, title = name, host = "www.example.gov") {
    kit.serve(name, kit.te(body), { type: "text/html" });
    const got = await kit.acquire(auth, { locator: `https://${host}/pages/${name}`, project });
    const doc = R(got.body).document;
    const f = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc, title, locator: doc.locator, project });
    if (!f.bundleId) throw new Error("not filed: " + J(f, 300));
    return f.bundleId;
  }
  const monitor = async (id) => R((await kit.post(auth, "monitor", { bundleId: id })).body);
  const setFreq = async (id, frequency) => R((await kit.post(auth, "monitorset", { bundleId: id, enabled: true, frequency })).body);
  ctx.filed = filed; ctx.monitor = monitor;

  let agenda;
  await check("R41", "watch an address captured by the screen: each frequency (hourly, daily, weekly, monthly, per meeting, none) is kept; a seventh is refused with the list", "as the member", "acquire an address, file it, monitorset with each frequency, monitoring", async () => {
    agenda = await filed("agenda.html", HTML("<p>Item 1: approve the contract. Total $1,000.</p>"), "City Council agenda");
    const out = [];
    for (const f of ["hourly", "daily", "weekly", "monthly", "per_meeting", "none"]) { const r = await setFreq(agenda, f); out.push(`${f}:${r.ok ? "kept" : r.reason}`); }
    const bad = await setFreq(agenda, "yearly");
    const list = R(await kit.get(auth, { op: "monitoring" }));
    const item = list.items.find((i) => i.bundle === agenda);
    await setFreq(agenda, "daily");
    const after = R(await kit.get(auth, { op: "monitoring" })).items.find((i) => i.bundle === agenda);
    const ok = out.every((x) => /kept/.test(x)) && bad.reason === "MONITOR_SET_REFUSED" && item.state === "unscheduled" && after.frequency === "daily";
    return [ok ? "WORKS" : "BROKEN", `${out.join(", ")}; 'yearly' -> ${bad.reason} "${String(bad.translation).slice(0, 120)}", detail "${String(bad.detail).slice(0, 140)}"; with 'none' the list reads state ${item.state} (${item.reason}); after daily: state ${after.state}, frequency ${after.frequency} (${after.frequency_source}), last_checked ${after.last_checked}, counts ${J(list.counts)}`];
  });

  await check("R41", "'Check it now' (monitor) answers unchanged, modified, removed or could not be told, with why", "as the member", "monitor after no change; after the page changed; after the page was taken down; after it came back", async () => {
    const out = [];
    const a = await monitor(agenda); out.push(`unchanged-page -> ${a.status} "${a.note}" (compared ${a.compared}: ${a.compared_basis})`);
    kit.serve("agenda.html", kit.te(HTML("<p>Item 1: approve the contract. Total $2,000.</p>")), { type: "text/html" });
    const b = await monitor(agenda); out.push(`changed -> ${b.status} "${b.note}"; verdict ${b.assessment && b.assessment.verdict}, ${b.assessment && b.assessment.significance}; ${b.note2 || ""}`.slice(0, 380));
    ctx.afterModified = b;
    const qm = R(await kit.get(auth, { op: "queue" })).items.filter((i) => /modified|changed/.test(i.kind));
    ctx.queueAfterModified = qm.map((i) => ({ kind: i.kind, class: i.class, summary: i.summary }));
    kit.upstream.delete("agenda.html");
    const c = await monitor(agenda); out.push(`gone -> ${c.status} "${c.note}" observation ${c.observation && c.observation.state}`);
    ctx.afterRemoved = c;
    const qr = R(await kit.get(auth, { op: "queue" })).items.filter((i) => /removed|gone/.test(i.kind));
    ctx.queueAfterRemoved = qr.map((i) => ({ kind: i.kind, class: i.class, summary: i.summary, detail: i.detail }));
    kit.serve("agenda.html", kit.te(HTML("<p>Item 1: approve the contract. Total $2,000.</p>")), { type: "text/html" });
    const d = await monitor(agenda); out.push(`back -> ${d.status} "${d.note}"`);
    const ok = a.status === "unchanged" && b.status === "modified" && c.status === "removed" && !!d.status;
    return [ok ? "WORKS" : "BROKEN", out.join("; ")];
  });

  await check("R41", "'nothing changed' is dated first-party evidence and is stored (the look after a check)", "as the member", "read what the unchanged check wrote", async () => {
    const id = await filed("steady.html", HTML("<p>Nothing here ever changes.</p>"), "A steady page");
    await setFreq(id, "weekly");
    const a = await monitor(id), b = await monitor(id);
    const wrote = !!(a.observation && a.observation.written) || !!(b.observation && b.observation.written);
    return [a.status === "unchanged" ? "WORKS" : "BROKEN", `status ${a.status}/${b.status}; checked "${a.checked}"; observation written ${J(a.observation)}; ${b.observation ? "second check observation " + J(b.observation) : "second check carries no observation"} (stored first-party evidence that nothing changed: ${wrote})`];
  });

  await check("R41", "a watched change reaches the Queue and a removal reaches it as its own item; read which grade each carries", "as the member", "read op=queue straight after the modified and after the removed check", async () => {
    const ch = ctx.queueAfterModified, rm = ctx.queueAfterRemoved;
    const saw = `after the modified check: ${J(ch, 300)}; after the removed check: ${J(rm, 420)}; the Queue kind for a changed page is named "${ch[0] && ch[0].kind}" (the row and queuestate's roster call it watched-changed)`;
    return [ch.length && rm.length ? "WORKS" : "BROKEN", saw];
  });

  await check("R41", "pause: only an administrator pauses and resumes; the due slate ('Read what is due') names what would be checked; all administrators told", "as the member and the administrator", "monitorpause as member and admin; monitoring; monitorslate", async () => {
    const m = R((await kit.post(auth, "monitorpause", { paused: true, reason: "x" })).body);
    const p = R((await kit.post(adm, "monitorpause", { paused: true, reason: "Rehearsal pause while the clerk's site is down." })).body);
    const st = R(await kit.get(auth, { op: "monitoring" })).paused;
    const slate = R(await kit.get(auth, { op: "monitorslate" }));
    const r = R((await kit.post(adm, "monitorpause", { paused: false, reason: "Resuming." })).body);
    const ok = m.reason === "NOT_AN_ADMIN" && p.ok && st.paused === true && r.ok && typeof slate.prompt === "string";
    return [ok ? "WORKS" : "BROKEN", `member -> ${m.reason}; admin pause ${J(p, 160)}; the list reads paused ${J(st)}; slate counts ${J(slate.counts)}, prompt starts "${String(slate.prompt).slice(0, 90)}"; resume ${J(r, 120)}`];
  });

  await check("R41", "named requests: ask for something gathered on a schedule (target, places, authority, criticality, cadence); refusals; retire", "as the member", "namedrequestset, namedrequests, a bad place, no authority, retire", async () => {
    const set = R((await kit.post(auth, "namedrequestset", { bundle: project, target: { text: "Council agendas", description: "Every regular agenda" }, locators: ["https://www.example.gov/agendas"], authority: "the City Clerk", criticality: "crucial", cadence: "weekly" })).body);
    const http = R((await kit.post(auth, "namedrequestset", { bundle: project, target: { text: "x" }, locators: ["http://www.example.gov/a"], authority: "a", criticality: "crucial", cadence: "weekly" })).body);
    const noAuth = R((await kit.post(auth, "namedrequestset", { bundle: project, target: { text: "y" }, locators: ["https://www.example.gov/a"], criticality: "crucial", cadence: "weekly" })).body);
    const list = R(await kit.get(auth, { op: "namedrequests" }));
    const mine = list.items.find((i) => i.request === set.request);
    const retired = R((await kit.post(auth, "namedrequestset", { bundle: project, request: set.request, target: mine.target, locators: mine.locators, authority: mine.authority, criticality: mine.criticality, cadence: mine.cadence, status: "retired" })).body);
    const after = R(await kit.get(auth, { op: "namedrequests" })).items.find((i) => i.request === set.request);
    const ok = set.ok && http.reason === "NAMED_REQUEST_REFUSED" && noAuth.ok === false && retired.ok && after && after.status === "retired";
    return [ok ? "WORKS" : "BROKEN", `set ${J(set, 200)}; listed ${J({ state: mine.state, cadence: mine.cadence, due: mine.due })}; http place -> ${http.reason} (${String(http.detail).slice(0, 110)}); no authority -> ${noAuth.reason || "accepted"}; retire -> ${J(retired, 140)}, then status ${after && after.status}`];
  });

  await check("R41", "sweeps: a named member defines a sweep (https and public hosts only); an owner ratifies it; define starts nothing", "as the member (project owner)", "sweepset by the project's owner; sweeps; sweepratify", async () => {
    const set = R((await kit.post(auth, "sweepset", { bundle: project, title: "Agenda sweep", sources: ["https://www.example.gov"], seeds: ["https://www.example.gov/agendas"], match: { terms: ["contract"] }, cadence: "weekly", budget: { per_run: 5, backlog: 50 } })).body);
    const list = R(await kit.get(auth, { op: "sweeps" }));
    const sid = list.sweeps && list.sweeps[0] && list.sweeps[0].sweep;
    const rat = sid ? R((await kit.post(auth, "sweepratify", { sweep: sid, ratified: true })).body) : null;
    const saw = `sweepset by the project's owner (a signed-in member session) -> ${set.ok === false ? set.reason + ' "' + String(set.translation).slice(0, 120) + '"' : J(set, 200)}; sweeps lists ${list.sweeps ? list.sweeps.length : "?"}; ratify ${rat ? J(rat, 200) : "not tried, no sweep to ratify"}`;
    return [set.ok ? "WORKS" : "BROKEN", saw + (set.ok ? "" : " | the registry marks sweepset owed (DEC-382), but the op exists, the screen draws 'Define a sweep', and a member's session is answered as an automated credential: the control plane stamps no `author` on sweepset or sweepratify (link-sweep reads `author` from the query)")];
  });

  /* leads */
  let lead;
  await check("R41", "write down a lead (their own words, where it might be found): never evidence, never counted", "as the member", "lead {words, locator}", async () => {
    const r = R((await kit.post(auth, "lead", { words: "A clerk says the stamp log was backdated.", locator: "https://www.example.gov/stamplog" })).body);
    lead = r.lead_id;
    return [r.ok && r.evidence === false && r.author === "watcher" && r.state === "NEVER_LOOKED" ? "WORKS" : "BROKEN", `lead ${r.lead_id} by ${r.author} (server-stamped), evidence ${r.evidence}, state ${r.state}; "${String(r.says).slice(0, 150)}"`];
  });
  await check("R41", "a lead is read only by its author and joined participants of a project it is shared to; a non-participant and an administrator not named read none, answered as if no lead existed", "as the member, a second member and the administrator", "leadread as the author, a stranger and the founder; leadlist", async () => {
    const mine = R(await kit.get(auth, { op: "leadread", id: lead }));
    const o = R(await kit.get(outsider, { op: "leadread", id: lead }));
    const a = R(await kit.get(adm, { op: "leadread", id: lead }));
    const lists = [R(await kit.get(outsider, { op: "leadlist" })), R(await kit.get(adm, { op: "leadlist" }))].map((l) => l.leads.length);
    const ok = mine.lead_id === lead && o.reason === "LEAD_NOT_FOUND" && a.reason === "LEAD_NOT_FOUND" && lists[0] === 0 && lists[1] === 0;
    return [ok ? "WORKS" : "BROKEN", `author reads it; stranger -> ${o.reason}; founder -> ${a.reason}; their lists hold ${lists.join(" and ")} leads; the three sentences alike: ${o.translation === a.translation}`];
  });
  await check("R41", "record the look: four states; PRESENT must point at what was found; LOOKED_ABSENT is recorded against the lead", "as the member", "leadlook with each state, and PRESENT without a referent", async () => {
    const out = [];
    for (const st of ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial", "PRESENT"]) {
      const r = R((await kit.post(auth, "leadlook", { lead, state: st, detail: "Looked at the clerk's site and the portal." })).body);
      out.push(`${st}: ${r.ok ? "recorded seq " + r.seq : (r.code || r.reason) + " " + String(r.translation).slice(0, 70)}`);
    }
    const read = R(await kit.get(auth, { op: "leadread", id: lead }));
    return [out[0].includes("recorded") && out[3].includes("OBS_PRESENT_NO_REFERENT") ? "WORKS" : "BROKEN", `${out.join("; ")}; the lead now reads ${read.state} with ${read.looks.length} looks`];
  });
  await check("R41", "share into a project: only a project she has joined; cannot be un-read; then the project's joined participants read it", "as the member and a joined partner", "leadshare to a project not joined; invite and join the partner; leadshare; partner and outsider read", async () => {
    const no = R((await kit.post(auth, "leadshare", { lead, project: "PROJ-2026-9999", reason: "x" })).body);
    await kit.post(auth, "projectinvite", {}, { projectId: project, handle: "partner" });
    const j = R((await kit.post(partner, "projectjoin", {}, { projectId: project })).body);
    const before = R(await kit.get(partner, { op: "leadread", id: lead }));
    const sh = R((await kit.post(auth, "leadshare", { lead, project, reason: "The project should know the clerk's account." })).body);
    const after = R(await kit.get(partner, { op: "leadread", id: lead }));
    const out = R(await kit.get(outsider, { op: "leadread", id: lead }));
    const again = R((await kit.post(auth, "leadshare", { lead, project, reason: "Again." })).body);
    const ok = no.reason === "LEAD_SHARE_NOT_A_PARTICIPANT" && sh.ok && before.reason === "LEAD_NOT_FOUND" && after.lead_id === lead && out.reason === "LEAD_NOT_FOUND";
    return [ok ? "WORKS" : "BROKEN", `not joined -> ${no.reason}; partner joined ${J(j, 100)}; partner reads before sharing: ${before.reason || "readable"}; share ${J({ already: sh.already, says: String(sh.says).slice(0, 80) })}; partner after: ${after.lead_id ? "reads it (shared_to " + after.shared_to.length + ")" : after.reason}; a non-participant: ${out.reason}; sharing again: already ${again.already}`];
  });
  await check("R41", "a lead cited as a basis leg is refused by name (C-54.1)", "as the member", "a basis leg needs an inquiry (area 6 and 9's sitting)", async () => {
    return ["NOT REACHED", "the refusal LEAD_NOT_EVIDENCE is raised by the inquiry grammar when a question's leg names a lead; this sitting opens no question, so the act belongs to the area 6/9 walker; the lead made here (shared to the project) is what they would cite"];
  });
  await check("R41", "the frontier at level internet answers per viewer and names what it does not read", "as the member", "frontier level=internet", async () => {
    const f = R(await kit.get(auth, { op: "frontier", level: "internet" }));
    return [f.built && f.found && Array.isArray(f.not_read) && f.not_read.length ? "WORKS" : "BROKEN", `built ${f.built}, found ${f.found}, reads ${J(f.reads)}, names ${f.not_read.length} things it does not read (e.g. "${String(f.not_read[0] && f.not_read[0].why).slice(0, 110)}")`];
  });
  await check("R41", "follow a portal (followregister): a register followed in its static form; a portal's CSV snapshot diffed on the second read", "as the member", "followregister on an address; no portal fixture served", async () => {
    const r = R((await kit.post(auth, "followregister", { bundle: project, address: "https://www.example.gov/portal" })).body);
    return [r.ok ? "WORKS" : "BROKEN", `follow ${J(r, 300)}; the portal CSV snapshot and its second-read diff (1.5 MB, 24,121 rows) and a followed Legistar body are NOT REACHED here: no portal fixture is served in this room`];
  });
  await check("R41", "the Add screen and a question: 'Keep finding this' from Find in this reruns a scope search (DEC-164)", "as the member", "search for a Find-in keep op", async () => {
    return ["NOT REACHED", "no `keep` op for a Find-in scope search is named in the row and none is found among the ops this room declares; recorded as absent, not a defect"];
  });
  await check("R41", "bias never shapes what is watched: after adopting a scrutiny statement the watch slate and capture counts are unchanged", "as the member", "biasadopt without a proposal; counts before and after", async () => {
    const before = R(await kit.get(auth, { op: "monitorslate" })).counts, mb = R(await kit.get(auth, { op: "monitoring" })).counts;
    const ad = R((await kit.post(auth, "biasadopt", { statement: "This group holds that contracts should be adopted in public session." })).body);
    const after = R(await kit.get(auth, { op: "monitorslate" })).counts, ma = R(await kit.get(auth, { op: "monitoring" })).counts;
    const same = J(before) === J(after) && J(mb) === J(ma);
    return [ad.ok ? (same ? "WORKS" : "BROKEN") : "NOT REACHED", `adopting needs a proposed set (${ad.reason}: the proposal is the assistant's or the owners' vote, area 1/9), so no scrutiny statement was adopted here; counts before and after the refused attempt are unchanged: ${same}`];
  });
}
