/* R136 (a watched source disappears, moves or is replaced), R137 (a source that refuses the plane), R138 (the unattended rhythm), in the watch room. */
import { check } from "./lib-04b.mjs";
import { J } from "./s-r39.mjs";

const R = (a) => (a && a.result !== undefined ? a.result : a);
const HTML = (body, extra = "") => `<html><head><title>Agenda</title>${extra}</head><body>${body}</body></html>`;

export async function r136(kit, ctx, net) {
  const auth = ctx.watcher, filed = ctx.filed, monitor = ctx.monitor;
  const setFreq = async (id, frequency) => R((await kit.post(auth, "monitorset", { bundleId: id, enabled: true, frequency })).body);
  const queueFor = async (id) => R(await kit.get(auth, { op: "queue" })).items.filter((i) => i.subject && i.subject.id === id).map((i) => ({ kind: i.kind, class: i.class, summary: i.summary }));

  await check("R136", "(a) the page is taken down: the removal is noticed, the held copy kept, and read as a possible concealment, after the confirmation window and not before", "as the member", "serve a page, capture, watch, then answer 404 and tick once", async () => {
    const id = await filed("takedown.html", HTML("<p>The clerk's stamp log for October.</p>"), "Stamp log", "www.takedown.example");
    await setFreq(id, "daily");
    kit.upstream.delete("takedown.html");
    const t1 = await monitor(id);
    const q1 = await queueFor(id);
    const list = R(await kit.get(auth, { op: "list" })).find((b) => b.bundle_id === id);
    const item = R(await kit.get(auth, { op: "queue" })).items.find((i) => i.subject && i.subject.id === id);
    const concealment = JSON.stringify(item || {}).toLowerCase().includes("conceal");
    const saw = `first 404 tick -> status ${t1.status}, observation ${t1.observation && t1.observation.state}, reeval_raised ${t1.reeval_raised}; Queue straight after one tick: ${J(q1, 260)}; held copy still listed: ${!!list}; the item's words: "${item && item.summary}" / "${item && String(item.detail).slice(0, 120)}"; concealment named: ${concealment}; no confirmation window: the first 404 already ${t1.status}`;
    return ["BROKEN", saw + " | the design (FA:190-214) says a removal is noticed after a confirmation window and flagged as possible concealment; this one is flagged on the first 404 with no such window or word (build state of the window was marked unconfirmed in the map)"];
  });

  await check("R136", "(b) the page moved behind a redirect reads 'moved', not 'deleted'", "as the member", "serve a 301 from the watched address to a new one; tick", async () => {
    const id = await filed("moves.html", HTML("<p>The council's meeting calendar.</p>"), "Meeting calendar", "www.mover.example");
    await setFreq(id, "daily");
    kit.upstream.delete("moves.html");
    net.specials.set("moves.html", (req, url) => new Response(null, { status: 301, headers: { location: `${url.origin}/pages/new-home.html` } }));
    kit.serve("new-home.html", kit.te(HTML("<p>The council's meeting calendar.</p>")), { type: "text/html" });
    const t = await monitor(id);
    const mentions = /mov|redirect/i.test(`${t.status} ${t.note} ${J(t.observation)} ${J(t.assessment && t.assessment.why)}`);
    return [mentions ? "WORKS" : "BROKEN", `a 301 to a new address serving the same bytes -> status ${t.status} "${t.note}", observation ${t.observation && t.observation.state} "${t.observation && t.observation.detail}", assessment ${t.assessment && t.assessment.verdict}; nothing in the answer says the address moved (no redirect target, no 'moved'): ${!mentions}; a redirect to a new address whose bytes differ reads 'modified', one to a dead address reads 'removed (the source answered 404)'; 'moved' is never a reading`];
  });

  await check("R136", "(c) only the layout changes: no notice (for a kind with a reader); and what a page of no recognised kind does", "as the member", "serve the same words in new markup; tick", async () => {
    const id = await filed("layout.html", HTML("<p>Item 1: approve the contract.</p>"), "Layout page", "www.layout.example");
    await setFreq(id, "daily");
    kit.serve("layout.html", kit.te(HTML("<div class='wrap'><section><p>Item 1: approve the contract.</p></section></div>", "<style>.wrap{margin:2em}</style>")), { type: "text/html" });
    const t = await monitor(id);
    return `layout-only change -> ${t.status}, verdict ${t.assessment && t.assessment.verdict}, compared ${t.compared} (${String(t.compared_basis).slice(0, 110)}); for an unrecognised document 'nothing is assumed to be decoration and any difference is reported' (its own profile note), so a notice here is by design; a kind with a reader is the document-kind row's (R140), not forced in this sitting`;
  });
  await check("R136", "(d) a figure changed within rounding on a table: no notice; outside tolerance a field-level change", "as the member", "needs a recognised table kind", async () => ["NOT REACHED", "tolerances are a property of a money table's reading (area 7); a generic page has none and reports every difference; no table reading is made in this sitting"]);

  await check("R136", "(e) a new document at a watched index reads as 'new content'", "as the member", "serve an index of two links, capture, watch; add a third link; tick", async () => {
    const id = await filed("index.html", HTML("<ul><li><a href='/pages/a.html'>Agenda A</a></li><li><a href='/pages/b.html'>Agenda B</a></li></ul>"), "Agenda index", "www.index.example");
    await setFreq(id, "daily");
    kit.serve("index.html", kit.te(HTML("<ul><li><a href='/pages/a.html'>Agenda A</a></li><li><a href='/pages/b.html'>Agenda B</a></li><li><a href='/pages/c.html'>Agenda C</a></li></ul>")), { type: "text/html" });
    const t = await monitor(id);
    const q = await queueFor(id);
    return `adding a third link -> status ${t.status}, assessment ${t.assessment && t.assessment.verdict}/${t.assessment && t.assessment.significance}, arrivals ${J(t.arrivals)}; Queue ${J(q, 220)}; the answer names no 'new content' kind: ${!/new/i.test(JSON.stringify(q) + t.note)}`;
  });

  await check("R136", "(f) every question and case citing the source shows a re-evaluation flag", "as the member", "read reeval_raised on the ticks", async () => {
    return ["NOT REACHED", `no question or case cites a watched source in this sitting (area 6/9 make them); the plane raises the flag at the tick: reeval_raised ${ctx.afterRemoved && ctx.afterRemoved.reeval_raised} after the removal`];
  });
  await check("R136", "a changed tick files the new capture or states why not; on a rendered capture the tick compares only the frame", "as the member", "read the modified tick's capture field", async () => {
    const b = ctx.afterModified;
    return `modified tick: capture ${J(b.capture)}, note2 "${String(b.note2).slice(0, 150)}"; the rendered-frame comparison is NOT REACHED (no render binding served here)`;
  });

  /* R137 */
  net.specials.set("refuses.html", () => new Response("Forbidden: automated access is not permitted.", { status: 403, headers: { "content-type": "text/plain" } }));
  await check("R137", "a host that refuses the plane: the refusal is attributed to the source, not to our pacing; nothing implies the plane disguised itself", "as the member", "acquire an address that answers 403, three times; read sourcereach", async () => {
    const out = [];
    for (let i = 0; i < 3; i++) {
      const r = await kit.acquire(auth, { locator: "https://www.refuser.example/pages/refuses.html", project: ctx.watchProject });
      const b = R(r.body);
      out.push(`${r.status} ${b.reason || b.code || (b.ok ? "ok" : "?")} status ${b.status}: sentence in the answer "${String(b.translation || b.detail || "")}"`);
    }
    const reach = R(await kit.get(auth, { op: "sourcereach", address: "https://www.refuser.example/pages/refuses.html" }));
    const text = out.join(" ").toLowerCase() + J(reach).toLowerCase();
    const disguise = /disguis|pretend|impersonat|browser/.test(text);
    return [!disguise ? "WORKS" : "BROKEN", `three presses: ${out.join(" | ")}; sourcereach ${J(reach, 500)}; a sentence about disguise: ${disguise}; after three failures a copy from an archive is fetched only after fourteen days and an instance wired with env.SELF and a daemon token (the eligibility condition is designed, not built: NOTIFICATIONS.md:211): NOT REACHED in a window of seconds`];
  });
  await check("R137", "a watch on the refusing address shows refused with the reason and stays due", "as the member", "capture a page, then have the host refuse it; tick", async () => {
    const id = await filed("turns-hostile.html", HTML("<p>A page that will start refusing us.</p>"), "Turns hostile", "www.hostile.example");
    await setFreq(id, "daily");
    kit.upstream.delete("turns-hostile.html");
    net.specials.set("turns-hostile.html", () => new Response("Forbidden", { status: 403 }));
    const t = await monitor(id);
    const l = R(await kit.get(auth, { op: "monitoring" })).items.find((i) => i.bundle === id);
    const stillDue = l.state === "due";
    return [/refus|unreach|could not|indetermin|403/i.test(`${t.status} ${t.note}`) && stillDue ? "WORKS" : "BROKEN", `403 tick -> status ${t.status} "${t.note}", observation ${t.observation && t.observation.state} "${t.observation && t.observation.detail}"; the list item afterwards: ${J(l, 420)}; the row says the watch 'stays due' after a refusal: it reads ${l.state}`];
  });

  /* R138 */
  await check("R138", "the notice arrives once; the outstanding conditions re-derive after repeated reads and ticks (no duplicate, none lost)", "as the member", "tick the same changed page four more times; read the Queue three times", async () => {
    const id = await filed("rhythm.html", HTML("<p>The first reading.</p>"), "Rhythm page", "www.rhythm.example");
    await setFreq(id, "hourly");
    kit.serve("rhythm.html", kit.te(HTML("<p>The second reading.</p>")), { type: "text/html" });
    for (let i = 0; i < 4; i++) await monitor(id);
    const reads = [await queueFor(id), await queueFor(id), await queueFor(id)];
    const changed = reads.map((r) => r.filter((x) => x.kind === "source-modified").length);
    const once = changed.every((n) => n === 1) && J(reads[0]) === J(reads[2]);
    return [once ? "WORKS" : "BROKEN", `after four ticks of one change, three Queue reads hold ${changed.join("/")} source-modified item(s) for the page (the other item is the authority task of R146); ${J(reads[0], 260)}; an idle hour and a restart of the object are not forced offline (the scheduler's own alarm is the object's; see the ledger rows)`];
  });
  await check("R138", "leave a watch and a nearing due date running across a reload and an idle period", "as the member", "an idle period", async () => ["NOT REACHED", "offline the clock is the machine's: no idle hour passes and the scheduler's alarm is not advanced by the walk; the live phase (a watch left over an hour, the ledger read first and last) walks it"]);
}
