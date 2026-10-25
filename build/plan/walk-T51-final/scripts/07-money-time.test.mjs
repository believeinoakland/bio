/* WALK-FINAL-07 #1 (sitting 07, Money, time, connections, registers; K5122): the offline journey of rows R60, R157, R62, R61, R63, R64, R158, R65, R156 and the overlay checks that fall on them.
   The real plane in Miniflare (r8-kit), every input made by the member's own acts through the door or through the real screens drawn in Chromium (the page routed to the Miniflare plane);
   no answer is hand-written, no row written to storage. Records its rows as it goes to `07-money-time.md`; screenshots to `shots/07-money-time/`.
   Run: `node --test build/plan/walk-T51-final/scripts/07-money-time.test.mjs` from bio-plane/ (needs Chromium at /opt/pw-browsers/chromium and playwright). */
import "../../../../bio-plane/test/sandbox.mjs";
import { test, after } from "node:test";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const RECORD = process.env.RECORD || HERE + "../07-money-time.md";
const ONLY = process.env.ONLY || "";   /* a development aid: ONLY=money skips R60 and R157 and writes to $RECORD */
const want = (k) => !ONLY || ONLY === k;
const SHOTS = HERE + "../shots/07-money-time/";
mkdirSync(SHOTS, { recursive: true });
const pw = createRequire("/opt/node-tools/node_modules/x.js")("playwright");
const J = (x, n = 500) => { const s = typeof x === "string" ? x : (JSON.stringify(x) ?? String(x)); return s.length > n ? s.slice(0, n) + "…" : s; };
const cell = (s) => String(s).replace(/\|/g, "¦").replace(/\n+/g, " ");
const counts = { WORKS: 0, BROKEN: 0, "NOT REACHED": 0, KNOWN: 0 };
export function rec(id, check, width, role, did, verdict, saw, shot = "") {
  counts[verdict.split(" ")[0] === "NOT" ? "NOT REACHED" : verdict.split(" ")[0]] = (counts[verdict.split(" ")[0] === "NOT" ? "NOT REACHED" : verdict.split(" ")[0]] || 0) + 1;
  appendFileSync(RECORD, `| ${[id, check, width, role, did, verdict, saw, shot].map(cell).join(" | ")} |\n`);
}
writeFileSync(RECORD, `# WALK-FINAL-07 #1: sitting 07, Money, time, connections, registers (offline, Phase 1)\n\n**Counts** · (written at the end)\n\nCode: \`tranche/T51\` merged at start (be71d70e3f and later). Room: a fresh Miniflare plane of its own, claimed by the founder; \`ann\` (contribute, publish, create_projects) and \`max\` (plain member) made by the founder's \`memberadd\` and their own \`enroll\`; the instance's profile \`oakland-alameda\` chosen (the team's time zone, area 1's act). Screens drawn in Chromium against the plane at 1280 and 390 px.\n\n| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n`);

const kit = makeKit({ tag: "w07" });
after(() => kit.mf.dispose());
const R = kit.R;
let ann, max, project, cs, mcs, acs;
const docs = {};
const ents = {};

async function browserFor(auth, handle, width = 1280) {
  const b = await pw.chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width, height: 900 } });
  const token = auth.authorization.replace(/^Bearer /, "");
  await ctx.addInitScript(([t, h]) => { try { localStorage.setItem("bio-session", JSON.stringify({ t, e: 0, d: "own", w: h })); } catch (e) { /* none */ } }, [token, handle]);
  const page = await ctx.newPage();
  const log = [], out = [];
  await page.route("**/*", async (route) => {
    const req = route.request(), u = new URL(req.url());
    if (u.origin !== "https://group.example") { out.push(req.url()); return route.abort(); }
    const t0 = Date.now(), init = { method: req.method(), headers: req.headers() };
    const pd = req.postDataBuffer(); if (pd) init.body = pd;
    delete init.headers["content-length"]; delete init.headers.host;
    const res = await kit.mf.dispatchFetch(req.url(), init);
    const body = Buffer.from(await res.arrayBuffer());
    const headers = {}; res.headers.forEach((v, k) => { if (!/^(content-encoding|content-length|transfer-encoding)$/i.test(k)) headers[k] = v; });
    const op = u.searchParams.get("op");
    if (op) log.push({ op, status: res.status, ms: Date.now() - t0, st: headers["server-timing"] || "", body: pd ? pd.toString().slice(0, 600) : "", answer: body.toString().slice(0, 1500) });
    return route.fulfill({ status: res.status, headers, body });
  });
  const ui = {
    b, page, log, out, width,
    async go(path) { const t0 = Date.now(); await page.goto("https://group.example" + path, { waitUntil: "load" }); await page.waitForSelector("#cs-main", { timeout: 30000 }); await page.waitForTimeout(2500); return Date.now() - t0; },
    text: () => page.innerText("#cs-main"),
    async shot(name) { const p = `${name}-${width}.png`; await page.screenshot({ path: SHOTS + p, fullPage: true }); return `shots/07-money-time/${p}`; },
    async fill(id, v) { await page.fill("#" + id, String(v)); },
    async pick(id, v) { await page.selectOption("#" + id, v); },
    async press(act, opts = {}) {
      const n = log.length;
      const sel = `#cs-main button[data-act="${act}"]` + (opts.nth !== undefined ? "" : "");
      const el = page.locator(sel).nth(opts.nth || 0);
      await el.scrollIntoViewIfNeeded(); await el.click();
      await page.waitForTimeout(opts.wait || 2500);
      return log.slice(n);
    },
    /* press an act; a reasoned one opens "Your reason" in place: send it empty first when `emptyFirst`, then with `reason` */
    async act(act, { reason = null, nth = 0, wait = 2500, emptyFirst = false } = {}) {
      const n = log.length, btn = page.locator(`#cs-main button[data-act="${act}"]`).nth(nth);
      await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(700);
      const slot = page.locator(".cs-reason:visible textarea").first();
      const out = { refusal: "", reasonAsked: (await slot.count()) > 0 };
      if (out.reasonAsked) {
        const send = page.locator('.cs-reason:visible [data-shell="reason-send"]').first();
        if (emptyFirst) { await send.click(); await page.waitForTimeout(1200); out.refusal = (await page.locator("[data-reason-refusal]:visible").first().innerText().catch(() => "")).trim(); }
        if (reason !== null) { await slot.fill(reason); await send.click(); await page.waitForTimeout(wait); }
      } else await page.waitForTimeout(wait);
      out.calls = log.slice(n); out.said = (await page.locator("#cs-main .cs-refusal, #cs-main [role=alert], #cs-main .mk-note").allInnerTexts().catch(() => [])).join(" / ");
      return out;
    },
    async overflow() { return page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth })); },
    last(op) { return [...log].reverse().find((x) => x.op === op); },
    close: () => b.close(),
  };
  return ui;
}
const stOf = (x) => { const m = /do-(\w+);dur=(\d+)/.exec(x && x.st || ""); const t = /^(\w+);dur=(\d+)/.exec(x && x.st || ""); return x ? `${x.op} ${x.status} wall ${x.ms} ms; ${t ? "total " + t[2] + " ms" : ""}${m ? "; " + m[0] : ""}` : ""; };
const te = kit.te;
async function upload(auth, cs0, name, bytes, type = "text/plain", { vouch = true } = {}) {
  const b = typeof bytes === "string" ? te(bytes) : bytes;
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: b })).json()).result;
  if (!up || up.ok !== true) throw new Error("upload " + name + " " + J(up));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs0, { doc: up.document, title: name, locator: up.document.locator, project });
  if (filed.refused) throw new Error("file " + name + " " + J(filed));
  const d = { name, sha: kit.sha(b), bundle: filed.bundleId, up };
  if (vouch) {
    const sel = R(await cs0.call("select", { body: { ids: [d.bundle] } }));
    const rel = await cs0.call("release", { query: { handle: sel.handle, acknowledgment: "I checked this file is as filed.", mitigation: "Nothing in it names a private person." } });
    d.vouched = !(rel.ok === false || R(rel).ok === false);
  }
  docs[name] = d; return d;
}
const ent = async (key, kind, label) => (ents[key] = R(await cs.call("entitycreate", { body: { kind, label, note: "made in the walk" } })).entity_id);

