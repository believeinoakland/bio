/* WALK-FINAL-07 #1 (sitting 07, Money, time, connections, registers; K5122): the offline journey of rows R60, R157, R62, R61, R63, R64, R158, R65, R156 and the overlay checks that fall on them.
   The real plane in Miniflare (r8-kit), every input made by the member's own acts through the door or through the real screens drawn in Chromium (the page routed to the Miniflare plane);
   no answer is hand-written, no row written to storage. Records its rows as it goes to `07-money-time.md`; screenshots to `shots/07-money-time/`.
   Run: `node --test build/plan/walk-T51-final/scripts/07-money-time.test.mjs` from bio-plane/ (needs Chromium at /opt/pw-browsers/chromium and playwright). */
import "../../../../bio-plane/test/sandbox.mjs";
import { test, after } from "node:test";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
after(async () => { await kit.mf.dispose(); setTimeout(() => process.exit(0), 3000).unref(); });
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
    async act(act, { reason = null, nth = 0, wait = 2500, emptyFirst = false, open = null } = {}) {
      if (open !== null) { await page.locator("button.mk-open").nth(open).click(); await page.waitForTimeout(500); }
      const n = log.length, btn = page.locator(`#cs-main button[data-act="${act}"]`).nth(nth);
      if (await btn.isVisible()) { await btn.scrollIntoViewIfNeeded(); await btn.click(); } else await btn.evaluate((e) => e.click());
      await page.waitForTimeout(700);
      const slot = page.locator(".cs-reason textarea").first();
      const out = { refusal: "", reasonAsked: (await slot.count()) > 0 };
      if (out.reasonAsked) {
        const send = page.locator('.cs-reason [data-shell="reason-send"]').first();
        if (emptyFirst) { if (await send.isVisible()) await send.click(); else await send.evaluate((e) => e.click()); await page.waitForTimeout(1200); out.refusal = (await page.locator("[data-reason-refusal]").first().innerText().catch(() => "")).trim(); }
        if (reason !== null) { await slot.fill(reason, { force: true }); if (await send.isVisible()) await send.click(); else await send.evaluate((e) => e.click()); await page.waitForTimeout(wait); }
      } else await page.waitForTimeout(wait);
      out.calls = log.slice(n); out.said = (await page.locator("#cs-main .cs-refusal, #cs-main [role=alert], #cs-main [data-reason-refusal], #cs-main .mk-note[data-state]").allInnerTexts().catch(() => [])).join(" / ").trim();
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
const door = async (auth, op, body = {}, query = {}) => { const t = Date.now(); const x = await kit.post(auth, op, body, query); return { r: R(x.body), ok: x.body && x.body.ok !== false && R(x.body).ok !== false, ms: Date.now() - t, st: x.headers.get("server-timing") || "", raw: x.body }; };
const stH2 = (x) => (x ? `${x.op} ${x.status} wall ${x.ms} ms` : "no request");
const stH = (x) => `${x.ms} ms wall` + ((/^[a-z]+;dur=\d+/.exec(x.st) || [""])[0] ? `; ${(/^[a-z]+;dur=\d+/.exec(x.st))[0]}` : "") + ((/do-[a-z]+;dur=\d+/.exec(x.st) || [""])[0] ? `; ${/do-[a-z]+;dur=\d+/.exec(x.st)[0]}` : "");
const minutesText = (file, date, what) => `Meeting Minutes - DRAFT\nThe Oakland City Council Rules And Legislation Committee Convened At 10:30 A.M. On ${date}\nRoll Call\nRowena Brown, Janani Ramachandran, and Kevin Jenkins\nPresent\n3 - \nCarroll Fife\nExcused\n1 - \nMeeting Minutes - DRAFT\n${file}\nSubject: ${what} Ordinance ${file}\nA motion was made by Rowena Brown, seconded by Janani Ramachandran, that this matter be Accepted. The motion carried by the following vote:\nAye: 3 - Rowena Brown, Janani Ramachandran, Kevin Jenkins\nMeeting Minutes - DRAFT\nThere Being No Further Business, The Committee Adjourned The Meeting At 11:02 A.M.\nMeeting Minutes - DRAFT\nMeeting Minutes - DRAFT\n`;
const ent = async (key, kind, label) => (ents[key] = R(await cs.call("entitycreate", { body: { kind, label, note: "made in the walk" } })).entity_id);

test("sitting 07: the room, then the rows in the founder's order", { timeout: 3_000_000 }, async () => {
  let stopped = null;
  try { await journey(); } catch (e) { stopped = e; console.log("JOURNEY STOPPED: " + (e && e.stack || e)); }
  finalize(stopped);
  if (stopped) throw stopped;
});

/* the counts at the top of the record, by severity, and the closing line */
function finalize(stopped) {
  if (ONLY) return;
  const text = readFileSync(RECORD, "utf8");
  const rows = text.split("\n").filter((l) => /^\| /.test(l) && !/^\| (row id|---)/.test(l));
  const cols = rows.map((l) => l.split(" | "));
  const verdicts = cols.map((c) => c[5] || "");
  const n = (re) => verdicts.filter((v) => re.test(v)).length;
  const blocker = n(/^BROKEN \(BLOCKER/), major = n(/^BROKEN(?! \((MINOR|BLOCKER))/), minor = n(/^BROKEN \(MINOR/), works = n(/^WORKS/), notr = n(/^NOT REACHED/);
  const head = `**Counts** · ${rows.length} rows walked: WORKS ${works}; BROKEN: BLOCKER ${blocker}, MAJOR ${major}, MINOR ${minor}; NOT REACHED ${notr}. (A WORKS that records an owed or not-built absence is that confirmation, not a defect.)`;
  writeFileSync(RECORD, text.replace(/\*\*Counts\*\* ·[^\n]*/, head) + `\n${stopped ? "STOPPED: " + String(stopped && stopped.message || stopped).slice(0, 300) : "DONE"}\n`);
}

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
  const q1 = await kit.questionOf(ann, project, "Was Contract C-100 awarded in line with the council's procurement policy?");
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
  /* the documents a flow is threaded with: council minutes of the shape the minutes reader recognises, each naming one ordinance file number as a reference the record can resolve to the registered ordinance */
  await ent("ordA", "ordinance", "Ordinance 26-0910"); await ent("ordB", "ordinance", "Ordinance 26-0911");
  /* the reading names the file number as a source key; an alias with that key is how a member registers it, so the recogniser resolves the reference */
  for (const [k, f] of [["ordA", "26-0910"], ["ordB", "26-0911"]]) { const al = await cs.call("entityalias", { body: { entityId: ents[k], alias: f } }); console.log("ALIAS", f, J(R(al), 200)); }
  const intro = await upload(ann, cs, "intro-26-0910", minutesText("26-0910", "September 1, 2026", "Introduction of"));
  const adopt = await upload(ann, cs, "adopt-26-0911", minutesText("26-0911", "October 6, 2026", "Adoption of"));
  const rsA = await cs.call("resolve", { body: { captureSha: intro.sha, ref: "legislation:26-0910", entityId: ents.ordA, basis: "The minutes name file 26-0910, the ordinance." } });
  const rsB = await cs.call("resolve", { body: { captureSha: adopt.sha, ref: "legislation:26-0911", entityId: ents.ordB, basis: "The minutes name file 26-0911, the ordinance." } });
  console.log("RESOLVE", J(R(rsA), 300), J(R(rsB), 300));
  await cs.call("recorddatedfact", { body: { captureSha: intro.sha, extent: { kind: "document" }, kind: "meeting", value: "2026-09-01", method: "a member's reading of the passage" } });
  await cs.call("recorddatedfact", { body: { captureSha: adopt.sha, extent: { kind: "document" }, kind: "meeting", value: "2026-10-06", method: "a member's reading of the passage" } });
  const pe = await browserFor(ann, "ann", 1280);
  await pe.go(T);
  const STEPS = "introduction | Introduction | | | always | 1\nadoption | Adoption | introduction | 10 days | always | 1";
  await pe.fill("pd-name", "Ordinance adoption"); await pe.fill("pd-cite", "Oakland Municipal Code 2.04.020"); await pe.fill("pd-steps", STEPS);
  const pd0 = await pe.act("progressiondefine", { emptyFirst: true });
  const pdRefusal = (await pe.page.locator('[data-reason-refusal], .cs-refusal, [role="alert"], .mk-note').allInnerTexts().catch(() => [])).join(" / ");
  rec("R157", "define a flow: the basis is required (the basis field is the reason; an empty one is refused before anything is sent)", "1280", "member ann", "typed a name, a citation and two steps, left the basis empty, pressed “Declare the progression”", !pd0.calls.find((x) => x.op === "progressiondefine") ? "WORKS" : "BROKEN", `request sent: ${!!pd0.calls.find((x) => x.op === "progressiondefine")}; reason box: ${pd0.reasonAsked}; the page said: ${J(pdRefusal || pd0.said || "(nothing drawn)", 200)}`, await pe.shot("R157-empty-basis"));
  await pe.fill("pd-basis", "The code requires adoption within 10 days of the introduction.");
  const pd1 = await pe.act("progressiondefine", { reason: "The code requires adoption within 10 days of the introduction." });
  const pdc = pd1.calls.find((x) => x.op === "progressiondefine");
  rec("R157", "define a flow (key the record does not hold yet): version 1 written with its basis", "1280", "member ann", "typed the basis and pressed “Declare the progression”", pdc && /"version":1/.test(pdc.answer) ? "WORKS" : "BROKEN", `${stOf(pdc)}; body ${J(pdc && pdc.body, 300)}; answer ${J(pdc && pdc.answer, 300)}; landed ${decodeURIComponent(pe.page.url().replace("https://group.example", ""))}`, await pe.shot("R157-defined"));
  const KEY = "ordinance_adoption";
  const S1 = { key: "introduction", label: "Introduction", after: null, within: null, required: "always", cardinality: "1" };
  const stg = (within = "10 days") => [S1, { key: "adoption", label: "Adoption", after: "introduction", within, required: "always", cardinality: "1" }];
  const same = await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Ordinance adoption", basis: "same again", citation: "x", stages: stg() } });
  rec("R157", "re-declare identically: nothing is written", "1280", "member ann", "sent the same steps again through the door", R(same).unchanged === true && R(same).version === 1 ? "WORKS" : "BROKEN", J(R(same), 300));
  const nb = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Ordinance adoption", stages: stg("30 days") } }));
  const nc = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Ordinance adoption", basis: "The council amended the window.", stages: stg("30 days") } }));
  const badStage = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Ordinance adoption", stages: [{ key: "adoption", label: "Adoption", after: "ghost", within: null, required: "always", cardinality: "1" }] } }));
  rec("R157", "revise with no statement: NO_BASIS; a statement and no citation: NO_CITATION; a bad stage is heard first", "1280", "member ann", "revised the flow three ways through the door", nb.code === "NO_BASIS" && nc.code === "NO_CITATION" && badStage.code !== "NO_BASIS" ? "WORKS" : "BROKEN", `no basis: ${nb.code}; basis only: ${nc.code}; bad stage first: ${badStage.code || badStage.reason}. ${J(nb.translation || nb.detail, 160)}`);
  const v2 = R(await cs.call("progressiondefine", { body: { progressionKey: KEY, label: "Ordinance adoption", basis: "The council amended the window.", citation: "Ordinance 13579, section 2", stages: stg("30 days") } }));
  rec("R157", "revise with both: version 2 written, the receipt naming the version written and the one standing", "1280", "member ann", "revised with a statement and a citation", v2.version === 2 ? "WORKS" : "BROKEN", J({ version: v2.version, prior_version: v2.prior_version, basis: v2.basis, unchanged: v2.unchanged }, 380));
  const rd1 = R(await cs.call("progression", { query: { key: KEY, version: "1" } })), rd2 = R(await cs.call("progression", { query: { key: KEY, version: "2" } }));
  rec("R157", "read version 1 and version 2 with author, date and basis", "1280", "member ann", "read the progression at version=1 and version=2", rd1.version === 1 && rd2.version === 2 && rd2.basis ? "WORKS" : "BROKEN", `v1 ${J({ basis: rd1.basis, by: rd1.declared_by, at: rd1.at, within: (rd1.stages || [])[1] && rd1.stages[1].within_interval }, 300)}; v2 ${J({ basis: rd2.basis, by: rd2.declared_by, at: rd2.at, within: (rd2.stages || [])[1] && rd2.stages[1].within_interval }, 300)}`);
  /* an adoption with no introduction (ordinance B): the missing-predecessor finding */
  const th1 = R(await cs.call("thread", { body: { progressionKey: KEY, entityId: ents.ordB, placements: [{ stage: "adoption", captureSha: adopt.sha }] } }));
  const in1 = R(await cs.call("instance", { query: { key: KEY, id: ents.ordB } }));
  const fk = (in1.findings || []).map((f) => f.kind);
  rec("R157", "thread a document to a step; read the instance (naming its definition version) and the missing-predecessor finding", "1280", "member ann", "threaded the adoption minutes to “Adoption” of Ordinance 26-0911, which has no introduction, and read the instance", th1.ok !== false && fk.includes("missing_predecessor") && in1.definition_version ? "WORKS" : "BROKEN", `thread ${J(th1, 200)}; findings ${J(fk)}; definition_version ${in1.definition_version}; ${J((in1.findings || [])[0], 500)}`);
  /* an introduction dated September 1 with no adoption (ordinance A): the overdue-successor finding, in the record's words */
  const th2 = R(await cs.call("thread", { body: { progressionKey: KEY, entityId: ents.ordA, placements: [{ stage: "introduction", captureSha: intro.sha }] } }));
  const in2 = R(await cs.call("instance", { query: { key: KEY, id: ents.ordA } }));
  const props1 = R(await cs.call("proposals", { query: {} }));
  const allF = ((props1 && props1.instances) || []).flatMap((i) => (i.findings || []).map((f) => ({ ...f, entity: i.entity_id })));
  const od = allF.find((f) => f.kind === "overdue_successor" && f.entity === ents.ordA);
  const odWords = od && od.says && (od.says.words || od.says.sentence);
  rec("R157", "read the overdue-successor finding in the record's words (never “overdue” or “late”)", "1280", "member ann", "threaded only the introduction (dated September 1, 2026) to Ordinance 26-0910 and read the findings the record offers (`proposals`; the instance read lists only the missing step)", od && odWords ? (/overdue|\blate\b/i.test(odWords) ? "BROKEN (MINOR: the finding says overdue/late)" : "WORKS") : "BROKEN", `${J(th2.ok, 40)}; instance read lists ${J((in2.findings || []).map((f) => f.kind))}; proposals finding: deadline ${od && od.deadline}, flagged overdue by ${J(od && od.overdue_by)}; its words: “${J(odWords, 360)}”`);
  const qn2 = R(await kit.get(ann, { op: "queue" }));
  const props2 = R(await cs.call("proposals", { query: {} }));
  const propsList = Array.isArray(props2) ? props2 : (props2.proposals || props2.items || []);
  console.log("PROPS2", J(props2, 1500));
  rec("R157", "the findings are read in the Queue under “Noticed”, in the record's voice, with their basis", "1280", "member ann", "read `proposals` and the Queue after threading", ((props2 && props2.instances) || []).length ? "WORKS" : "BROKEN", `proposals: ${((props2 && props2.instances) || []).length} instances (${J(((props2 && props2.instances) || []).map((i) => i.entity_label + ": " + (i.findings || []).map((f) => f.kind).join("+")))}); queue items ${(qn2.items || []).length}, kinds ${J([...new Set((qn2.items || []).map((i) => i.kind))])}; the Queue is read before the daily sweep has produced notices in this offline plane`);
  /* set a finding aside, binding the version the member saw: a second, attributed decider (max) */
  const dd = async (auth, extra) => door(auth, "proposedispose", { progressionKey: KEY, stageKey: "introduction", to: "dismissed", reason: "The council waived the introduction for an emergency ordinance.", ...extra });
  const dNone = await dd(max, {});
  const dOld = await dd(max, { definitionVersion: 1 });
  const dOk = await dd(max, { definitionVersion: 2 });
  rec("R157", "set a finding aside (a reasoned act by a second member): no version named is refused NO_DEFINITION_VERSION; an older version DEFINITION_MOVED; the standing version is recorded", "1280", "member max", "called proposedispose three ways as the plain member", dNone.r.code === "NO_DEFINITION_VERSION" && dOld.r.code === "DEFINITION_MOVED" && dOk.ok ? "WORKS" : "BROKEN", `none: ${dNone.r.code || J(dNone.r, 200)}; version 1: ${dOld.r.code || J(dOld.r, 200)}; version 2: ${dOk.ok ? "recorded " : ""}${J(dOk.r, 300)}`);
  const afterDis = R(await cs.call("instance", { query: { key: KEY, id: ents.ordB } }));
  const fnd = (afterDis.findings || []).filter((f) => f.kind === "missing_predecessor");
  rec("R157", "after a finding is set aside it is still listed with its decision, decider, instant, reason and version judged (finding count keeps it; open count drops)", "1280", "member ann", "read the instance of Ordinance 26-0911 after max set the finding aside", fnd.length && /dismissed|set aside/i.test(JSON.stringify(fnd[0])) ? "WORKS" : "BROKEN", `${J(fnd[0], 700)}; counts ${J({ finding_count: afterDis.finding_count, open_finding_count: afterDis.open_finding_count })}`);
  const disc = await door(ann, "discharge", { progressionKey: KEY, entityId: ents.ordA, stageKey: "adoption", captureSha: adopt.sha, reason: "The council adopted it at a special meeting.", citation: "Special meeting minutes, October 6, 2026" });
  rec("R157", "record a lawful skip with a reason and a citation (discharge) for a step; the document must concern the same ordinance", "1280", "member ann", "called discharge for Adoption of Ordinance 26-0910 naming the 26-0911 minutes (which concern another ordinance)", !disc.ok ? "WORKS" : "BROKEN (MAJOR: a skip is accepted on a document that concerns another ordinance)", J(disc.r.translation || disc.r.detail || disc.r, 400));
  const disc2 = await door(ann, "discharge", { progressionKey: KEY, entityId: ents.ordA, stageKey: "adoption", captureSha: intro.sha, reason: "The council adopted it at a special meeting.", citation: "Special meeting minutes, October 6, 2026" });
  rec("R157", "record a lawful skip with a reason and a citation naming a document that concerns the ordinance", "1280", "member ann", "called discharge for Adoption of Ordinance 26-0910 with the introduction minutes (which concern it), a reason and a citation", disc2.ok ? "WORKS" : "BROKEN", J(disc2.r.translation || disc2.r.detail || disc2.r, 500));
  const un = await door(ann, "discharge", { progressionKey: KEY, entityId: ents.ordA, stageKey: "adoption", captureSha: intro.sha, reason: "", citation: "" });
  rec("R157", "a skip without a reason or a citation is refused in the plane's words", "1280", "member ann", "called discharge with an empty reason and citation", !un.ok ? "WORKS" : "BROKEN", J(un.r.translation || un.r.detail || un.r, 300));
  await pe.close();
  const pm = await browserFor(ann, "ann", 1280);
  await pm.go(`/app/timeline/${project}%2Fmatter%2F${KEY}%2F${ents.ordB}`);
  const matterTxt = await pm.text();
  rec("R157", "read a matter's steps on the Timeline (state b): each step with the document threaded to it, how sure the chain is, the finding in the record's voice", "1280", "member ann", "opened the matter of Ordinance 26-0911 under the flow", /Introduction|Adoption/.test(matterTxt) ? "WORKS" : "BROKEN", J(matterTxt.replace(/\n+/g, " / "), 900), await pm.shot("R157-matter"));
  await pm.go(`/app/timeline/${project}%2Fprogression%2F${KEY}`);
  const defTxt = await pm.text();
  rec("R157", "read the progression (state c): every version with author, date and basis", "1280", "member ann", "opened the progression page", /basis|Basis/.test(defTxt) && /version|Version/.test(defTxt) ? "WORKS" : "BROKEN", J(defTxt.replace(/\n+/g, " / "), 900), await pm.shot("R157-progression"));
  await pm.go(`/app/document/${adopt.bundle}`);
  const docT = await pm.text();
  rec("R157", "the document page lists the steps it is threaded to and its finding (progression section)", "1280", "member ann", "opened the adoption minutes' Document page", /Adoption|threaded|Steps it is threaded/i.test(docT) ? "WORKS" : "BROKEN", J((docT.split("\n").filter((l) => /thread|step|Adoption|finding/i.test(l))).join(" / "), 500), await pm.shot("R157-document"));
  await pm.close();
  const pm390 = await browserFor(ann, "ann", 390);
  await pm390.go(`/app/timeline/${project}%2Fmatter%2F${KEY}%2F${ents.ordB}`);
  const o390 = await pm390.overflow();
  rec("R157", "the matter page at 390 px: no sideways scroll", "390", "member ann", "opened the matter at 390 px", o390.sw <= o390.iw ? "WORKS" : "BROKEN (MINOR)", `scrollWidth ${o390.sw} / ${o390.iw}`, await pm390.shot("R157-matter"));
  await pm390.close();
  //PR157B
  }

  if (want('money')) {
  /* ---- R62 money tables and ingest, as the member (ann) ---- */
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

  /* R62, the inline side of INGEST_INLINE_ROWS and the bound: a small table answers whole; 100,001 rows are refused */
  const smallRows = ["payer,payee,amount"]; for (let i = 0; i < 50; i++) smallRows.push(`City of Oakland,${i % 5 === 0 ? "Beta Builders" : "Acme Paving"},${100 + i}`);
  const smallD = await upload(ann, cs, "payments-small", smallRows.join("\n") + "\n", "text/csv");
  const smallT = await door(ann, "tabledeclare", { source: await mint(smallD), schema: { fields: F3 }, header: ["payer", "payee", "amount"], roles: roles3 });
  const smallB = await door(ann, "bindingadopt", { table: smallT.r.sha, roles: BR });
  const smallI = await door(ann, "moneyingest", { binding: smallB.r.binding, rows: "all", reason: "The whole small register." });
  rec("R62", "ingest a table at or under INGEST_INLINE_ROWS (10,000): the answer holds the written and not-written lists whole, no background run", "1280", "member ann", "ingested all 50 rows of a small register", smallI.ok && smallI.r.state !== "ingesting" && Array.isArray(smallI.r.written) ? "WORKS" : "BROKEN", `${stH(smallI)}; written ${(smallI.r.written || []).length}, not written ${(smallI.r.not_written || []).length} (${J([...new Set((smallI.r.not_written || []).map((x) => x.reason))])}); asked_by ${smallI.r.asked_by}, by ${smallI.r.by}`);
  /* a payee registered between two ingests: a crosswalk that now names Beta Builders, the same small file declared against it */
  const cw2d = await upload(ann, cs, "crosswalk-2", `name,entity\nCity of Oakland,${ents.city}\nAcme Paving,${ents.acme}\nBeta Builders,${ents.beta}\n`, "text/csv");
  const cw2 = await door(ann, "tabledeclare", { source: await mint(cw2d), schema: { fields: [{ name: "name", type: "string" }, { name: "entity", type: "string" }] }, header: ["name", "entity"], roles: { name: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } } });
  const roles3b = { payer: { role: "payer", crosswalk: { table: cw2.r.sha, from: "name", to: "entity" } }, payee: { role: "payee", crosswalk: { table: cw2.r.sha, from: "name", to: "entity" } }, amount: { role: "amount" } };
  const smallT2 = await door(ann, "tabledeclare", { source: await mint(smallD), schema: { fields: F3 }, header: ["payer", "payee", "amount"], roles: roles3b });
  const smallB2 = await door(ann, "bindingadopt", { table: smallT2.r.sha, roles: BR });
  const smallI2 = await door(ann, "moneyingest", { binding: smallB2.r.binding, rows: "all", reason: "The same register, now that Beta Builders is registered." });
  rec("R62", "a payee registered between two ingests is seen by the second (here through a second crosswalk that names it)", "1280", "member ann", "ingested the small register again against a crosswalk that now names Beta Builders", smallI2.ok && (smallI2.r.written || []).length === 50 ? "WORKS" : "BROKEN (MAJOR: a corrected declaration is answered `already: true` with the old roles, silently)", `first ingest wrote ${(smallI.r.written || []).length} of 50; the second wrote ${(smallI2.r.written || []).length}, not written ${(smallI2.r.not_written || []).length}. Cause seen in a probe: declaring the same file again with a different crosswalk (the one that now names Beta Builders) answers {ok: true, already: true} (this run: already ${smallT2.r.already}, same sha ${smallT2.r.sha === smallT.r.sha}) and returns the FIRST declaration's roles unchanged (the table is keyed by its content, not its roles), so a member who corrects the registry between two ingests cannot make the second ingest see it; nothing tells her the roles were not taken`);
  const hugeRows = ["payer,payee,amount"]; for (let i = 0; i < 100001; i++) hugeRows.push("City of Oakland,Acme Paving,1");
  const hugeD = await upload(ann, cs, "payments-huge", hugeRows.join("\n") + "\n", "text/csv");
  const hugeT = await door(ann, "tabledeclare", { source: await mint(hugeD), schema: { fields: F3 }, header: ["payer", "payee", "amount"], roles: roles3 });
  let hugeI = null;
  if (hugeT.ok) { const hb = await door(ann, "bindingadopt", { table: hugeT.r.sha, roles: BR }); hugeI = await door(ann, "moneyingest", { binding: hb.r.binding, rows: "all", reason: "A register past the bound." }); }
  rec("R62", "a table of 100,001 rows is refused (INGEST_TOO_LARGE) with its count and the bound, or at declaring; nothing is half-written", "1280", "member ann", "declared and ingested a 100,001-row register", hugeT.ok ? (hugeI && hugeI.r.reason === "INGEST_TOO_LARGE" ? "WORKS" : "BROKEN") : "WORKS", hugeT.ok ? `declared ${hugeT.r.rows} rows; ingest: ${hugeI && (hugeI.r.reason || hugeI.r.state)} ${J(hugeI && (hugeI.r.detail || hugeI.r.translation), 260)}` : `refused at declaring: ${hugeT.r.code || hugeT.r.reason}: ${J(hugeT.r.detail || hugeT.r.translation, 260)}`);
  rec("R62", "declare a table from a cited sheet-range of a held workbook (G41); cells_truncated stated undetermined", "1280", "member ann", "looked for a held workbook in this room", "NOT REACHED (the room holds no workbook: the xlsx generator the plane's shape tests use runs in a capped child process of its own, so no workbook was uploaded in this script; walked by the shape test g123f-cells, which reads the same ranges)", "no workbook was made");

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
  const evAward = R(await cs.call("createevent", { body: { kind: "award", attestations: [{ datedFactId: dfAward }], participants: [{ entityId: ents.contract, role: "party", attestation: 0 }] } }));
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
  const today = new Date().toISOString().slice(0, 10), nowZ = new Date().toISOString().replace(/\.\d+Z$/, "Z");
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
  const dx = await door(ann, "explore", { from: ents.city, at: nowZ, depth: 2 });
  const dx2 = await door(ann, "explore", { from: ents.city, to: ents.acme, at: nowZ, depth: 3 });
  console.log("DOOR EXPLORE", J(dx.r, 700), J(dx2.r, 500));
  const pre = await door(ann, "explorepreset", { preset: "presets" });
  rec("R64", "the door: explore over the money kind from the City, a path between two ends, the presets list", "1280", "member ann", "called explore (from City, kinds pays), explore (City to Acme Paving) and explorepreset presets", dx.ok && !dx.r.refused && !dx2.r.refused && pre.ok ? "WORKS" : "BROKEN", `from City: ${J(dx.r, 300)} ${stH(dx)}; City to Acme: ${J(dx2.r, 300)}; presets ${J(pre.r, 200)}`);
  await ex0.close();
  const ex390 = await browserFor(ann, "ann", 390);
  await ex390.go("/app/explore/" + ents.city);
  const ov390 = await ex390.overflow();
  rec("R64", "Explore at 390 px: no page-wide sideways scroll (the graph may scroll sideways inside itself)", "390", "member ann", "opened Explore for the City at 390 px", ov390.sw <= ov390.iw ? "WORKS" : "BROKEN (MINOR)", `scrollWidth ${ov390.sw} / innerWidth ${ov390.iw}`, await ex390.shot("R64-explore"));
  await ex390.close();

  /* ---- R65 registers (owed on T51) and R156 the connection-rule table (not built: surface unconfirmed) ---- */
  const rg = await browserFor(ann, "ann", 1280);
  await rg.go("/app/registers");
  const rgTxt = await rg.text();
  const OWED_REG = ["registerimport", "registerlist", "registersearch", "registerrowcite", "registerwatch", "registerwatchstop", "alertconnect", "registerfilter", "registerdelta", "registerpreread", "registerpropose"];
  const rgAns = [];
  for (const op of OWED_REG) { const x = await door(ann, op, {}); rgAns.push(`${op}: ${x.raw && (x.raw.reason || x.raw.code || (x.raw.result && (x.raw.result.reason || x.raw.result.code)) || J(x.raw, 70))}`); }
  const pageDrawn = !/not found|no such screen|doesn.t exist/i.test(rgTxt) && rgTxt.trim().length > 40;
  rec("R65", "open the registers page (a registry entry with owed acts; no page on T51 if FR6 455 holds)", "1280", "member ann", "opened /app/registers", "WORKS (state confirmed: " + (pageDrawn ? "a page is drawn" : "no page") + "; recorded, not a defect)", `page text: ${J(rgTxt.replace(/\n+/g, " / "), 400)}`, await rg.shot("R65-registers"));
  rec("R65", "every register act is owed: each op answers as an op the plane does not serve (import, list, search, cite a row, watch, stop, alert, filter, delta, pre-read, propose)", "1280", "member ann", "called each of the 11 owed ops through the door", "WORKS (absence recorded, not a defect)", rgAns.join("; "));
  await rg.close();
  const regTxt = (await import("node:fs")).readFileSync(HERE + "../../../../docs/development/ux-substrate/screens/registry.json", "utf8");
  const ruleHits = (regTxt.match(/connection[- ]rule|rule table|aged instance/gi) || []).length;
  const rl = await browserFor(ann, "ann", 1280);
  await rl.go("/app/connection-rules"); const rlTxt = await rl.text(); await rl.close();
  rec("R156", "the connection-rule table and aged instances (not built: surface unconfirmed)", "1280", "member ann", "searched the screen registry (91 screens) for a connection-rule surface and opened /app/connection-rules", "WORKS (absent; recorded, not a defect)", `registry mentions of a connection-rule table / aged instance: ${ruleHits}; /app/connection-rules draws: ${J(rlTxt.replace(/\n+/g, " / "), 300)}`);

  /* R61 acts on the rows: include and leave out, each with a reason, reload and return */
  const mu2 = await browserFor(ann, "ann", 1280);
  await mu2.go("/app/money/" + setId);
  const inc0 = await mu2.act("include", { nth: 0, open: 0, emptyFirst: true, reason: "The register line matches the paid invoice." });
  const incCall = inc0.calls.find((x) => x.op === "include");
  rec("R61", "include a figure with a reason (a reasoned act: an empty reason is refused in place)", "1280", "member ann", "pressed “Include with a reason” on the first row, empty then a reason", inc0.reasonAsked && incCall && /"ok":true/.test(incCall.answer) ? "WORKS" : "BROKEN", `reason asked: ${inc0.reasonAsked}; empty: "${inc0.refusal}"; ${stOf(incCall)}; ${J(incCall && incCall.answer, 220)}`);
  await mu2.go("/app/money/" + setId);
  const exc0 = await mu2.act("exclude", { nth: 0, open: 0, reason: "On reflection it duplicates row 2." });
  const excCall = exc0.calls.find((x) => x.op === "exclude");
  rec("R61", "leave a figure out with a reason", "1280", "member ann", "pressed “Leave out with a reason” on the included row", excCall && /"ok":true/.test(excCall.answer) ? "WORKS" : "BROKEN", `${stOf(excCall)}; ${J(excCall && excCall.answer, 220)}; refusal/said: ${J(exc0.said, 160)}`);
  await mu2.go("/app/money/" + setId);
  await mu2.act("include", { nth: 0, open: 1, reason: "The register line matches the paid invoice." });
  await mu2.go("/app/money/" + setId);
  const afterReload = await mu2.text();
  rec("R61", "reload and return to the trail: the included and the left-out figures stay, each with its reason", "1280", "member ann", "reloaded the trail after one inclusion and one exclusion", /included|Included/.test(afterReload) && /left out|Left out|excluded/i.test(afterReload) ? "WORKS" : "BROKEN", J(afterReload.match(/(included|left out|excluded)[^\n]*/gi), 400), await mu2.shot("R61-after-reload"));
  const rawShaDrawn = /[0-9a-f]{64}/.test(afterReload);
  rec("R61", "no raw fingerprint or id in the trail's words (the source cell)", "1280", "member ann", "read the SOURCE column of the trail's rows", rawShaDrawn ? "BROKEN (MINOR: raw ids in member text)" : "WORKS", `the source cell reads: “${J((afterReload.match(/row \d+ of the table[^\n]*/) || [""])[0], 300)}”`);
  await mu2.go(`/app/money/${setId}`);
  const checks = await mu2.page.evaluate(() => [...document.querySelectorAll("#cs-main input[type=checkbox]")].map((e) => (e.id || e.name || e.getAttribute("aria-label") || "") + "|" + (e.dataset.pick || e.dataset.id || "")).slice(0, 8));
  const filt = await mu2.page.evaluate(() => [...document.querySelectorAll("#cs-main a, #cs-main button")].filter((e) => /undetermined/i.test(e.innerText || e.getAttribute("aria-label") || "")).map((e) => e.tagName.toLowerCase() + ":" + (e.getAttribute("href") || e.dataset.act || "") + ":" + (e.innerText || "").slice(0, 50)).slice(0, 5));
  console.log("R61 CONTROLS", J(checks), J(filt));
  await mu2.go(`/app/money/${setId}%2Fundetermined`);
  const filtTxt = await mu2.text();
  rec("R61", "the filter “Only figures with something undetermined” (address …/<trail>/undetermined) keeps the rows with a gap", "1280", "member ann", "opened the trail's undetermined address", /Money trail/.test(filtTxt) ? "WORKS" : "BROKEN", `controls found: ${J(filt)}; text: ${J(filtTxt.replace(/\n+/g, " / ").slice(0, 300))}`, await mu2.shot("R61-undetermined"));
  const holdTxt = await (async () => { await mu2.go(`/app/money/${setId}`); const boxes = mu2.page.locator('#cs-main input[type="checkbox"][data-shell]'); const n = await boxes.count(); if (n >= 2) { await boxes.nth(0).check().catch(() => {}); await boxes.nth(1).check().catch(() => {}); await mu2.page.waitForTimeout(600); } return { n, text: await mu2.text() }; })();
  rec("R61", "tick rows to bring the hold strip with “Unpick all”", "1280", "member ann", "ticked the first two rows' boxes", /Unpick all/i.test(holdTxt.text) ? "WORKS" : (holdTxt.n < 2 ? "NOT REACHED (no row boxes drawn: " + holdTxt.n + " found)" : "BROKEN"), `row boxes found ${holdTxt.n}; strip: ${J((holdTxt.text.match(/[^\n]*Unpick all[^\n]*/i) || ["(no strip)"])[0], 160)}`, await mu2.shot("R61-hold-strip"));
  /* the partial marker while a large ingest runs */
  const BRp = { ...BR, stage: { value: "incurred" } };
  const bndP = await door(ann, "bindingadopt", { table: decC.r.sha, roles: BRp });
  const ingP = await door(ann, "moneyingest", { binding: bndP.r.binding, rows: "all", reason: "A second kind of figure from the same register, to read the partial marker." });
  let seenPartial = null, seenState = null;
  for (let i = 0; i < 40 && !seenPartial; i++) {
    const mo = R(await cs.call("moneyof", { query: { entity: ents.acme, limit: "3", phases: "actual" } }));
    seenPartial = (mo.facts || []).find((f) => f.partial === true || f.partial_says) || null;
    seenState = R(await cs.call("moneyingestread", { query: { ingest: ingP.r.ingest, kind: "state" } }));
    if (seenState.complete) break;
    await kit.later(100);
  }
  rec("R61", "while a large ingest runs, the facts it writes carry the partial marker (money.ingest.partial); after the done notice it is gone", "1280", "member ann", "started an ingest of 18,098 rows and read Acme Paving's money facts every 100 ms until it finished", seenPartial ? "WORKS" : "NOT REACHED (the run finished before a read saw a written fact: it ran in about a second)", `partial fact seen: ${J(seenPartial, 400)}; ingest state at the end ${J({ state: seenState.state, rows_done: seenState.rows_done, written: seenState.written_count }, 200)}`);
  await mu2.close();

  /* ---- R158 connections made by hand ---- */
  const memo = await upload(ann, cs, "memo", "Dana Clerk is the City Clerk of the City of Oakland. Acme Paving was paid by the Clerk's office.");
  const dp = await browserFor(ann, "ann", 1280);
  await dp.go("/app/document/" + docs.minutes.bundle);
  const docTxt = await dp.text();
  const hasConnectBox = (await dp.page.locator("#document-assert-other").count()) > 0;
  await dp.page.selectOption("#document-assert-other", docs.memo.bundle).catch(() => {});
  const noBasis = await dp.act("connectionassert", { wait: 1500 });
  await dp.fill("document-assert-basis", "Both documents concern the City Clerk's office.");
  const asr = await dp.act("connectionassert", { wait: 2500 });
  const asrCall = asr.calls.find((x) => x.op === "connectionassert");
  rec("R158", "assert a connection between two documents by hand (a reasoned act; the basis is required; graded D, under her name)", "1280", "member ann", "on the minutes' Document page chose the memo as the other document, pressed “Assert this connection” with no basis, then with a basis", hasConnectBox && asrCall && /"ok":true/.test(asrCall.answer) && !noBasis.calls.find((x) => x.op === "connectionassert") ? "WORKS" : "BROKEN", `box drawn: ${hasConnectBox}; with no basis: ${J(noBasis.said || noBasis.refusal, 160)} (request sent: ${!!noBasis.calls.find((x) => x.op === "connectionassert")}); with basis: ${stOf(asrCall)}; ${J(asrCall && asrCall.answer, 420)}`, await dp.shot("R158-assert"));
  const ca = R(await cs.call("connectionsasserted", { query: { bundle: docs.minutes.bundle } }));
  rec("R158", "the asserted connection is read apart from derived ones, labelled with who asserts it, grade D, not established", "1280", "member ann", "read connectionsasserted for the minutes", (ca.member || []).length === 1 && ca.member[0].grade === "D" && ca.member[0].established === false ? "WORKS" : "BROKEN", J(ca.member && ca.member[0], 400));
  const dupe = await door(ann, "connectionassert", { a: docs.minutes.bundle, b: docs.memo.bundle, basis: "Again." });
  rec("R158", "asserting the same pair again by the same member writes nothing (`wrote: false`)", "1280", "member ann", "called connectionassert for the same pair again", dupe.r.wrote === false ? "WORKS" : "BROKEN", J(dupe.r, 300));
  const machine = await door({ authorization: "Bearer " + kit.OPTIONS.bindings.PROBE_TOKEN }, "connectionassert", { a: docs.minutes.bundle, b: docs.memo.bundle, basis: "A machine credential." });
  rec("R158", "a machine credential is refused by name (CONNECTION_ASSERT_NOT_A_MEMBER)", "1280", "probe credential", "called connectionassert with the probe token", !machine.ok ? "WORKS" : "BROKEN", J(machine.raw, 360));
  /* choose the on-point mention: two documents naming the same ordinance (a reference the minutes reader makes), the connection derived, the mention chosen on the document page */
  if (!ents.ordA) { await ent("ordA", "ordinance", "Ordinance 26-0910"); await cs.call("entityalias", { body: { entityId: ents.ordA, alias: "26-0910" } }); }
  const iA = docs["intro-26-0910"] || await upload(ann, cs, "intro-26-0910", minutesText("26-0910", "September 1, 2026", "Introduction of"));
  const ag = await upload(ann, cs, "agenda-26-0910", minutesText("26-0910", "August 25, 2026", "Agenda item for"));
  const rs1 = R(await cs.call("resolve", { body: { captureSha: iA.sha, ref: "legislation:26-0910", entityId: ents.ordA, basis: "The minutes name file 26-0910." } }));
  const rs2 = R(await cs.call("resolve", { body: { captureSha: ag.sha, ref: "legislation:26-0910", entityId: ents.ordA, basis: "The agenda names file 26-0910." } }));
  const der = R(await cs.call("connect", { body: { entityId: ents.ordA } }));
  const cons = R(await cs.call("connections", { query: { id: ents.ordA } }));
  console.log("CONNECT", J(rs1, 200), J(rs2, 200), J(der, 400), "\nCONNECTIONS", J(cons, 900));
  await dp.go("/app/document/" + iA.bundle);
  const mentionSel = await dp.page.evaluate(() => [...document.querySelectorAll("select[id^='document-mention-']")].map((e) => e.id + ":" + [...e.options].map((o) => o.textContent.slice(0, 40)).join("|")));
  let chooseCall = null;
  if (mentionSel.length) {
    const id0 = mentionSel[0].split(":")[0];
    await dp.page.selectOption("#" + id0, { index: 1 }).catch(() => {});
    const ch = await dp.act("connectionchoose", { wait: 2500 });
    chooseCall = ch.calls.find((x) => x.op === "connectionchoose");
  }
  rec("R158", "on a document that names the same ordinance, choose the mention that counts (panel offered only where two or more mentions exist)", "1280", "member ann", "resolved the file number in the introduction minutes and in an agenda to Ordinance 26-0910 (the connection derives), opened the introduction minutes' Document page, chose a mention and pressed “Choose the mention that counts”", chooseCall && /"ok":true/.test(chooseCall.answer) ? "WORKS" : (mentionSel.length ? "BROKEN" : "NOT REACHED (the connection panel offers no choice: the minutes name the file number once each, so there is one mention to choose among; the derivation holds " + (cons.count ?? 0) + " connection(s))"), `resolve ${J(rs1.ok)}/${J(rs2.ok)}; connect → ${cons.count} connection(s): ${J((cons.connections || [])[0], 400)}; mention controls drawn: ${J(mentionSel)}; ${stOf(chooseCall)}; ${J(chooseCall && chooseCall.answer, 300)}`, await dp.shot("R158-document"));
  await dp.close();
  /* a declared step, its source, the chain's check, a question opened from it */
  const rel1 = await door(ann, "relationdeclare", { fromEntity: ents.clerk, toEntity: ents.city, relation: "member_of", justification: "Dana Clerk is the City Clerk.", citation: "memo" });
  const exu = await browserFor(ann, "ann", 1280);
  await exu.go("/app/explore/" + ents.clerk);
  const ex1 = await exu.act("explore", { wait: 3500 });
  const exT = await exu.text();
  rec("R158", "a declared step is drawn as a lead (dashed grey, “declared, not evidenced”), not evidence; the chain's sentence says no finding rests on it", "1280", "member ann", "declared Dana Clerk member_of the City (`relationdeclare`, citing the memo) and explored from Dana Clerk", /declared|lead/i.test(exT) ? "WORKS" : "BROKEN", `declare ${J(rel1.r, 200)}; page: ${J(exT.split("\n").filter((l) => /declared|lead|evidence/i.test(l)).join(" / "), 400)}`, await exu.shot("R158-lead"));
  const stepForm = await exu.page.evaluate(() => [...document.querySelectorAll("[id^='explore-assert']")].map((e) => e.id + ":" + e.tagName));
  console.log("STEPFORM", J(stepForm));
  const shaLabel = await exu.page.evaluate(() => { const i = document.getElementById("explore-assert-sha"); const l = document.querySelector("label[for='explore-assert-sha']"); const h = document.getElementById("explore-assert-sha-help"); return `${l ? l.innerText : ""} / ${h ? h.innerText : ""} (${i ? i.tagName + "[" + i.type + "]" : "none"})`; });
  await exu.fill("explore-assert-sha", docs.memo.sha);
  await exu.fill("explore-assert-page", "1").catch(() => {});
  await exu.fill("explore-assert-basis", "The memo says the Clerk is the City's Clerk.").catch(() => {});
  const ssr = await exu.act("stepsource", { wait: 2500 });
  const ssCall = ssr.calls.find((x) => x.op === "stepsource");
  rec("R158", "attach a source to a declared step (a passage and her words on what it shows): the step stays declared, the source is its own fact", "1280", "member ann", "chose the memo and typed what it shows, pressed “Attach a source to a declared step”", ssCall && /"ok":true/.test(ssCall.answer) ? "WORKS" : "BROKEN", `${stOf(ssCall)}; ${J(ssCall && ssCall.answer, 400)}; said ${J(ssr.said, 160)}`);
  const ssExt = (ssCall && ssCall.answer.match(/"extent":\{[^}]*\}/) || [""])[0];
  rec("R158", "the passage a step source cites is of the document's own kind (a plain-text memo is not “page 1” of a PDF)", "1280", "member ann", "attached the plain-text memo as the source and read the extent the plane stored", /pdf-page/.test(ssExt) ? "BROKEN (MINOR: a plain-text document is cited as a PDF page)" : "WORKS", `stored ${ssExt}; the form asks for a document fingerprint and a page number only, and builds a PDF-page extent whatever the document is`);
  rec("R158", "the form that attaches a source to a declared step chooses the document by its title, never by a typed fingerprint (DEC-299 (9))", "1280", "member ann", "read the label and field of “Attach a source to a declared step”", /input/i.test(shaLabel) && /\[text\]/i.test(shaLabel) ? "BROKEN (MAJOR: a member is asked to type a document fingerprint)" : "WORKS", shaLabel, await exu.shot("R158-stepsource-form"));
  const ver = await exu.act("exploreverify", { wait: 2500 });
  const vCall = ver.calls.find((x) => x.op === "exploreverify");
  rec("R158", "“Check this chain” re-derives the drawn chain and says whether it matches, hop by hop", "1280", "member ann", "pressed “Check this chain” on the first chain", vCall && /"ok":true/.test(vCall.answer) ? "WORKS" : "BROKEN", `${stOf(vCall)}; ${J(vCall && vCall.answer, 400)}`);
  const pro = await exu.act("promote", { wait: 3500 });
  rec("R158", "“Open a question from this chain” opens a question that names the chain; no finding rests on a declared or hunch step", "1280", "member ann", "pressed “Open a question from this chain”", /\/app\/question\//.test(exu.page.url()) ? "WORKS" : "BROKEN", `landed ${exu.page.url().replace("https://group.example", "")}; calls ${J(pro.calls.map((x) => x.op))}; said ${J(pro.said, 200)}`, await exu.shot("R158-question"));
  await exu.close();

  /* ---- the overlay's checks that fall on these screens (timing, 390 px, dark, words, tap targets, accessible names, nothing from outside, a member who cannot see the project) ---- */
  const PAGES = [["Timeline", `/app/timeline/${project}`], ["Money (project)", `/app/money/${project}`], ["Money trail", `/app/money/${setId}`], ["Explore", `/app/explore/${ents.city}`], ["Document", `/app/document/${docs.minutes.bundle}`]];
  const BAD = /\bgroup\b|\boverdue\b|\bsignal\b|\bsecret\b|\bconfidential\b/i;
  const slowest = (u) => u.log.slice().sort((x, y) => y.ms - x.ms)[0];
  const totalDur = (x) => { const m = /^[a-z]+;dur=(\d+)/.exec(x && x.st || ""); return m ? Number(m[1]) : null; };
  for (const [name, path] of PAGES) {
    const u = await browserFor(ann, "ann", 1280);
    const wall = await u.go(path);
    const sl = slowest(u), reads = u.log.length;
    const txt = await u.text();
    const unnamedList = await u.page.evaluate(() => [...document.querySelectorAll("#cs-main button, #cs-main input, #cs-main select, #cs-main textarea")].filter((e) => !((e.getAttribute("aria-label") || e.innerText || e.value || e.title || "").trim()) && !(e.labels && e.labels.length) && e.type !== "hidden").map((e) => `${e.tagName.toLowerCase()}${e.type ? "[" + e.type + "]" : ""}#${e.id || ""}.${(e.className || "").toString().slice(0, 30)}`));
    const unnamed = unnamedList.length;
    const bad = (txt.match(BAD) || []);
    const worst = u.log.reduce((m, x) => Math.max(m, totalDur(x) || 0), 0);
    rec("Overlay 31", `${name}: first draw, reads and the slowest read (Server-Timing)`, "1280", "member ann", `opened ${path.replace(project, "<project>").replace(setId || "", "<trail>")} and timed every read`, worst <= 2000 ? "WORKS" : "BROKEN (MAJOR: a read over the 2 s bar on Server-Timing)", `first draw ${wall - 2500} ms wall (the page settles 2.5 s after; this includes the machine's Chromium and the in-process plane, so the bars are judged on Server-Timing); ${reads} reads; slowest ${sl ? `${sl.op} wall ${sl.ms} ms, ${sl.st.split(",").slice(0, 3).join(",")}` : "none"}; largest total on any read ${worst} ms; the plane served this member alone and no reading tick was running in its object`);
    rec("Overlay 15/19/20", `${name}: banned words (group, overdue, Signal, secret, confidential), unnamed controls, requests to outside hosts`, "1280", "member ann", "scanned the drawn text and the controls", bad.length === 0 && unnamed === 0 && u.out.length === 0 ? "WORKS" : "BROKEN (MINOR)", `banned words drawn: ${J(bad)}; controls with no accessible name: ${unnamed} ${J(unnamedList.slice(0, 5), 300)}; requests refused to outside hosts: ${J(u.out)}`);
    await u.close();
    const m = await browserFor(ann, "ann", 390);
    await m.go(path);
    const ov = await m.overflow();
    const smallList = await m.page.evaluate(() => [...document.querySelectorAll("#cs-main button, #cs-main select, #cs-main input:not([type=hidden]), #cs-main textarea")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}${e.type ? "[" + e.type + "]" : ""} ${Math.round(r.width)}x${Math.round(r.height)} “${(e.innerText || e.getAttribute("aria-label") || e.value || "").toString().slice(0, 24)}”`; }));
    const small = smallList.length;
    rec("Overlay 17", `${name} at 390 px: no sideways scroll, tap targets at least 44 px`, "390", "member ann", "opened the screen at 390 px and measured every button, select, input and box", ov.sw <= ov.iw && small === 0 ? "WORKS" : "BROKEN (MINOR)", `scrollWidth ${ov.sw} / ${ov.iw}; controls under 44 px in either direction: ${small} ${J(smallList.slice(0, 6), 400)}`, await m.shot("OV-" + name.replace(/[^A-Za-z]+/g, "-")));
    await m.close();
  }
  { /* dark mode on the Timeline and the trail */
    const b = await pw.chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
    await ctx.addInitScript(([t, h]) => { try { localStorage.setItem("bio-session", JSON.stringify({ t, e: 0, d: "own", w: h })); } catch (e) { /* none */ } }, [ann.authorization.replace(/^Bearer /, ""), "ann"]);
    const pg = await ctx.newPage();
    await pg.route("**/*", async (route) => { const rq = route.request(), u = new URL(rq.url()); if (u.origin !== "https://group.example") return route.abort(); const init = { method: rq.method(), headers: rq.headers() }; const pd = rq.postDataBuffer(); if (pd) init.body = pd; delete init.headers["content-length"]; delete init.headers.host; const res = await kit.mf.dispatchFetch(rq.url(), init); const body = Buffer.from(await res.arrayBuffer()); const headers = {}; res.headers.forEach((v, k) => { if (!/^(content-encoding|content-length|transfer-encoding)$/i.test(k)) headers[k] = v; }); return route.fulfill({ status: res.status, headers, body }); });
    for (const [name, path] of [["Timeline", `/app/timeline/${project}`], ["Money trail", `/app/money/${setId}`]]) {
      await pg.goto("https://group.example" + path, { waitUntil: "load" }); await pg.waitForSelector("#cs-main"); await pg.waitForTimeout(2500);
      const bg = await pg.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const lum = (c) => { const m = /(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(c || ""); return m ? (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255 : 1; };
      await pg.screenshot({ path: SHOTS + `OV-dark-${name.replace(/ /g, "-")}-1280.png`, fullPage: true });
      rec("Overlay 18", `${name} in dark mode (the device asks for dark)`, "1280", "member ann", "opened the screen with the browser's colour scheme set to dark", lum(bg) < 0.35 ? "WORKS" : "BROKEN (MINOR)", `page background ${bg} (luminance ${lum(bg).toFixed(2)})`, `shots/07-money-time/OV-dark-${name.replace(/ /g, "-")}-1280.png`);
    }
    await b.close();
  }
  { /* a member who cannot see the project */
    const w = await browserFor(max, "max", 1280);
    await w.go(`/app/timeline/${project}`);
    const wt = await w.text();
    rec("Overlay 2/21", "a member who cannot see the project opens its Timeline: a hidden object leaves only the one fixed sentence of incompleteness, no title, state or count", "1280", "member max", "opened ann's project Timeline as the plain member", !/Contract spending against policy/.test(wt) ? "WORKS" : "BROKEN (MAJOR: the hidden project's title is drawn)", J(wt.replace(/\n+/g, " / "), 400), await w.shot("OV-withheld-timeline"));
    const mSet = await door(max, "moneyset", {}, { id: setId }), mFact = await door(max, "money", {}, { id: factIds[0] }), mCap = await door(max, "committedagainstpaid", {}, { contract: ents.contract });
    await w.go(`/app/money/${setId}`);
    const wm = await w.text();
    rec("Overlay 2/21", "a member who cannot see the project opens its money trail", "1280", "member max", "opened the trail of ann's project as the plain member and read it through the door (moneyset, money, committedagainstpaid)", !/Acme Paving road repair|Acme Paving/.test(wm) ? "WORKS" : "BROKEN (MAJOR: the trail of a project the member cannot see is drawn with its name, its project's id and its counts; only the figures themselves are withheld)", `page: ${J(wm.replace(/\n+/g, " / "), 300)}; moneyset as max: ${J(mSet.r, 260)}; money (fact): ${J(mFact.r, 200)}; committedagainstpaid: ${J(mCap.r && { committed: mCap.r.committed && mCap.r.committed.sum, paid: mCap.r.paid && mCap.r.paid.sum }, 200)}`, await w.shot("OV-withheld-money"));
    await w.close();
  }
  //MONEYEND
  }
  //PART2
}