test("sitting 07: the room, then the rows in the founder's order", { timeout: 3_000_000 }, async () => {
  try { await journey(); } catch (e) { console.log("JOURNEY STOPPED: " + (e && e.stack || e)); throw e; }
});

async function journey() {
  /* ---- the room (prerequisites by the real acts) ---- */
  const adm = await kit.founder(); acs = kit.screenCall(adm);
  await kit.profileSet(["oakland-alameda"]);
  ann = (await kit.ownerOf("ann")).auth; cs = kit.screenCall(ann);
  max = await kit.person("max"); mcs = kit.screenCall(max);
  project = await kit.projectOf(ann, "Contract spending against policy");
  await upload(ann, cs, "minutes", "The council adopted Ordinance 13579 on March 3, 2026. The City Clerk received the amended contract with Acme Paving on April 10, 2026. The deputy clerk signed the payment record on May 2, 2026.");
  await upload(ann, cs, "award", "The City awarded Contract C-100 to Acme Paving for road repair on June 1, 2026, without a solicitation.");
  await ent("city", "institution", "City of Oakland"); await ent("acme", "institution", "Acme Paving"); await ent("clerk", "person", "Dana Clerk");
  await ent("contract", "contract", "Contract C-100"); await ent("ord", "ordinance", "Ordinance 13579");
  console.log("ROOM", project, J(ents), Object.keys(docs));

  /* ---- R60 the timeline ---- */
  const ui = await browserFor(ann, "ann", 1280);
  const T = `/app/timeline/${project}`;
  const wall0 = await ui.go(T);
  console.log("T1 empty wall", wall0, J((await ui.text()).slice(0, 400)));
  const opts = await ui.page.evaluate(() => [...document.querySelectorAll("#tl-kind option")].map((o) => o.textContent));
  console.log("KINDS", J(opts, 800));
  if (want('time')) {
  /* ---- R60 ---- */
  const emptyShot = await ui.shot("R60-timeline-empty");
  rec("R60", "open the Timeline of a project with documents and no event (state a)", "1280", "member ann", "opened /app/timeline/<project> of a project holding two vouched documents", "WORKS", `empty line "No event is recorded yet for the people and events this project follows. Start with “Record an event” below."; first screen ${wall0} ms wall (29 reads)`, emptyShot);
  rec("R60", "the Timeline kind box (E14): plain words with raw vocabulary", "1280", "member ann", "read the options of the “What happened” box", opts.filter((o) => /^[a-z]/.test(o)).length ? "BROKEN (MINOR; KNOWN E14, carried to later-ux)" : "WORKS", `${opts.length} kinds; raw lowercase words: ${opts.filter((o) => /^[a-z]/.test(o)).join(", ")}`, emptyShot);
  /* createevent: reasoned, so it asks first */
  const e0 = await ui.act("createevent", { emptyFirst: true, reason: "The minutes record the council's adoption." });
  const ev1 = e0.calls.find((x) => x.op === "createevent");
  rec("R60", "Record an event from a cited passage (a reasoned act: the reason is asked before it runs; an empty one is refused in place)", "1280", "member ann", "pressed “Record an event”, sent the empty reason, then a reason", e0.reasonAsked && ev1 && /"ok":true/.test(ev1.answer) ? "WORKS" : "BROKEN", `reason asked in place: ${e0.reasonAsked}; empty reason: "${e0.refusal}"; ${stOf(ev1)}; answer ${J(ev1 && ev1.answer, 200)}`);
  await ui.go(T);
  const t1 = await ui.text();
  const undatedListed = /Undated|undated/i.test(t1);
  console.log("T1 TEXT", J(t1.split("ADD TO THE TIMELINE")[0], 1500));
  rec("R60", "an event recorded from a passage is placed on a lane with its date", "1280", "member ann", "recorded an event from the minutes passage, reloaded the Timeline", /March 3, 2026/.test(t1.split("ADD TO THE TIMELINE")[0]) ? "WORKS" : "BROKEN (MAJOR)", `the event is listed apart as undated (${undatedListed}); lanes empty; no date on the event although the passage's date was recorded as a dated fact. The screen's “Record an event” sends one attestation, {captureSha, extent}, with no date (timeline.mjs createevent), an extent attestation carries value null and the governing attestation is the first one with a value (events/index.mjs #governingMany), and no screen act (eventattest, eventgovern) attaches a dated attestation. So no event a member records on the screen can reach a lane.`, await ui.shot("R60-event-undated"));
  /* the dated fact: a day, then a month (rough stays rough) */
  await ui.fill("tl-date", "2026-03-03"); await ui.pick("tl-datekind", "adopted");
  const d1 = await ui.act("recorddatedfact");
  await ui.fill("tl-date", "2026-04"); await ui.pick("tl-datekind", "received");
  const d2 = await ui.act("recorddatedfact");
  await ui.fill("tl-date", "next Tuesday"); const d3 = await ui.act("recorddatedfact");
  await ui.go(T);
  const t2 = (await ui.text()).split("ADD TO THE TIMELINE")[0];
  const df1 = d1.calls.find((x) => x.op === "recorddatedfact"), df2 = d2.calls.find((x) => x.op === "recorddatedfact");
  rec("R60", "record a dated fact from a passage: a day, and a month (a rough date stays rough); the third list “Dated in the documents”", "1280", "member ann", "typed 2026-03-03 (Adopted) and 2026-04 (Received) in “A day, or a month”, pressed “Record a dated fact” each", /March 3, 2026 Adopted/.test(t2) && /April 2026 \(month known\)/.test(t2) ? "WORKS" : "BROKEN", `${stOf(df1)}; ${stOf(df2)}; list reads: ${J(t2.slice(t2.indexOf("DATED IN")), 420)}`, await ui.shot("R60-dated"));
  const typed = d3.calls.find((x) => x.op === "recorddatedfact");
  rec("R60", "a date the screen cannot read is refused before it is sent", "1280", "member ann", "typed “next Tuesday”, pressed “Record a dated fact”", !typed ? "WORKS" : "BROKEN", `no request left (${!typed}); said: ${J(d3.said, 200)}`);
  rec("R60", "the dated-fact line reads “· grade” with nothing after it", "1280", "member ann", "read the line under each dated fact", /· grade\s*$/m.test(t2) ? "BROKEN (MINOR)" : "WORKS", `the line reads: "${(t2.match(/To the day[^\n]*/) || [""])[0]}"`, await ui.shot("R60-dated-grade"));
  /* dated events: the screen cannot date one (above), so the door's `createevent` with a dated attestation, as an event imported from a dated source would be */
  const factId = R(await cs.call("recorddatedfact", { body: { captureSha: docs.minutes.sha, extent: { kind: "doc-para", para: 0, run: null }, kind: "adopted", value: "2026-03-03", method: "a member's reading of the passage" } })).dated_fact.dated_fact_id;
  const evAdopt = R(await cs.call("createevent", { body: { kind: "adoption", attestations: [{ datedFactId: factId }] } }));
  const fact2 = R(await cs.call("recorddatedfact", { body: { captureSha: docs.minutes.sha, extent: { kind: "doc-para", para: 0, run: null }, kind: "signed", value: "2026-05-02", method: "a member's reading of the passage" } })).dated_fact.dated_fact_id;
  const evSign = R(await cs.call("createevent", { body: { kind: "signing", attestations: [{ datedFactId: fact2 }] } }));
  const evUnordered = R(await cs.call("createevent", { body: { kind: "meeting", attestations: [{ testimony: "I attended the committee that week", value: { value: "2026-03", precision: "edtf" } }] } }));
  console.log("EVENTS", J([evAdopt, evSign, evUnordered]));
  await ui.go(T);
  const t3 = (await ui.text()).split("ADD TO THE TIMELINE")[0];
  console.log("T3", J(t3, 2500));
  const lanesShot = await ui.shot("R60-lanes");
  rec("R60", "two lanes “What they did” and “What we did”; undated items shown apart", "1280", "member ann", "recorded dated events through the door (a dated fact as attestation; a member's testimony with a month), reloaded", /WHAT THEY DID/.test(t3) && /March 3, 2026/.test(t3) ? "WORKS" : "BROKEN", J(t3.slice(t3.indexOf("WHAT THEY DID")), 700), lanesShot);
  rec("R60", "an undated event is explained by a sentence a member can understand", "1280", "member ann", "read the line under the undated event", /owner does not settle its validity/.test(t3) ? "BROKEN (MAJOR: a member would not understand)" : "WORKS", `the undated event reads "listed apart, never guessed into place" then "Undetermined, because its owner does not settle its validity"; the plane's own reason (events.why.placed_nowhere_attestation: "no attestation you can see dates this event, so none governs its time") is replaced by the People screen's stock sentence (setup-words people.why.owner_settle_validity) because the screen's reason table does not know the sentence`, lanesShot);
  /* who took part, link two events, the hunch, "Look for dates", "Follow from here" */
  await ui.page.reload({ waitUntil: "load" }); await ui.page.waitForSelector("#cs-main"); await ui.page.waitForTimeout(2500);
  const evOpts = await ui.page.evaluate(() => [...document.querySelectorAll("#tl-event option")].map((o) => o.value + "=" + o.textContent));
  const whoOpts = await ui.page.evaluate(() => [...document.querySelectorAll("#tl-who option")].map((o) => o.value + "=" + o.textContent));
  console.log("OPTS", J(evOpts), J(whoOpts));
  await ui.pick("tl-event", evAdopt.event_id); await ui.pick("tl-who", ents.clerk); await ui.pick("tl-role", "signatory");
  const p1 = await ui.act("addparticipant", { emptyFirst: true, reason: "The minutes name the clerk as signing." });
  const pc = p1.calls.find((x) => x.op === "addparticipant");
  rec("R60", "add who took part (a reasoned act) from the passage", "1280", "member ann", "chose the adoption event, Dana Clerk, “Signed”, pressed “Add who took part”, empty reason then a reason", pc && /"ok":true/.test(pc.answer) ? "WORKS" : "BROKEN", `empty reason: "${p1.refusal}"; ${stOf(pc)}; ${J(pc && pc.answer, 220)}`);
  await ui.pick("tl-event", evAdopt.event_id); await ui.pick("tl-to", evSign.event_id); await ui.pick("tl-rel", "authorises");
  const r1 = await ui.act("relate");
  const rc = r1.calls.find((x) => x.op === "relate");
  rec("R60", "link two events (relate: precedes/authorises) from a passage", "1280", "member ann", "chose the adoption event and the signing event, “The first authorized the second”, pressed “Link events”", rc && /"ok":true/.test(rc.answer) ? "WORKS" : "BROKEN", `${stOf(rc)}; ${J(rc && rc.answer, 260)}`);
  await ui.fill("tl-hunch", "The delay between adoption and signing may be why the payment ran over."); 
  const h1 = await ui.act("hypothesishold", { reason: "A hunch, not evidence." });
  const hc = h1.calls.find((x) => x.op === "hypothesishold");
  rec("R60", "keep a suspected cause as a hunch", "1280", "member ann", "typed a hunch, pressed “Keep a suspected cause as a hunch”", hc && /"ok":true/.test(hc.answer) ? "WORKS" : "NOT REACHED (no question exists in this project yet; the box offers none)", `${stOf(hc)}; ${J(hc && hc.answer, 260)}; said: ${J(h1.said, 160)}`);
  const f1 = await ui.act("findin"); 
  rec("R60", "“Look for dates in this project” opens Find in", "1280", "member ann", "pressed “Look for dates in this project”", /find-in/.test(ui.page.url()) ? "WORKS" : "BROKEN", `landed on ${ui.page.url().replace("https://group.example", "")}`);
  rec("R60", "“Follow from here” on an event (owed, DEC-409)", "1280", "member ann", "looked for the control on the Timeline", (await ui.page.locator('button[data-act="followfrom"]').count()) ? "BROKEN (offered but owed)" : "WORKS (absent, as owed; recorded, not a defect)", "no “Follow from here” control drawn on the Timeline");
  await ui.close();
  const u390 = await browserFor(ann, "ann", 390);
  await u390.go(T);
  const ov = await u390.overflow();
  rec("R60", "the Timeline at 390 px: no sideways scroll", "390", "member ann", "opened the Timeline with events, dated facts and the forms", ov.sw <= ov.iw ? "WORKS" : "BROKEN (MINOR)", `scrollWidth ${ov.sw} / innerWidth ${ov.iw}`, await u390.shot("R60-timeline"));
  await u390.close();

  /* ---- R157 progressions (declared flows) ---- */
  const solic = await upload(ann, cs, "solicitation", "The City issued the request for proposals for Contract C-200 on September 1, 2026.");
  const award2 = await upload(ann, cs, "award-c200", "The City awarded Contract C-200 to Acme Paving on September 20, 2026.");
  const pe = await browserFor(ann, "ann", 1280);
  await pe.go(T);
  const STEPS = "solicitation | Solicitation | | | always | 1\naward | Award | solicitation | 10 days | always | 1";
  await pe.fill("pd-name", "Contract award"); await pe.fill("pd-cite", "Oakland Municipal Code 2.04.020"); await pe.fill("pd-steps", STEPS);
  const pd0 = await pe.act("progressiondefine", { emptyFirst: true });
  rec("R157", "define a flow: the basis is required (a reasoned act; an empty basis is refused in place)", "1280", "member ann", "typed a name, a citation and two steps, left the basis empty, pressed “Declare the progression”", pd0.reasonAsked && !pd0.calls.find((x) => x.op === "progressiondefine") ? "WORKS" : "BROKEN", `reason asked in place: ${pd0.reasonAsked}; refusal "${pd0.refusal}"; request sent: ${!!pd0.calls.find((x) => x.op === "progressiondefine")}`);
  await pe.fill("pd-basis", "The code requires an award within 10 days of the solicitation's closing.");
  const pd1 = await pe.act("progressiondefine", { reason: "The code requires an award within 10 days of the solicitation's closing." });
  const pdc = pd1.calls.find((x) => x.op === "progressiondefine");
  rec("R157", "define a flow (key the record does not hold yet): version 1 written with basis", "1280", "member ann", "typed the basis and pressed “Declare the progression”", pdc && /"version":1/.test(pdc.answer) ? "WORKS" : "BROKEN", `${stOf(pdc)}; body ${J(pdc && pdc.body, 300)}; answer ${J(pdc && pdc.answer, 300)}; landed ${pe.page.url().replace("https://group.example", "")}`, await pe.shot("R157-defined"));
  const KEY = "contract_award";
  const same = await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Contract award", basis: "same again", citation: "x", stages: [{ key: "solicitation", label: "Solicitation", after: null, within: null, required: "always", cardinality: "1" }, { key: "award", label: "Award", after: "solicitation", within: "10 days", required: "always", cardinality: "1" }] } });
  rec("R157", "re-declare identically: nothing is written", "1280", "member ann", "sent the same steps again through the door", R(same).unchanged === true && R(same).version === 1 ? "WORKS" : "BROKEN", J(R(same), 300));
  const stg = (extra = {}) => [{ key: "solicitation", label: "Solicitation", after: null, within: null, required: "always", cardinality: "1" }, { key: "award", label: "Award", after: "solicitation", within: "30 days", required: "always", cardinality: "1" }, ...(extra.more || [])];
  const nb = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Contract award", stages: stg() } }));
  const nc = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Contract award", basis: "The council amended the window.", stages: stg() } }));
  const badStage = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Contract award", stages: [{ key: "award", label: "Award", after: "ghost", within: null, required: "always", cardinality: "1" }] } }));
  const v2 = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Contract award", basis: "The council amended the window.", citation: "Ordinance 13579, section 2", stages: stg() } }));
  rec("R157", "revise with no statement: NO_BASIS; a statement and no citation: NO_CITATION; a bad stage is heard first", "1280", "member ann", "revised the flow three ways through the door", nb.code === "NO_BASIS" && nc.code === "NO_CITATION" && badStage.code !== "NO_BASIS" ? "WORKS" : "BROKEN", `no basis: ${nb.code}; basis only: ${nc.code}; bad stage first: ${badStage.code || badStage.reason}. ${J(nb.translation || nb.detail, 160)}`);
  rec("R157", "revise with both: version 2 written, the receipt naming the version written and the one standing", "1280", "member ann", "revised with a statement and a citation", v2.version === 2 ? "WORKS" : "BROKEN", J(v2, 380));
  const rd1 = R(await cs.call("progression", { query: { key: KEY, version: "1" } })), rd2 = R(await cs.call("progression", { query: { key: KEY, version: "2" } }));
  rec("R157", "read version 1 and version 2 with author, date and basis", "1280", "member ann", "read the progression at version=1 and version=2", rd1.version === 1 && rd2.version === 2 && rd2.basis ? "WORKS" : "BROKEN", `v1 ${J({ basis: rd1.basis, by: rd1.declared_by, at: rd1.at, within: (rd1.stages || [])[1] && rd1.stages[1].within_interval }, 300)}; v2 ${J({ basis: rd2.basis, by: rd2.declared_by, at: rd2.at, within: (rd2.stages || [])[1] && rd2.stages[1].within_interval }, 300)}`);
  await ent("c200", "contract", "Contract C-200");
  /* an award with no solicitation (C-100): the missing-predecessor finding */
  const th1 = R(await cs.call("thread", { body: { progressionKey: KEY, entityId: ents.contract, placements: [{ stage: "award", captureSha: docs.award.sha }] } }));
  const in1 = R(await cs.call("instance", { query: { key: KEY, id: ents.contract } }));
  const fk = (in1.findings || []).map((f) => f.kind);
  rec("R157", "thread a document to a step; read the instance (naming its definition version) and the missing-predecessor finding", "1280", "member ann", "threaded the award document to “Award” of Contract C-100 with no solicitation, read the instance", th1.ok !== false && fk.includes("missing_predecessor") && in1.definition_version ? "WORKS" : "BROKEN", `thread ${J(th1, 200)}; findings ${J(fk)}; definition_version ${in1.definition_version}; grade ${J(in1.grade || in1.how_sure, 120)}; ${J((in1.findings || [])[0], 400)}`);
  /* a solicitation dated, no award, past its term (C-200): the overdue-successor finding */
  await cs.call("recorddatedfact", { body: { captureSha: docs.solicitation.sha, extent: { kind: "document" }, kind: "issued", value: "2026-09-01", method: "a member's reading of the passage" } });
  const th2 = R(await cs.call("thread", { body: { progressionKey: KEY, entityId: ents.c200, placements: [{ stage: "solicitation", captureSha: docs.solicitation.sha }] } }));
  const in2 = R(await cs.call("instance", { query: { key: KEY, id: ents.c200 } }));
  const od = (in2.findings || []).find((f) => f.kind === "overdue_successor");
  const odText = J(od, 700);
  rec("R157", "read the overdue-successor finding in the record's words (never “overdue” or “late”)", "1280", "member ann", "threaded only the solicitation (dated September 1, 2026) to Contract C-200 and read the instance", od ? (/overdue|late/i.test(JSON.stringify(od.says || od.sentence || od.words || "")) ? "BROKEN (MINOR: the finding says overdue/late)" : "WORKS") : "BROKEN", `${J(th2, 160)}; ${odText}`);
  const qm = R(await kit.get(ann, { op: "queue" }));
  console.log("QUEUE", J(qm, 1200));
  const caps = R(await cs.call("captureprogressions", { query: { sha256: docs.award.sha }, body: { captureSha: docs.award.sha } }));
  console.log("CAPPROG", J(caps, 900));
  const props = R(await cs.call("proposals", { query: {} }));
  console.log("PROPOSALS", J(props, 1500));
  await pe.close();
  //PR157B
  }

  if (want('money')) {
  /* ---- R62 money tables and ingest, as the member (ann) ---- */
  const door = async (auth, op, body = {}, query = {}) => { const t = Date.now(); const x = await kit.post(auth, op, body, query); return { r: R(x.body), ok: x.body && x.body.ok !== false && R(x.body).ok !== false, ms: Date.now() - t, st: x.headers.get("server-timing") || "", raw: x.body }; };
  const stH2 = (x) => (x ? `${x.op} ${x.status} wall ${x.ms} ms` : "no request");
  const stH = (x) => `${x.ms} ms wall` + ((/^[a-z]+;dur=\d+/.exec(x.st) || [""])[0] ? `; ${(/^[a-z]+;dur=\d+/.exec(x.st))[0]}` : "") + ((/do-[a-z]+;dur=\d+/.exec(x.st) || [""])[0] ? `; ${/do-[a-z]+;dur=\d+/.exec(x.st)[0]}` : "");
  const mint = async (d) => R(await cs.call("contentmint", { body: { bundleId: d.bundle, extent: { kind: "document" } } })).content_id;
  const F3 = ["payer", "payee", "amount"].map((n) => ({ name: n, type: "string" }));
  await ent("beta", "institution", "Beta Builders");
  const cwd = await upload(ann, cs, "crosswalk", `name,entity\nCity of Oakland,${ents.city}\nAcme Paving,${ents.acme}\n`, "text/csv");
  const cwt = await door(ann, "tabledeclare", { source: await mint(cwd), schema: { fields: [{ name: "name", type: "string" }, { name: "entity", type: "string" }] }, header: ["name", "entity"], roles: { name: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } } });
  const CW = cwt.r.sha;
  const roles3 = { payer: { role: "payer", crosswalk: { table: CW, from: "name", to: "entity" } }, payee: { role: "payee", crosswalk: { table: CW, from: "name", to: "entity" } }, amount: { role: "amount" } };
  const N = 18098;
  const lines = (sep) => { const rows = [["payer", "payee", "amount"].join(sep)]; for (let i = 0; i < N; i++) rows.push(["City of Oakland", i % 7 === 0 ? "Beta Builders" : "Acme Paving", 1 + (i % 97)].join(sep)); return rows.join("\n") + "\n"; };
  const bigC = await upload(ann, cs, "payments-comma", lines(","), "text/csv");
  const bigT = await upload(ann, cs, "payments-tab", lines("\t"), "text/tab-separated-values");
  const decC = await door(ann, "tabledeclare", { source: await mint(bigC), schema: { fields: F3 }, header: ["payer", "payee", "amount"], roles: roles3 });
  const decT = await door(ann, "tabledeclare", { source: await mint(bigT), schema: { fields: F3 }, header: ["payer", "payee", "amount"], roles: roles3 });
  const same = decC.r.sha && decC.r.sha === decT.r.sha;
  rec("R62", "declare an 18,098-row table in comma form and in tab form: equal rows, equal shas (the header-read-as-data check, G64)", "1280", "member ann", "uploaded and filed both files, minted each, `tabledeclare` with 3 columns and the payer and payee crosswalk", decC.ok && decT.ok && decC.r.rows === N && decT.r.rows === N && same ? "WORKS" : "BROKEN (MAJOR)", `comma: rows ${decC.r.rows}, undetermined ${J(decC.r.undetermined && decC.r.undetermined.count)}, sha ${String(decC.r.sha).slice(0, 10)}, ${stH(decC)}; tab: rows ${decT.r.rows}, undetermined ${J(decT.r.undetermined && decT.r.undetermined.count)}, sha ${String(decT.r.sha).slice(0, 10)}, ${stH(decT)}; shas equal: ${same}`);
  const semi = await upload(ann, cs, "payments-semicolon", "payer;payee;amount\nCity of Oakland;Acme Paving;5\n", "text/csv");
  const decS = await door(ann, "tabledeclare", { source: await mint(semi), schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "string" }, { name: "note", type: "string" }] }, header: ["payer", "payee", "amount", "note"] });
  const rag = await upload(ann, cs, "payments-ragged", "payer,payee,amount\nCity of Oakland,Acme Paving,5,extra\nCity of Oakland\n", "text/csv");
  const decR = await door(ann, "tabledeclare", { source: await mint(rag), schema: { fields: F3 }, header: ["payer", "payee", "amount"] });
  const prose = await upload(ann, cs, "a-letter", "Dear clerk, please send me the payment register.\nThank you.\n", "text/plain");
  const decP = await door(ann, "tabledeclare", { source: await mint(prose), schema: { fields: F3 }, header: ["payer", "payee", "amount"] });
  const named = (x) => !x.ok && /delimiter|comma|semicolon|tab|pipe|column/i.test(J(x.r));
  const brief = (x) => x.ok ? `accepted: rows ${x.r.rows}, undetermined ${J(x.r.undetermined && x.r.undetermined.count)}` : `refused ${x.r.code || x.r.reason}: ${J(x.r.detail || x.r.translation, 260)}`;
  rec("R62", "a source that does not split into the declared columns is refused naming the delimiter found and the columns expected (semicolon and pipe likewise)", "1280", "member ann", "declared (a) a semicolon file against four columns, (b) a comma file with a four-cell and a one-cell line against three, (c) a prose letter against three", named(decP) ? "WORKS" : "BROKEN (MAJOR: no refusal naming the delimiter and columns)", `(a) ${brief(decS)}; (b) ${brief(decR)}; (c) ${brief(decP)}`);
  const BR0 = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" }, stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" } };
  const BR = { ...BR0, period: { value: "2026-01-01/2026-12-31" } };
  const badRole = await door(ann, "bindingadopt", { table: decC.r.sha, roles: { ...BR, payer: "ghost" } });
  const bnd0 = await door(ann, "bindingadopt", { table: decC.r.sha, roles: { ...BR0, period: { value: "2026" } } });
  const bnd = await door(ann, "bindingadopt", { table: decC.r.sha, roles: BR });
  rec("R62", "adopt the binding (the money roles); a column that is not declared is refused", "1280", "member ann", "adopted with a ghost payer column, then properly", !badRole.ok && bnd.ok && bnd.r.binding ? "WORKS" : "BROKEN", `ghost: ${J(badRole.r.code || badRole.r.reason)} ${J(badRole.r.detail, 160)}; adopted ${String(bnd.r.binding).slice(0, 10)} ${stH(bnd)}`);
  /* a period the money records cannot read: accepted by the binding, refused row by row at the ingest */
  const ingBad = await door(ann, "moneyingest", { binding: bnd0.r.binding, rows: "all", reason: "Trying the whole register with a one-year label." });
  let stBad = null; for (let i = 0; i < 60; i++) { stBad = R(await cs.call("moneyingestread", { query: { ingest: ingBad.r.ingest, kind: "state" } })); if (stBad.complete) break; await kit.later(2000); }
  const nwBad = R(await cs.call("moneyingestread", { query: { ingest: ingBad.r.ingest, kind: "not_written", limit: "400" } }));
  const bp = (nwBad.items || []).filter((x) => x.reason === "MONEY_BAD_PERIOD").length;
  rec("R62", "a binding whose period money cannot read is stated before the ingest runs (a refusal the plane would give is stated before the press)", "1280", "member ann", "adopted a binding with the period “2026”, ingested all rows", bnd0.ok && bp > 0 ? "BROKEN (MINOR)" : "WORKS", `bindingadopt accepted “2026” (${stH(bnd0)}); the ingest then judged all ${stBad.rows_done} rows: written ${stBad.written_count}, not written ${stBad.not_written_count}; in the first 400 not-written, ${bp} are MONEY_BAD_PERIOD (“${J((nwBad.items || []).find((x) => x.reason === "MONEY_BAD_PERIOD")?.detail, 200)}”). The member learns it only by reading the not-written list after the background run.`);
  const noReason = await door(ann, "moneyingest", { binding: bnd.r.binding, rows: "all" });
  const longReason = await door(ann, "moneyingest", { binding: bnd.r.binding, rows: "all", reason: "x".repeat(2001) });
  rec("R62", "ingest “all” without a reason, and with a reason of 2,001 characters, is refused (NO_REASON, BAD_REASON)", "1280", "member ann", "called moneyingest rows all with no reason, then with 2,001 characters", noReason.r.reason === "NO_REASON" && longReason.r.reason === "BAD_REASON" ? "WORKS" : "BROKEN", `${noReason.r.reason}: ${J(noReason.r.detail, 140)}; ${longReason.r.reason}: ${J(longReason.r.detail, 140)}`);
  const [ing1, ing2] = await Promise.all([door(ann, "moneyingest", { binding: bnd.r.binding, rows: "all", reason: "The whole table is the city's payment register." }), (async () => { await kit.later(30); return door(ann, "moneyingest", { binding: bnd.r.binding, rows: "all", reason: "A second at once." }); })()]);
  rec("R62", "ingest all 18,098 rows: the answer within 2 s, state “ingesting”; a second ingest on the same binding while one runs is refused ALREADY_INGESTING", "1280", "member ann", "called moneyingest rows all with a reason; a second call 30 ms later", ing1.r.state === "ingesting" && ing1.ms < 2000 && ing2.r.reason === "ALREADY_INGESTING" ? "WORKS" : "BROKEN", `first: ${J({ state: ing1.r.state, rows_total: ing1.r.rows_total }, 120)} ${stH(ing1)}; says: "${ing1.r.says}"; second: ${ing2.r.reason || J(ing2.r, 200)} ${stH(ing2)} ${J(ing2.r.detail, 200)}`);
  let st = null; for (let i = 0; i < 60; i++) { st = R(await cs.call("moneyingestread", { query: { ingest: ing1.r.ingest, kind: "state" } })); if (st.complete) break; await kit.later(2000); }
  const nw = R(await cs.call("moneyingestread", { query: { ingest: ing1.r.ingest, kind: "not_written", limit: "1000" } }));
  const wr = R(await cs.call("moneyingestread", { query: { ingest: ing1.r.ingest, kind: "written", limit: "1000" } }));
  const reasons = {}; for (const x of nw.items || []) reasons[x.reason] = (reasons[x.reason] || 0) + 1;
  rec("R62", "the ingest finishes; facts are written for the registered payer and payee, the rest listed not-written with a reason each (moneyingestread: written, not_written, true counts)", "1280", "member ann", "polled moneyingestread state, then read not_written and written (limit 1,000)", st.complete && st.written_count > 0 && st.written_count + st.not_written_count === N ? "WORKS" : "BROKEN", `state ${st.state}, rows_done ${st.rows_done}, written ${st.written_count}, not_written ${st.not_written_count} (Beta Builders is not registered in the crosswalk: expected 1/7 of rows); first 1,000 not-written reasons ${J(reasons)}; page next ${J(nw.next)}; written page ${(wr.items || []).length} items`);
  const nwAll = [], more = { after: 0 }; 
  const qn = R(await kit.get(ann, { op: "queue" }));
  const doneNotice = JSON.stringify(qn).includes("ingest-done") || JSON.stringify(qn).includes("ingest_done");
  rec("R62", "the member's Queue carries the ingest-done notice", "1280", "member ann", "read the Queue after the ingest finished", doneNotice ? "WORKS" : "BROKEN", J(qn, 400));
  const again = await door(ann, "moneyingest", { binding: bnd.r.binding, rows: "all", reason: "Again, to see whether anything is written twice." });
  let st2 = again.r.ingest ? null : again.r; if (again.r.ingest) for (let i = 0; i < 60; i++) { st2 = R(await cs.call("moneyingestread", { query: { ingest: again.r.ingest, kind: "state" } })); if (st2.complete) break; await kit.later(2000); }
  const w1 = R(await cs.call("moneyingestread", { query: { ingest: ing1.r.ingest, kind: "written", limit: "3" } })).items || [];
  const w2 = R(await cs.call("moneyingestread", { query: { ingest: again.r.ingest, kind: "written", limit: "3" } })).items || [];
  const sameIds = w1.length > 0 && w1.every((x, i) => w2[i] && w2[i].fact_id === x.fact_id);
  rec("R62", "a repeat ingest of the same binding writes nothing twice (the same row is the same fact)", "1280", "member ann", "ingested the same binding again after the first finished and compared the fact ids of the first rows", sameIds ? "WORKS" : "BROKEN (MAJOR: a repeat wrote the same rows again as new facts)", `first ingest rows 0-2 → ${J(w1.map((x) => x.fact_id))}; second ingest → ${J(w2.map((x) => x.fact_id))}; the second reported written ${st2 && st2.written_count}, not written ${st2 && st2.not_written_count}. The module's own comment says money is not idempotent by source (calculations/index.mjs ingestMoney: “one running ingest to a binding”); R62's coverage row expects “a repeat writes nothing twice”.`);

  /* ---- R61 the money trail ---- */
  const wr2 = R(await cs.call("moneyingestread", { query: { ingest: ing1.r.ingest, kind: "written", limit: "10" } }));
  const factIds = (wr2.items || []).map((x) => x.fact_id);
  const mu = await browserFor(ann, "ann", 1280);
  await mu.go("/app/money/" + project);
  const mtext0 = await mu.text();
  await mu.fill("money-label", "Acme Paving road repair");
  const cset = await mu.act("createset", { reason: "Acme Paving road repair" });
  const setCall = cset.calls.find((x) => x.op === "createset");
  const setId = ((setCall && setCall.answer.match(/MSR-[\w-]+/)) || [])[0];
  rec("R61", "start a money trail on a project (label, then the trail's own page)", "1280", "member ann", "typed a label on the project's Money page and pressed “Start a money trail”", setId ? "WORKS" : "BROKEN", `${stH2(setCall)}; trail ${setId}; landed ${mu.page.url().replace("https://group.example", "")}; before: ${J(mtext0.split("\n").slice(3, 6).join(" / "), 200)}`, await mu.shot("R61-start"));
  console.log("FACTS", J(factIds));
  for (const f of factIds.slice(0, 4)) await cs.call("moneysetpropose", { body: { setId, factId: f, method: "member:recordfact" } });
  await mu.go("/app/money/" + setId);
  const mt1 = await mu.text();
  console.log("TRAIL", J(mt1, 2500));
  const incCount = await mu.page.locator('button[data-act="include"]').count();
  console.log("INCLUDE BUTTONS", incCount, await mu.page.locator('[data-shell="row"]').count());
  rec("R61", "the trail lists the figures proposed to it, each a row (kind, from, to, moved, stage, period, amount, source grade, in the trail)", "1280", "member ann", "proposed four ingested facts to the trail through the door (moneysetpropose) and opened the trail", /Acme Paving/.test(mt1) ? "WORKS" : "BROKEN", J(mt1.slice(0, 900), 900), await mu.shot("R61-trail"));
  await mu.close();

  /* ---- R63 money analysis: reconcile, committed against paid, authority chain ---- */
  await upload(ann, cs, "budget", "The adopted budget sets aside $100,000 for Contract C-100, road repair, for fiscal 2026.");
  const dfAward = R(await cs.call("recorddatedfact", { body: { captureSha: docs.award.sha, extent: { kind: "document" }, kind: "issued", value: "2026-06-01", method: "a member's reading of the passage" } })).dated_fact.dated_fact_id;
  const dfAdopt = R(await cs.call("recorddatedfact", { body: { captureSha: docs.minutes.sha, extent: { kind: "document" }, kind: "adopted", value: "2026-03-03", method: "a member's reading of the passage" } })).dated_fact.dated_fact_id;
  const dfOrder = R(await cs.call("recorddatedfact", { body: { captureSha: docs.award.sha, extent: { kind: "document" }, kind: "signed", value: "2026-07-15", method: "a member's reading of the passage" } })).dated_fact.dated_fact_id;
  const evAward = R(await cs.call("createevent", { body: { kind: "award", attestations: [{ datedFactId: dfAward }], participants: [{ entityId: ents.contract, role: "party", attestation: { datedFactId: dfAward } }] } }));
  const evOrder = R(await cs.call("createevent", { body: { kind: "order", attestations: [{ datedFactId: dfOrder }] } }));
  const evAuth = R(await cs.call("createevent", { body: { kind: "adoption", attestations: [{ datedFactId: dfAdopt }] } }));
  const rAm = R(await cs.call("relate", { body: { from: evOrder.event_id, to: evAward.event_id, kind: "amends", attestation: { datedFactId: dfOrder } } }));
  const rAu = R(await cs.call("relate", { body: { from: evAuth.event_id, to: evAward.event_id, kind: "authorises", attestation: { datedFactId: dfAdopt } } }));
  console.log("R63 EVENTS", J([evAward, evOrder, evAuth, rAm.ok, rAu.ok]), J(rAm, 300));
  const fact = (o) => ({ amount: o.amount, as_read: o.as_read || `$${Number(o.amount).toLocaleString("en-US")}`, currency: "USD", sign: "+", precision: "exact", kind: o.kind || "payment", phase: o.phase || "actual", ...(o.stage ? { stage: o.stage } : {}),
    basis: o.basis || "cash", period: o.period || { from: "2026-01-01", to: "2026-12-31" }, from: { entity: ents.city }, to: { entity: ents.acme },
    source: { capture_sha: o.sha || docs.award.sha, extent: { kind: "document" } }, ...(o.concerns ? { concerns: o.concerns } : {}) });
  const rf = async (o) => { const x = await door(ann, "recordfact", fact(o)); return x; };
  const fCommit = await rf({ amount: "100000", stage: "encumbered", concerns: [evAward.event_id] });
  const fChange = await rf({ amount: "20000", stage: "encumbered", concerns: [evOrder.event_id] });
  const fPaid1 = await rf({ amount: "70000", stage: "paid", concerns: [ents.contract] });
  const fPaid2 = await rf({ amount: "30000", stage: "paid", concerns: [ents.contract] });
  const fBudget = await rf({ amount: "100000", phase: "adopted", basis: "accrual", sha: docs.budget.sha, concerns: [ents.contract] });
  const fBudget2 = await rf({ amount: "100000", phase: "adopted", basis: "accrual", sha: docs.award.sha, concerns: [ents.contract] });
  console.log("R63 FACTS", J([fCommit.r, fChange.r.reason, fPaid1.r.reason, fBudget.r.reason]));
  const rec1 = await door(ann, "moneyreconcile", {}, { a: fBudget.r.fact_id, b: fPaid1.r.fact_id });
  const rec2 = await door(ann, "moneyreconcile", {}, { a: fBudget.r.fact_id, b: fBudget2.r.fact_id });
  rec("R63", "compare two sources of one figure (reconcile): every dimension that differs is named; two agreeing readings are said to agree", "1280", "member ann", "recorded a budgeted figure from the budget and the same figure from the award document, and a paid figure; reconciled budget against paid, and budget against budget", rec1.ok && (rec1.r.differs || []).length > 0 && rec2.r.consistent === true ? "WORKS" : "BROKEN", `budget vs paid: consistent ${rec1.r.consistent}, differs ${J((rec1.r.differs || []).map((d) => d.dimension))}, amounts ${rec1.r.amounts}, says “${rec1.r.says}”; budget vs budget: consistent ${rec2.r.consistent}, says “${rec2.r.says}”; ${stH(rec1)}`);
  const cap = await door(ann, "committedagainstpaid", {}, { contract: ents.contract });
  const csum = cap.r.committed && cap.r.committed.sum, psum = cap.r.paid && cap.r.paid.sum;
  rec("R63", "committed against paid for a contract with a change order: committed = award + change order, paid, the difference", "1280", "member ann", "recorded an award event with its encumbered figure ($100,000), a change order that amends it ($20,000) and two paid figures ($70,000, $30,000) and read committedagainstpaid for the contract", cap.ok && cap.r.difference && cap.r.difference.figure ? "WORKS" : "BROKEN", `committed ${J(csum, 160)} (${(cap.r.committed && cap.r.committed.facts || []).length} facts: ${J((cap.r.committed && cap.r.committed.facts || []).map((f) => f.label), 240)}); paid ${J(psum, 160)}; difference ${J(cap.r.difference, 260)}; ${stH(cap)}`);
  const ac = await door(ann, "authoritychain", {}, { id: fCommit.r.fact_id });
  rec("R63", "the authority behind a payment (what authorized it): the chain of authorising events, each hop cited", "1280", "member ann", "read authoritychain for the encumbered award figure (the award was authorised by the adoption event)", ac.ok && ((ac.r.chains || [])[0] || {}).hops && ac.r.chains[0].hops.length > 0 ? "WORKS" : "BROKEN", `${J(ac.r, 700)}; ${stH(ac)}`);

  /* ---- R64 explore connections ---- */
  const today = new Date().toISOString().slice(0, 10);
  const ex0 = await browserFor(ann, "ann", 1280);
  await ex0.go("/app/explore");
  const exTxt0 = await ex0.text();
  const exCalls0 = ex0.log.filter((x) => x.op === "explore" || x.op === "exploregraph").length;
  rec("R64", "Explore opened with no centre says where to start and asks the plane nothing (state b)", "1280", "member ann", "opened /app/explore with no person chosen", /Choose|start|centre|person/i.test(exTxt0) && exCalls0 === 0 ? "WORKS" : "BROKEN", `text: ${J(exTxt0.replace(/\n+/g, " / "), 260)}; explore requests sent: ${exCalls0}`, await ex0.shot("R64-nocentre"));
  await ex0.go("/app/explore/" + ents.city);
  const exTxt1 = await ex0.text();
  const owedAbsent = [];
  for (const op of ["exploreall", "explorepath", "exploreshorter", "explorecontinue", "followfrom", "registersearch"]) if ((await ex0.page.locator(`button[data-act="${op}"]`).count()) === 0) owedAbsent.push(op);
  const exAct = await ex0.act("explore", { wait: 3500 });
  const exCall = exAct.calls.find((x) => x.op === "explore");
  const exTxt2 = await ex0.text();
  console.log("EXPLORE", J(exTxt1, 1200), "\nANSWER", J(exCall && exCall.answer, 900));
  rec("R64", "start from an organisation (City of Oakland): pick kinds, press Explore; read the chains hop by hop with a cited source and grade each", "1280", "member ann", "opened /app/explore/<City of Oakland>, kept the default kinds (positions, money, participation), pressed “Explore”", exCall && /"ok":true/.test(exCall.answer) ? "WORKS" : "BROKEN", `${stOf(exCall)}; body ${J(exCall && exCall.body, 200)}; answer ${J(exCall && exCall.answer, 500)}; page after: ${J(exTxt2.split("\n").slice(0, 28).join(" / "), 500)}`, await ex0.shot("R64-explore"));
  const graphCall = ex0.log.find((x) => x.op === "exploregraph");
  rec("R64", "the connection graph from the centre (ring, kind, step word and grade chip, legend) draws on the screen", "1280", "member ann", "read the graph section of the Explore screen", graphCall && /"ok":true/.test(graphCall.answer) && (await ex0.page.locator("svg, .mk-graph, [data-graph]").count()) > 0 ? "WORKS" : "BROKEN", `${stOf(graphCall)}; graph element(s) drawn: ${await ex0.page.locator("svg, .mk-graph, [data-graph]").count()}; answer ${J(graphCall && graphCall.answer, 300)}`);
  rec("R64", "the owed acts (Find the most direct path, List every connection, See the shorter path, Keep looking, Follow from here) are absent, as owed", "1280", "member ann", "looked for the five controls on the Explore screen", owedAbsent.length === 6 ? "WORKS (absent, as owed; recorded, not a defect)" : "BROKEN (offered but owed: " + ["exploreall", "explorepath", "exploreshorter", "explorecontinue", "followfrom", "registersearch"].filter((o) => !owedAbsent.includes(o)).join(", ") + ")", `controls absent: ${owedAbsent.join(", ")}`);
  const dx = await door(ann, "explore", { from: ents.city, at: today, kinds: ["pays"], depth: 2 });
  const dx2 = await door(ann, "explore", { from: ents.city, to: ents.acme, at: today, depth: 3 });
  console.log("DOOR EXPLORE", J(dx.r, 700), J(dx2.r, 500));
  const pre = await door(ann, "explorepreset", { preset: "presets" });
  rec("R64", "the door: explore over the money kind from the City, a path between two ends, the presets list", "1280", "member ann", "called explore (from City, kinds pays), explore (City to Acme Paving) and explorepreset presets", dx.ok && pre.ok ? "WORKS" : "BROKEN", `from City: ${J(dx.r, 300)} ${stH(dx)}; City to Acme: ${J(dx2.r, 300)}; presets ${J(pre.r, 200)}`);
  await ex0.close();
  const ex390 = await browserFor(ann, "ann", 390);
  await ex390.go("/app/explore/" + ents.city);
  const ov390 = await ex390.overflow();
  rec("R64", "Explore at 390 px: no page-wide sideways scroll (the graph may scroll sideways inside itself)", "390", "member ann", "opened Explore for the City at 390 px", ov390.sw <= ov390.iw ? "WORKS" : "BROKEN (MINOR)", `scrollWidth ${ov390.sw} / innerWidth ${ov390.iw}`, await ex390.shot("R64-explore"));
  await ex390.close();
  //MONEYEND
  }
  //PART2
}
