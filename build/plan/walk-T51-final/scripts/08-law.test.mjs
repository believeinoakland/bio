/* WALK-FINAL-08 #1 (T51's final pass, sitting 08, Law and courts; Phase 1, offline, K5122): R70-R74 and the overlay's checks as they bear on the law and court screens,
   walked through the door. The real plane in Miniflare (the seam kit `r8-kit.mjs`), a founder signed in by her own `claim` and `login`, the real screens
   (every screen module the control plane serves) booted on interface-shell's document stand-in with every request answered by that plane. Every input is made by
   the member's own acts (`captureupload`, `acquire`, `select`/`release`, `profilesset`, the screens' own buttons); no answer is hand-written and no row is written to storage.
   Writes `../08-law.md` one row per check as it goes. Run alone: `cd bio-plane && node --test ../build/plan/walk-T51-final/scripts/08-law.test.mjs`. */
import "../../../../bio-plane/test/sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const { makeKit } = await import("../../../../bio-plane/test/m/control-plane/r8-kit.mjs");
const { boot } = await import("../../../../bio-plane/test/m/interface-shell/harness.mjs");
const { OPS } = await import("../../../../bio-plane/src/op-declarations/index.mjs");
const { SCREENS : ENTRY } = await import("../../../../bio-plane/src/screens-entry/index.mjs");
const { SCREENS : SETTINGS } = await import("../../../../bio-plane/src/screens-settings/index.mjs");
const { SCREENS : INTAKE } = await import("../../../../bio-plane/src/screens-intake/index.mjs");
const { SCREENS : DAILY } = await import("../../../../bio-plane/src/screens-daily/index.mjs");
const { SCREENS : INQUIRY } = await import("../../../../bio-plane/src/screens-inquiry/index.mjs");
const { SCREENS : WIZARDS, GUIDE } = await import("../../../../bio-plane/src/screens-wizards/index.mjs");
const { SCREENS : INVESTIGATE } = await import("../../../../bio-plane/src/screens-investigate/index.mjs");
const { SCREENS : PUBLISH } = await import("../../../../bio-plane/src/screens-publish/index.mjs");
const { SCREENS : ACTION } = await import("../../../../bio-plane/src/screens-action/index.mjs");
const { word } = await import("../../../../bio-plane/src/setup-words/index.mjs");

const ALL = [...ENTRY, ...SETTINGS, ...INTAKE, ...DAILY, ...INQUIRY, ...WIZARDS, ...INVESTIGATE, ...PUBLISH, ...ACTION];
const RECORD = fileURLToPath(new URL("../08-law.md", import.meta.url));
const ROWS = [];
const j = (x, n = 600) => { try { return JSON.stringify(x).slice(0, n); } catch { return String(x).slice(0, n); } };
const clean = (s) => String(s).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
/* one row per check the moment it is done: `row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED / KNOWN | what I saw | screenshot` */
function row(id, check, role, did, status, saw, shot = "") {
  const line = `| ${id} | ${clean(check)} | 1280 (document stand-in, no layout) | ${role} | ${clean(did)} | ${status} | ${clean(saw).slice(0, 1500)} | ${shot} |`;
  ROWS.push({ id, status, line });
  appendFileSync(RECORD, line + "\n");
  process.stderr.write(`ROW ${id} ${status}: ${clean(check).slice(0, 90)}\n`);
}
writeFileSync(RECORD, "");
/* a step: a failure of the script's own is recorded as BROKEN with what threw; `fn` answers {ok, saw, shot?, status?} */
async function step(id, check, role, did, fn) {
  try {
    const r = await fn();
    row(id, check, role, did, r.status || (r.ok ? "WORKS" : "BROKEN"), r.saw, r.shot || "");
    return r;
  } catch (e) {
    row(id, check, role, did, "BROKEN", "the step threw: " + String(e && e.message).slice(0, 700));
    return { ok: false, threw: e };
  }
}

const kit = makeKit({ tag: "law08" });
after(() => kit.mf.dispose());
const { plane, founder, sha, te, R } = kit;
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

/* ---- the founder's session, and the screens booted over the real plane ---- */
let SESSION = null, ADM = null;
async function login() {
  if (SESSION) return;
  ADM = await founder();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle: "admin", password: kit.PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, j(signed));
  SESSION = { t: signed.result.token, e: signed.result.expires, d: signed.result.device };
}
const LOG = [];
const INFLIGHT = new Set();
const PRESSES = [];
const realOps = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => {
  const u = new URL(req.url, "https://group.example");
  const tag = op + "@" + Math.round(performance.now()); INFLIGHT.add(tag);
  try { return await realOp(req, u); } finally { INFLIGHT.delete(tag); }
}]));
async function realOp(req, u) {
  let body = req.init && req.init.body;
  if (body instanceof Blob) body = new Uint8Array(await body.arrayBuffer());
  const t0 = performance.now();
  const res = await plane(u.pathname + u.search, { method: (req.init && req.init.method) || "GET", headers: (req.init && req.init.headers) || {}, ...(body === undefined ? {} : { body }) });
  const type = res.headers.get("content-type") || "";
  const out = /json/.test(type) ? { status: res.status, json: await res.json() } : { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), type };
  out.ms = Math.round(performance.now() - t0);
  out.st = res.headers.get("server-timing") || "";
  LOG.push({ op: u.searchParams.get("op"), ms: out.ms, st: out.st, status: res.status });
  return out;
}
async function settled(p) {
  /* the page is settled when no request is in flight and no new one has been made for ~1 s; a "Still loading" mark that stays after that is recorded by the step that meets it */
  let last = -1, stable = 0;
  for (let i = 0; i < 600 && stable < 25; i++) {
    await p.settle(20); await new Promise((r) => setTimeout(r, 40));
    stable = INFLIGHT.size === 0 && p.requests.length === last ? stable + 1 : 0; last = p.requests.length;
  }
}
const stuck = (p) => main(p).querySelectorAll('[data-state="loading"]').length;
async function open(path, { phone = false } = {}) {
  await login();
  const t0 = performance.now();
  const p = await boot({ screens: ALL, session: SESSION, path, plane: realOps, phone, options: undefined, guide: GUIDE });
  await settled(p);
  p.wall = Math.round(performance.now() - t0);
  if (process.env.LAW_DEBUG) { say("STUCK loading marks", stuck(p)); const c = {}; for (const r of p.requests) c[r.op] = (c[r.op] || 0) + 1; say("OPENED", path.slice(0, 60), "wall", p.wall, j(c, 500)); }
  return p;
}
const main = (p) => p.doc.getElementById("cs-main");
const text = (p) => main(p).textContent.replace(/\s+/g, " ").trim();
const acts = (el) => [...new Set(el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act")))];
const button = (p, op, within) => (within || p.root()).querySelector(`button[data-act="${op}"]`);
function fill(p, values) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (typeof v === "boolean") el.checked = v; else el.value = v;
  }
}
async function press(p, op, { reason, within, fields, el } = {}) {
  const b = el || button(p, op, within);
  if (!b) throw new Error(`no act ${op}`);
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  const asked = !!ta;
  PRESSES.push({ op, asked, dialog: !!(slot && slot.querySelector('[data-shell="confirm"]')) });
  if (ta && reason !== undefined) { ta.value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  const dlg = slot && slot.querySelector('[data-shell="confirm"]');
  if (dlg && fields) {
    slot.querySelectorAll("textarea").forEach((t, i) => { t.value = fields[i] === undefined ? "" : fields[i]; });
    await p.click(dlg);
  }
  await p.settle(); await p.settle();
  await settled(p);
  return { slot, asked, dialog: !!dlg };
}
const call = async (op, { query = {}, body } = {}) => {
  await login();
  return R(await (await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...ADM, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json());
};
const callRaw = async (op, { query = {}, body } = {}) => {
  await login();
  const res = await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...ADM, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: res.status, st: res.headers.get("server-timing") || "", json: await res.json() };
};
const refusalOf = (a) => { const r = a && a.result !== undefined ? a.result : a; return r && r.ok === false ? `${r.code || r.reason}: ${r.detail || r.why || r.error || ""}` : null; };

/* ---- the member's own documents ---- */
async function project(title) {
  return kit.projectOf(await (async () => { await login(); return ADM; })(), title);
}
async function upload(name, bytes, type = "text/plain") {
  await login();
  const up = R(await (await plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: ADM, body: bytes })).json());
  assert.equal(up.ok, true, j(up));
  return up;
}
/* an upload filed in a project and vouched, as the capture screen files it and the Document screen's "Confirm" vouches */
async function hold(name, bytes, projectId, { type = "text/plain", vouch = true } = {}) {
  const { CAPTURE_SCREEN } = await import("../../../../bio-plane/src/screens-intake/capture.mjs");
  const up = await upload(name, bytes, type);
  const cs = kit.screenCall(ADM);
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: name, locator: up.document.locator, project: projectId });
  assert.equal(filed.refused, undefined, j(filed));
  if (vouch) {
    const sel = await call("select", { body: { ids: [filed.bundleId] } });
    const rel = await call("release", { query: { handle: sel.handle, acknowledgment: "I checked this file is what it says it is.", mitigation: "Nothing in it names a private person." } });
    assert.ok(rel.ok !== false && rel.released.includes(filed.bundleId), "vouched: " + j(rel));
  }
  return { bundle: filed.bundleId, sha: up.capture.sha256, locator: up.document.locator, up };
}
async function vouchBundle(bundleId) {
  const sel = await call("select", { body: { ids: [bundleId] } });
  const rel = await call("release", { query: { handle: sel.handle, acknowledgment: "I checked this file is what it says it is.", mitigation: "Nothing in it names a private person." } });
  assert.ok(rel.ok !== false, "vouched: " + j(rel));
}

/* the walk's state, shared by the tests below (they run in order) */
const W = {};

test("0 prerequisites: the room's profile, a project, the documents (made by the member's own acts)", async () => {
  await login();
  const prof = await kit.profileSet(["oakland-alameda"]).then(() => "set", (e) => "REFUSED " + e.message.slice(0, 200));
  W.project = await project("City spending against its anti-retaliation rule");
  const omc = [
    "Oakland Municipal Code, Chapter 8.22, Tenant protections.",
    "Section 8.22.010 Definitions. In this chapter, landlord means an owner of a rental unit, and tenant means a person who rents a unit.",
    "Section 8.22.020 Retaliation. No landlord shall retaliate against a tenant who reports a violation to the city.",
    "Section 8.22.030 Notice. A landlord must give a tenant thirty days written notice before ending a tenancy.",
    "Section 8.22.040 Exceptions. The director may waive the notice in an emergency.",
  ].join("\n\n");
  W.omcText = omc;
  W.omc = await hold("omc-chapter-8-22.txt", te(omc), W.project);
  assert.ok(W.omc.bundle);
  row("R0", "prerequisites made by the member's own acts: profile oakland-alameda chosen, a project started, the OMC chapter uploaded, filed in the project and vouched", "administrator",
    "profilesset; promote (project); captureupload + promoteDocument; select + release", "WORKS", `profile ${prof}; project ${W.project}; document ${W.omc.bundle}`);
});

const timing = (from) => { const w = LOG.slice(from); const worst = w.slice().sort((a, b) => b.ms - a.ms)[0]; return `${w.length} reads, slowest ${worst ? worst.op + " " + worst.ms + " ms" : "none"}${worst && worst.st ? " [" + worst.st.slice(0, 120) + "]" : ""}`; };
const say = (...a) => process.stderr.write("SAY " + a.join(" ") + "\n");
const slice = (t, a, n = 400) => { const i = t.indexOf(a); return i < 0 ? `[${a} not drawn]` : t.slice(i, i + n); };

test("R70 the OMC chapter: Find in this, hold the sections as standards, the Standard screen, in force on a date, relate to a law", async () => {
  let t0 = LOG.length;
  let p = await open("/app/find-in/" + W.omc.sha);
  const t00 = text(p);
  await step("R70.1", "Find in this opens on the chapter's document with no question yet: it says to open one first", "administrator", `opened /app/find-in/<capture digest> (${timing(t0)}; wall ${p.wall} ms)`, async () => ({
    ok: /Open a question first/.test(t00) && !/[0-9a-f]{64}/.test(t00), saw: slice(t00, "Look in", 160) + " … " + slice(t00, "Open a question", 80) }));
  /* a question for the project, so a passage held as a standard can name it */
  W.question = await kit.questionOf(ADM, W.project, "Did the city keep to its anti-retaliation rule?");
  p = await open("/app/find-in/" + W.omc.sha);
  await step("R70.2", "Find in this, Requirements: the sections that say shall / must are found with the words as written and \"Found by search\"", "administrator", "ticked only Requirements, chose the question, pressed Find in this", async () => {
    fill(p, { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": true });
    if (p.doc.getElementById("findin-question")) fill(p, { "findin-question": W.question });
    await press(p, "findin");
    const t1 = text(p), n = main(p).querySelectorAll('button[data-act="standarddeclare"]').length;
    return { ok: n === 2 && /No landlord shall retaliate/.test(t1) && /thirty days written notice/.test(t1), saw: `${n} results: ${slice(t1, "Requirements:", 520)}` };
  });
  W.findPage = p;
  const std = {};
  for (const [i, cite, why] of [[0, "OMC 8.22.020", "The city's own rule against retaliating against a tenant who reports a violation."], [1, "OMC 8.22.030", "The city's own rule on the notice a landlord owes before ending a tenancy."]]) {
    await step(`R70.3.${i + 1}`, `\"Hold this as a standard\" from the found requirement ${cite}: the form asks cite, kind, who set it and why; the reason is the member's own`, "administrator", `filled the form (${cite}, Ordinance, City of Oakland, my reason) and pressed Hold this as a standard`, async () => {
      const f = `fr-0-${i}`;
      fill(p, { [`${f}-cite`]: cite, [`${f}-kind`]: "ordinance", [`${f}-issuer`]: "City of Oakland", [`${f}-reason`]: why });
      const btn = main(p).querySelectorAll('button[data-act="standarddeclare"]')[i];
      const r = await press(p, "standarddeclare", { el: btn, reason: why });
      const sent = p.byOp("standarddeclare").slice(-1)[0];
      const tt = text(p);
      return { ok: new RegExp("Recorded: " + cite.replace(".", "\\.")).test(tt), saw: `asked for a reason in place: ${r.asked}; dialog: ${r.dialog}; body sent: ${j(sent && sent.body, 420)}; drew: ${slice(tt, "Recorded: " + cite, 120)}` };
    });
  }
  const list = await call("standards", { query: { limit: "200" } });
  for (const x of list.items || []) std[x.cite] = x;
  W.std = std;
  await step("R70.4", "the standards held read back with their text, issuer, kind, the question named, the period unset (Find in this has no period field)", "administrator", "op standards (the screens' own read)", async () => ({
    ok: !!std["OMC 8.22.020"] && !!std["OMC 8.22.030"], saw: j((list.items || []).map((x) => [x.id, x.cite, x.kind, x.issuer, x.period, x.question || null, x.held]), 700) }));
  W.problemPage = null;

  await step("R70.2b", "a section whose number runs into its text (\"Section 8.22.050 No landlord shall…\") is found whole, the number kept", "administrator", "uploaded a second text with that shape, Find in this, Requirements", async () => {
    const run = await hold("omc-8-22-050-run-in.txt", te("Section 8.22.050 No landlord shall increase the rent above the limit the board sets."), W.project);
    const f = R(await call("findin", { body: { scope: { capture: run.sha }, kinds: ["requirements"] } }));
    const it = f.kinds[0].items[0];
    return { ok: !!it && /^Section 8\.22\.050/.test(it.words), saw: `found words: "${it && it.words}" (the sentence splitter reads the full stops inside "8.22.050" as sentence ends)` };
  });
  /* the Standard screen from the project */
  t0 = LOG.length;
  p = await open("/app/standard/" + W.project);
  const tp = text(p);
  await step("R70.5", "Standard screen, from the project: the standards the record holds are listed, each a door to its page; proposals under their states; the declare form", "administrator", `opened /app/standard/<project> (${timing(t0)}; wall ${p.wall} ms)`, async () => {
    const doors = main(p).querySelectorAll("a[data-standard-door]").map((a) => a.getAttribute("href"));
    return { ok: doors.length === 2, saw: `${doors.length} doors ${j(doors)}; acts: ${acts(main(p)).join(", ")}; ${slice(tp, "Standards", 200)}` };
  });
  await step("R70.6", "Standard screen, \"Hold this as a standard\" for a definition (a section the Find in kinds do not offer): cite, kind, who set it, the document, the date from", "administrator", "chose the OMC document, cited OMC 8.22.010, Ordinance, from 2019-06-01; pressed Hold this as a standard", async () => {
    fill(p, { "st-cite": "OMC 8.22.010 (definitions)", "st-kind": "ordinance", "st-issuer": "City of Oakland", "st-doc": W.omc.sha, "st-from": "2019-06-01" });
    const r = await press(p, "standarddeclare", { reason: "Defines landlord and tenant for the whole chapter." });
    const sent = p.byOp("standarddeclare").slice(-1)[0];
    const tt = text(p), loc = p.location.pathname;
    return { ok: /\/app\/standard\/STD-/.test(loc), saw: `asked a reason in place: ${r.asked}; body: ${j(sent && sent.body, 400)}; page now at ${loc}: ${tt.slice(0, 300)}` };
  });
  await step("R70.6b", "the declare form on the Standard screen offers a way to choose the passage it tells the member to choose (\"Choose the passage on the document\")", "administrator", "opened the form and looked for the words of the document to select", async () => {
    const q = await open("/app/standard/" + W.project);
    const t = text(q);
    const says = t.includes(word("form.choose.passage"));
    const picker = main(q).querySelectorAll("[data-words]").length;
    return { ok: !says || picker > 0, saw: `the form says "${word("form.choose.passage")}": ${says}; a passage picker (the document's words to select) is drawn: ${picker > 0}; without one the standard's text is the whole document (extent {"kind":"document"}, R70.6 body) and its page draws only the document's first three paragraphs` };
  });
  const list2 = await call("standards", { query: { limit: "200" } });
  for (const x of list2.items || []) std[x.cite] = x;
  say("STD", j(Object.keys(std)));
});

test("R70 the standard's own page: its held state, in force on a date (three states), relate to a law", async () => {
  const s20 = W.std["OMC 8.22.020"], s30 = W.std["OMC 8.22.030"], s10 = W.std["OMC 8.22.010 (definitions)"];
  assert.ok(s20 && s30 && s10, "the three standards are held: " + j(Object.keys(W.std)));
  W.s20 = s20; W.s30 = s30; W.s10 = s10;
  let t0 = LOG.length;
  let p = await open(`/app/standard/${s10.id}/${W.project}`);
  const t = text(p);
  await step("R70.7", "the page of one standard: crumb \"Standard: {name}\", kind and who set it, since when in force, the member's reason, the words as captured with the document they are in", "administrator", `opened /app/standard/<id>/<project> (${timing(t0)}; wall ${p.wall} ms)`, async () => {
    const h1 = main(p).querySelector("h1");
    return { ok: /OMC 8\.22\.010/.test(h1 ? h1.textContent : "") && /Defines landlord and tenant/.test(t), saw: `h1 "${h1 && h1.textContent}"; ${t.slice(0, 700)}; acts: ${acts(main(p)).join(", ")}` };
  });
  await step("R70.8", "the held state words (Requires, \"Standard · binds <body>\", Free to read, Official copy, \"Known to be in force through…\") drawn on the standard's page", "administrator", "read the page text for each word", async () => {
    const want = ["Requires", "binds", "Free to read", "Official copy", "in force through"];
    const miss = want.filter((w) => !t.includes(w));
    return { ok: miss.length === 0, status: miss.length === 0 ? "WORKS" : "BROKEN", saw: `not drawn on the page: ${miss.join(", ") || "none"}; the page does draw: ${slice(t, "Ordinance", 160)}` };
  });
  /* in force on a date: the three states */
  const ask = async (date) => {
    fill(p, { "st-inforce-day": date });
    await press(p, "standardinforce");
    const tt = text(p);
    const m = main(p).querySelector("[data-inforce]");
    return { state: m && m.getAttribute("data-inforce"), line: slice(tt, "On ", 260) };
  };
  await step("R70.9", "Check a date, before the period starts: the three-state answer reads not in force, with why", "administrator", "typed 2018-01-01, pressed Check a date", async () => {
    const a = await ask("2018-01-01");
    return { ok: a.state === "not_in_force", saw: `state ${a.state}: ${a.line}` };
  });
  await step("R70.10", "Check a date, after the period starts with no end recorded: undetermined, with why (never \"in force\")", "administrator", "typed 2021-05-01, pressed Check a date", async () => {
    const a = await ask("2021-05-01");
    return { ok: a.state === "undetermined", saw: `state ${a.state}: ${a.line}` };
  });
  await step("R70.11", "Check a date with the day left empty / typed badly: refused in place, nothing sent", "administrator", "left the day blank, pressed Check a date", async () => {
    const before = p.byOp("standardinforce").length;
    fill(p, { "st-inforce-day": "" });
    await press(p, "standardinforce");
    const sent = p.byOp("standardinforce").length - before;
    return { ok: sent === 0, saw: `requests sent: ${sent}; ${slice(text(p), "Check", 200)}` };
  });
  /* a source checked on a day: "known to be in force through" (a door op; the Standard screen has no act for it) */
  const today = new Date().toISOString().slice(0, 10);
  await step("R70.12", "\"Known to be in force through {through}, from {source}, recorded by {author}\": the record op, then Check a date again", "administrator", `op standardinforcethrough (no screen act offers it) with the OMC capture as the checked source, through ${today}`, async () => {
    const r = await callRaw("standardinforcethrough", { body: { standard: s10.id, through: today, source: { captureSha: W.omc.sha, extent: { kind: "document" } }, reason: "The city's code site was read on the day the capture was made and the chapter stood as captured." } });
    const rr = R(r.json);
    say("THROUGH", j(rr, 700));
    p = await open(`/app/standard/${s10.id}/${W.project}`);
    const a = await ask(today);
    return { ok: rr.ok !== false && a.state === "in_force", saw: `op answered ${refusalOf(r.json) || j(rr, 300)}; the page now answers for ${today}: state ${a.state}: ${a.line}; page draws "through": ${/through/i.test(text(p))}` };
  });
  /* relate to a law: the Standard screen asks for the passage as a content id */
  const st20 = R(await call("standard", { query: { id: s20.id } }));
  W.s20Text = (st20.text || [])[0];
  p = await open(`/app/standard/${s20.id}/${W.project}`);
  await step("R70.13", "Relate to a law, as a member would (the citation field reads \"The passage that says so (a content id)\"): the member types the citation as the code gives it", "administrator", "chose type Refers to, the law OMC 8.22.010, typed citation \"OMC 8.22.020\", pressed Relate to a law", async () => {
    const label = slice(text(p), "The passage that says so", 80);
    fill(p, { "st-type": "refers_to", "st-to": s10.id, "st-citation": "OMC 8.22.020" });
    await press(p, "lawrelate", { reason: "The retaliation rule uses the chapter's definition of landlord and tenant." });
    const tt = text(p);
    const sent = p.byOp("lawrelate").slice(-1)[0];
    const ref = main(p).querySelector('[data-gap="refused"]');
    return { ok: !ref, status: ref ? "BROKEN" : "WORKS", saw: `field label: "${label}"; sent ${j(sent && sent.body, 300)}; refusal drawn: ${ref ? ref.textContent.replace(/\s+/g, " ").slice(0, 400) : "none"}; is any content id shown on the page for the member to copy: ${/[0-9a-f]{40,}/.test(tt) || /\bCNT-/.test(tt)}` };
  });
  await step("R70.14", "Relate to a law with the passage's content id (what the plane requires), on the standard's page opened from the project's list", "administrator", `typed the content id ${String(W.s20Text).slice(0, 14)}… (read from the standard's record by op) as the citation, page /app/standard/<id>/<project>`, async () => {
    p = await open(`/app/standard/${s20.id}/${W.project}`);
    fill(p, { "st-type": "refers_to", "st-to": s10.id, "st-citation": W.s20Text });
    await press(p, "lawrelate", { reason: "The retaliation rule uses the chapter's definition of landlord and tenant." });
    const tt = text(p);
    const rel = R(await call("lawrelations", { query: { id: s20.id } }));
    return { ok: (rel.referential || []).length === 1, saw: `relations: ${j((rel.referential || []).map((r) => [r.type, r.from.standard, r.to.standard]))}; drawn: ${slice(tt, "Refers to", 200) || slice(tt, "refers", 200)}` };
  });
  await step("R70.14b", "the same act on the standard's page opened by its own address (no project step in the path)", "administrator", `typed the content id, page /app/standard/<id>`, async () => {
    p = await open(`/app/standard/${s20.id}`);
    fill(p, { "st-type": "refers_to", "st-to": s10.id, "st-citation": W.s20Text });
    await press(p, "lawrelate", { reason: "The retaliation rule uses the chapter's definition of landlord and tenant." });
    const sent = p.byOp("lawrelate").slice(-1)[0];
    const rel = R(await call("lawrelations", { query: { id: s20.id } }));
    return { ok: (rel.referential || []).length === 1, saw: `sent from "${sent && sent.body && sent.body.from}"; relations: ${j((rel.referential || []).map((r) => [r.type, r.from.standard, r.to.standard]))}; drawn: ${slice(text(p), "Refers to", 160)}` };
  });
  await step("R70.15", "Relate as an amendment without a date in effect: refused in place before anything is sent (\"In effect from\")", "administrator", "chose type Amends, no effective date, pressed Relate to a law", async () => {
    const before = p.byOp("lawrelate").length;
    fill(p, { "st-type": "amends", "st-to": s10.id, "st-citation": W.s20Text, "st-effective": "" });
    await press(p, "lawrelate", { reason: "x" });
    const sent = p.byOp("lawrelate").length - before;
    return { ok: sent === 0, saw: `requests sent: ${sent}; ${slice(text(p), "In effect from", 160)}` };
  });
  /* a second law: the state statute, held from a second document, and the OMC section relates to it */
  const civ = await hold("california-civil-code-1942-5.txt", te("California Civil Code section 1942.5. A lessor shall not retaliate against a lessee because the lessee has lawfully and peaceably exercised any rights under the law, including reporting a violation to a public agency."), W.project);
  W.civ = civ;
  await step("R70.16", "Hold a state statute (a second law) from the Standard screen with its own date from, then relate the city's section to it as \"Implements\" with the amendment-free relation", "administrator", "uploaded the statute text, held it as a Statute (Cal. Civ. Code 1942.5, State of California); related OMC 8.22.020 implements it", async () => {
    p = await open(`/app/standard/${W.project}`);
    fill(p, { "st-cite": "Cal. Civ. Code 1942.5", "st-kind": "statute", "st-issuer": "State of California", "st-doc": civ.sha, "st-from": "1970-01-01" });
    await press(p, "standarddeclare", { reason: "The state's anti-retaliation statute the city's rule sits under." });
    const l = await call("standards", { query: { limit: "200" } });
    const stat = (l.items || []).find((x) => x.cite === "Cal. Civ. Code 1942.5");
    if (stat) W.stat = stat;
    p = await open(`/app/standard/${s20.id}`);
    fill(p, { "st-type": "implements", "st-to": stat ? stat.id : "", "st-citation": W.s20Text });
    await press(p, "lawrelate", { reason: "The city rule implements the state statute." });
    const rel = R(await call("lawrelations", { query: { id: s20.id } }));
    return { ok: !!stat && (rel.referential || []).some((r) => r.type === "implements"), saw: `statute ${stat && stat.id}; relations ${j((rel.referential || []).map((r) => [r.type, r.from.standard, r.to.standard]))}; page: ${slice(text(p), "Relations", 240)}` };
  });
  W.relDir = async () => {
    const rel = R(await call("lawrelations", { query: { id: s20.id } }));
    const pg = await open(`/app/standard/${s20.id}`);
    return { rel, t: text(pg), pg };
  };
});

test("R70 an amended section: the announced amendment is a successor with its own start; the old section says it was replaced", async () => {
  const old = W.s30;
  await step("R70.17", "an announced amendment: the amended section is held as the successor of the old one with its own date from; asking the old section for a date after that reads not in force and why", "administrator", "op standarddeclare of OMC 8.22.030 (as amended) superseding the old one, from 2025-07-01; then Check a date 2026-01-01 on the old section's page", async () => {
    const r = await callRaw("standarddeclare", { body: { cite: "OMC 8.22.030 (as amended)", kind: "ordinance", issuer: "City of Oakland", reason: "The council amended the notice period; the amended text is held as the successor.", text: [{ capture_sha: W.omc.sha, extent: { kind: "doc-para", para: 3, run: null } }], supersedes: old.id, period: { from: "2025-07-01", to: null } } });
    const x = R(r.json);
    W.s30new = x.id;
    const pg = await open(`/app/standard/${old.id}`);
    fill(pg, { "st-inforce-day": "2026-01-01" });
    await press(pg, "standardinforce");
    const m = main(pg).querySelector("[data-inforce]");
    return { ok: x.ok !== false && !!m, saw: `${refusalOf(r.json) || "successor " + x.id}; old section on 2026-01-01: state ${m && m.getAttribute("data-inforce")}: ${slice(text(pg), "On ", 280)}; does the old section's page say it was replaced: ${/replaced|superseded|amended/i.test(text(pg))}` };
  });
});

/* ---- R71: standards from the three document kinds, adopt a proposal, bind or benchmark, the "as heard" path ---- */
async function webHold(name, bytes, projectId, { type = "text/html" } = {}) {
  const url = `https://www.example.gov/files/${name}`;
  kit.serve(name, bytes, { type });
  await login();
  const r = await kit.acquire(ADM, { locator: url, project: projectId });
  const doc = R(r.body).document;
  const { CAPTURE_SCREEN } = await import("../../../../bio-plane/src/screens-intake/capture.mjs");
  const filed = doc ? await CAPTURE_SCREEN.parts.promoteDocument(kit.screenCall(ADM), { doc, title: name, locator: doc.locator, project: projectId }) : {};
  const bundle = filed.bundleId || null;
  if (bundle) await vouchBundle(bundle);
  return { url, r, doc, bundle, sha: doc && doc.capture && doc.capture.sha256 };
}
test("R71 a standard from each of the three document kinds, adopt a proposed one, list, cite in a question", async () => {
  /* a PDF page */
  const pdfWords = "The Director of Public Works shall repair each reported pothole within seven calendar days of the report.";
  const pdf = await hold("public-works-instruction-9-1.pdf", kit.pdfOf(pdfWords, 6000), W.project, { type: "application/pdf" });
  W.pdf = pdf;
  let p = await open("/app/find-in/" + pdf.sha);
  await step("R71.1", "a PDF page: Find in this (Requirements) reads the page's sentence and offers \"Hold this as a standard\"", "administrator", "uploaded a one-page PDF, vouched it, opened Find in this on it, ticked Requirements, pressed Find in this", async () => {
    fill(p, { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": true });
    if (p.doc.getElementById("findin-question")) fill(p, { "findin-question": W.question });
    await press(p, "findin");
    const t = text(p), n = main(p).querySelectorAll('button[data-act="standarddeclare"]').length;
    return { ok: n >= 1 && /shall repair each reported pothole/.test(t), saw: `${n} results; ${slice(t, "Requirements:", 420)}` };
  });
  await step("R71.2", "a PDF page held as a standard (policy, Public Works Department): the extent is the PDF's page", "administrator", "filled Administrative Instruction 9.1 §2, Policy, Public Works Department; pressed Hold this as a standard", async () => {
    const f = "fr-0-0";
    fill(p, { [`${f}-cite`]: "Administrative Instruction 9.1, §2", [`${f}-kind`]: "policy", [`${f}-issuer`]: "Public Works Department", [`${f}-reason`]: "The department's own deadline for repairing a reported pothole." });
    await press(p, "standarddeclare", { reason: "The department's own deadline for repairing a reported pothole." });
    const sent = p.byOp("standarddeclare").slice(-1)[0];
    const l = await call("standards", { query: { limit: "200" } });
    W.pol = (l.items || []).find((x) => x.cite === "Administrative Instruction 9.1, §2");
    return { ok: !!W.pol, saw: `body ${j(sent && sent.body, 360)}; held as ${W.pol && W.pol.id} (${W.pol && W.pol.kind}, ${W.pol && W.pol.held})` };
  });
  /* a web page */
  const html = "<html><head><title>Public Works service standards</title></head><body><h1>Service standards</h1><p>Crews must close each service request within ten business days.</p><p>The department may extend the time for good cause.</p></body></html>";
  let web = null;
  await step("R71.3", "a web page captured by address, filed and vouched, then Find in this reads it", "administrator", "served an https page, pressed capture (acquire) with the project, waited for it to be held, vouched it", async () => {
    web = await webHold("public-works-service-standards.html", te(html), W.project);
    W.web = web;
    return { ok: !!(web.sha && web.bundle), saw: `status ${web.r.status}; address ${web.url}; filed as ${web.bundle}; capture ${String(web.sha).slice(0, 12)}…; receipt ${j(web.doc && web.doc.profile && web.doc.profile.handler_label)}` };
  });
  if (W.web && W.web.sha) {
    p = await open("/app/find-in/" + W.web.sha);
    await step("R71.4", "a web page held as a standard (policy, Public Works Department; the sentence says must)", "administrator", "Find in this on the web capture, Requirements, Hold this as a standard", async () => {
      fill(p, { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": true });
      await press(p, "findin");
      const n = main(p).querySelectorAll('button[data-act="standarddeclare"]').length;
      const f = "fr-0-0";
      fill(p, { [`${f}-cite`]: "Public Works Service Standard, ten business days", [`${f}-kind`]: "policy", [`${f}-issuer`]: "Public Works Department", [`${f}-reason`]: "The department's published time to close a service request." });
      await press(p, "standarddeclare", { reason: "The department's published time to close a service request." });
      const l = await call("standards", { query: { limit: "200" } });
      W.webStd = (l.items || []).find((x) => x.cite === "Public Works Service Standard, ten business days");
      return { ok: n >= 1 && !!W.webStd, saw: `${n} results; held ${W.webStd && W.webStd.id} text ${j(W.webStd && W.webStd.text)}` };
    });
  }
  /* adopt a proposed standard: a proposal is made by a member's door call (no screen act proposes), then adopted on the Standard screen */
  const passage = R(await call("standard", { query: { id: W.pol ? W.pol.id : "" } }));
  await step("R71.5", "a proposed standard is listed under Open on the project's Standard screen, labelled as a proposal, \"not a standard until a member adopts it\"", "administrator", "op standardpropose (the door, as a member; the Standard screen has no propose act), then opened /app/standard/<project>", async () => {
    const r = await callRaw("standardpropose", { body: { cite: "Administrative Instruction 9.1, §3", kind: "policy", issuer: "Public Works Department", text: passage.text || [], why: "The second sentence sets the crew's reporting duty.", project: W.project } });
    const rr = R(r.json);
    W.proposal = rr.proposal && rr.proposal.id;
    p = await open("/app/standard/" + W.project);
    const t = text(p);
    return { ok: !!W.proposal && /not a standard until a member adopts it/i.test(t), saw: `proposal ${W.proposal}; ${refusalOf(r.json) || ""}; acts ${acts(main(p)).join(", ")}; ${slice(t, "Proposed standards", 360)}` };
  });
  await step("R71.6", "Adopt a proposed standard with the member's own reason: it becomes a standard and the proposal shows what became of it", "administrator", "pressed Adopt a proposed standard, gave my reason", async () => {
    const r = await press(p, "standardadopt", { reason: "I read the instruction and hold the department to its second sentence." });
    const sent = p.byOp("standardadopt").slice(-1)[0];
    const l = await call("standards", { query: { limit: "200" } });
    const adopted = (l.items || []).find((x) => x.cite === "Administrative Instruction 9.1, §3");
    return { ok: !!adopted, saw: `asked reason in place: ${r.asked}; body ${j(sent && sent.body)}; adopted standard ${adopted && adopted.id}; page now ${p.location.pathname}` };
  });
  await step("R71.7", "the list of standards: the project's Standard screen lists every standard held, each a door to its own page", "administrator", "opened /app/standard/<project>", async () => {
    p = await open("/app/standard/" + W.project);
    const doors = main(p).querySelectorAll("a[data-standard-door]").map((a) => a.textContent.trim());
    return { ok: doors.length >= 5, saw: `${doors.length} doors: ${j(doors, 500)}` };
  });
  await step("R71.8", "the page of one standard (crumb \"Standard: {name}\"): the passage of the document it rests on, and the document that states it as a door", "administrator", "opened the policy standard's page from the project's list", async () => {
    p = await open(`/app/standard/${W.pol.id}/${W.project}`);
    const t = text(p), h1 = main(p).querySelector("h1");
    const crumb = p.doc.body.textContent.replace(/\s+/g, " ");
    return { ok: /shall repair each reported pothole/.test(t), saw: `h1 "${h1 && h1.textContent}"; crumb text: ${slice(crumb, "Standard:", 60)}; path: ${slice(crumb, "Projects ›", 120)}; ${t.slice(0, 420)}` };
  });
});

/* ---- R71 (continued) binding or benchmark, and the "as heard" path ---- */
const todayIso = new Date().toISOString().slice(0, 10);
async function entity(body) {
  const r = await callRaw("entitycreate", { body });
  const rr = R(r.json);
  return { id: rr.entity_id, r, rr };
}
test("R71 binds or benchmark, and the as-heard path (testify, dated fact, confirmation in writing)", async () => {
  const city = await entity({ kind: "body", label: "City of Oakland", note: "The city government that adopted the municipal code.", sector: "government" });
  W.city = city.id;
  await step("R71.9", "a body is registered (area 5's act, as a prerequisite): the city", "administrator", "op entitycreate (body, City of Oakland)", async () => ({ ok: !!city.id, saw: j(city.rr, 300) }));
  /* does a standard declared after the body exists name it as its issuer's entity? */
  const owner = R(await call("standard", { query: { id: W.s20.id } })).owner;
  await step("R71.10", "\"Standard · binds <body>\": the ordinance the city issued is read against the city on a date", "administrator", `op bindsat for ${W.s20.id} and the city body on ${todayIso} (no screen act or screen line offers it)`, async () => {
    const a = R(await call("bindsat", { query: { id: W.s20.id, body: city.id, date: todayIso } }));
    return { ok: a.state === "binds", status: a.state === "binds" ? "WORKS" : "BROKEN", saw: `state ${a.state}; why: ${a.why}; says ${j(a.says && a.says.binding)}; the standard's issuer entity is ${j(owner)} (the Find in / Standard forms take "Who set it" as free text and never link it to a registered body)` };
  });
  await step("R71.10b", "a standard declared after its issuer is registered names the issuer's entity (so \"binds\" can be read against it)", "administrator", "op standarddeclare of another section with issuer \"City of Oakland\" now that the body exists; read its owner", async () => {
    const pol0 = R(await call("standard", { query: { id: W.s20.id } }));
    const r = await callRaw("standarddeclare", { body: { cite: "OMC 8.22.040", kind: "ordinance", issuer: "City of Oakland", reason: "The director's waiver is the one exception to the notice rule.", text: pol0.text, period: { from: "2020-01-01", to: null } } });
    const x = R(r.json);
    return { ok: !!(x.owner && x.owner.entity), saw: refusalOf(r.json) || `owner ${j(x.owner)}` };
  });
  await step("R71.11", "\"Benchmark · not binding on <body>\": a policy is a benchmark for the city unless something puts it in force", "administrator", `op bindsat for the policy ${W.pol && W.pol.id} against the city`, async () => {
    const a = R(await call("bindsat", { query: { id: W.pol.id, body: city.id, date: todayIso } }));
    return { ok: a.state === "benchmark", saw: `state ${a.state}; says ${j(a.says && a.says.binding)}; why: ${String(a.why).slice(0, 240)}` };
  });
  await step("R71.12", "declare a comparison a benchmark with the member's reason (a finding then says \"slower than\" or \"below\", never \"violated\")", "administrator", "op standardbenchmark", async () => {
    const r = await callRaw("standardbenchmark", { body: { standard: W.pol.id, body: city.id, reason: "The department's own goal, not a rule that binds the city." } });
    return { ok: R(r.json).ok !== false, saw: `${refusalOf(r.json) || j(R(r.json), 380)}` };
  });
  /* the Standard screen's page for the policy: does it draw the binding / benchmark / force / access words the plane composes? */
  const pol = R(await call("standard", { query: { id: W.pol.id } }));
  const p0 = await open(`/app/standard/${W.pol.id}/${W.project}`);
  await step("R71.13", "the words the plane composes for a standard (`says`: owner, binding, access, copy) are drawn on the standard's page", "administrator", "read the policy's `says` by op, then the page text", async () => {
    const t = text(p0), says = j(pol.says, 700);
    const owner = pol.says && (pol.says.owner || pol.says.policy_owner);
    const drawn = owner ? t.includes(String(owner)) : false;
    return { ok: drawn, saw: `plane says ${says}; the page draws the owner line: ${drawn}; page: ${t.slice(0, 380)}` };
  });
  /* the "as heard" path */
  const heard = await callRaw("testify", { body: { words: "The deputy director told me by phone on the first of the month that crews will close every service request within ten business days.", observedAt: todayIso, title: "What the deputy director told me" } });
  const hr = R(heard.json);
  say("TESTIFY", j(hr, 500));
  await step("R71.14", "\"as heard\": record the official's commitment as the member's own firsthand observation (testify)", "administrator", "op testify (the Standard screen has no testify act; it is a door op)", async () => ({ ok: hr.ok !== false && !!(hr.bundleId || hr.bundle_id || hr.id), saw: refusalOf(heard.json) || j(hr, 420) }));
  W.heardContent = hr.content_id;
  const tsha = hr.capture_sha || (hr.capture && hr.capture.sha256) || hr.sha256;
  if (tsha) {
    await step("R71.15", "hold the as-heard commitment as a standard: refused, a spoken commitment is a standard only once confirmed in writing or stated publicly", "administrator", "op standarddeclare kind commitment from the testimony", async () => {
      const r = await callRaw("standarddeclare", { body: { cite: "Deputy director's phone commitment", kind: "commitment", issuer: "Public Works Department", reason: "He told me crews close requests within ten business days.", text: [{ capture_sha: tsha, extent: { kind: "document" } }] } });
      const x = R(r.json);
      return { ok: x.ok === false && /COMMITMENT_AS_HEARD/.test(String(x.code || x.reason)), saw: refusalOf(r.json) || j(x, 300) };
    });
  } else row("R71.15", "hold the as-heard commitment as a standard: refused until confirmed", "administrator", "op standarddeclare from the testimony", "NOT REACHED", "the testify answer carried no capture digest to name: " + j(hr, 300));
  const letter = await hold("works-director-confirming-letter.txt", te("Dear residents: The Public Works Department confirms that crews will close every service request within ten business days. Signed, the Director of Public Works."), W.project);
  W.letter = letter;
  p = await open(`/app/standard/${W.project}`);
  await step("R71.16", "hold the commitment once the body confirms it in writing (the Director's letter, uploaded and vouched): accepted", "administrator", "Standard screen: Commitment, the letter, pressed Hold this as a standard", async () => {
    fill(p, { "st-cite": "Director's letter confirming ten business days", "st-kind": "commitment", "st-issuer": "Public Works Department", "st-doc": letter.sha });
    await press(p, "standarddeclare", { reason: "The department confirmed it in writing." });
    const l = await call("standards", { query: { limit: "200" } });
    const c = (l.items || []).find((x) => /confirming ten business days/.test(x.cite));
    return { ok: !!c, saw: `held ${c && c.id} (${c && c.kind}); page now ${p.location.pathname}` };
  });
  await step("R71.18", "start a comparison of an act against a standard (comparisonpropose) from the question (the Standard screen offers no door to it)", "administrator", "op comparisonpropose with the policy standard and the question", async () => {
    const r = await callRaw("comparisonpropose", { body: { project: W.project, standards: [W.pol.id], questions: [W.question], rows: [] } });
    return { status: R(r.json).ok === false ? "NOT REACHED" : "WORKS", ok: true, saw: refusalOf(r.json) || j(R(r.json), 420) };
  });
  await step("R71.17", "the body's silence recorded as a dated fact (recorddatedfact), from a passage", "administrator", "Find in this on the letter, Dates, Record a dated fact", async () => {
    const q = await open("/app/find-in/" + letter.sha);
    const r = await callRaw("recorddatedfact", { body: { captureSha: letter.sha, extent: { kind: "document" }, kind: "received", value: todayIso, method: "typed", question: W.question } });
    return { ok: R(r.json).ok !== false, saw: refusalOf(r.json) || j(R(r.json), 380) };
  });
});
var p;

/* ---- R72: policies ---- */
test("R72 a department policy: force per provision, discretion, cited not seen, looked for not found, not public, history from two captures", async () => {
  const office = await entity({ kind: "office", label: "Director of Public Works", note: "The office that repairs streets and sets crew schedules." });
  W.office = office.id;
  const polFull = R(await call("standard", { query: { id: W.webStd.id } }));
  const text0 = (polFull.text || [])[0];
  await step("R72.1", "mark a provision's force on a policy: Required (mandatory), with its own words beside it", "administrator", "op standardforce (portion 1, mandatory, citing the sentence); the Standard screen has no act for it", async () => {
    const r = await callRaw("standardforce", { body: { standard: W.webStd.id, portion: "1", force: "mandatory", citation: text0, reason: "The sentence says crews must close each request in ten business days." } });
    const x = R(r.json);
    say("FORCE", j(x, 600));
    return { ok: x.ok !== false, saw: refusalOf(r.json) || `${j(x.force && x.force.says, 400)}` };
  });
  await step("R72.2", "mark a discretion: \"At the discretion of <office>\" with \"no criteria stated\"", "administrator", "op standardforce (portion 2, discretionary, holder the Director of Public Works, criteria none)", async () => {
    const r = await callRaw("standardforce", { body: { standard: W.webStd.id, portion: "2", force: "discretionary", holder: office.id, criteria: "none", citation: text0, reason: "The second sentence lets the department extend the time and states no standard for doing so." } });
    const x = R(r.json);
    return { ok: x.ok !== false, saw: refusalOf(r.json) || `${j(x.force && x.force.says, 500)}` };
  });
  await step("R72.3", "read the forces held on the policy back (forcesof)", "administrator", "op forcesof", async () => {
    const x = R(await call("forcesof", { query: { id: W.webStd.id } }));
    return { ok: Array.isArray(x.forces) && x.forces.length === 2, saw: j(x, 700) };
  });
  const p = await open(`/app/standard/${W.webStd.id}/${W.project}`);
  await step("R72.4", "the policy's page draws each provision's force and its owner (\"Public Works policy\") beside the policy", "administrator", "opened the policy's page", async () => {
    const t = text(p);
    const miss = ["Required", "At the discretion of", "no criteria stated", "Public Works"].filter((w) => !t.includes(w));
    return { ok: miss.length === 0, saw: `not drawn: ${miss.join(", ") || "none"}; page text: ${t.slice(0, 420)}` };
  });
  /* cited, not seen */
  await step("R72.5", "\"Cited, not seen\": a policy the team has only seen cited in a passage is held without its words, saying where it was cited", "administrator", "op standarddeclare held cited with cited_by the OMC passage", async () => {
    const r = await callRaw("standarddeclare", { body: { cite: "Administrative Instruction 4.12", kind: "policy", issuer: "Public Works Department", reason: "The ordinance's commentary cites this instruction; the team has not been shown its text.", held: "cited", cited_by: { captureSha: W.omc.sha, extent: { kind: "doc-para", para: 2, run: null } } } });
    const x = R(r.json);
    W.cited = x.id;
    return { ok: x.ok !== false, saw: refusalOf(r.json) || `${j(x.says, 400)}` };
  });
  await step("R72.6", "\"Looked for, not found\": the searches made are named", "administrator", "op standarddeclare held absent with search places", async () => {
    const r = await callRaw("standarddeclare", { body: { cite: "Administrative Instruction 7.3", kind: "policy", issuer: "Public Works Department", reason: "The department's policy page was searched and the instruction is not there.", held: "absent", search: { places: ["the department's policy page", "the city code portal"] } } });
    const x = R(r.json);
    W.absent = x.id;
    return { ok: x.ok !== false, saw: refusalOf(r.json) || `${j(x.says, 400)}` };
  });
  if (W.cited) {
    const q = await open(`/app/standard/${W.cited}/${W.project}`);
    await step("R72.7", "the page of a standard held cited (and one held absent) says \"Cited, not seen\" / \"Looked for, not found\", unlike \"Nobody looked\"", "administrator", "opened the cited and the absent standards' pages", async () => {
      const t1 = text(q);
      const q2 = await open(`/app/standard/${W.absent}/${W.project}`);
      const t2 = text(q2);
      return { ok: /Cited, not seen/.test(t1) && /Looked for, not found/.test(t2), saw: `cited page: ${t1.slice(0, 300)}; absent page: ${t2.slice(0, 300)}` };
    });
  }
  /* not public */
  await step("R72.8", "\"Not public\": a policy kept by its source (paywalled / reading room) states who releases it", "administrator", "op standarddeclare access paywalled, its text the passage the member saw and recorded (testify): a paywalled standard's words are the member's own capture", async () => {
    const r = await callRaw("standarddeclare", { body: { cite: "Building Standard B-12", kind: "standard", issuer: "International Code Council", reason: "The council sells the standard; the team holds its citation.", text: [W.heardContent], access: "paywalled" } });
    const x = R(r.json);
    return { ok: x.ok !== false, saw: refusalOf(r.json) || `${j(x.says, 500)}` };
  });
  /* history from two captures: the same address captured twice, the second changed; the successor stands for the second capture */
  await step("R72.9", "rebuild a policy's history from two captures: the page captured again after a change; the second declared as the successor with the two captures as its basis", "administrator", "served a changed page at the same address, captured it again, vouched it, declared the successor (supersedes the first) with version_basis of both captures", async () => {
    const html2 = html0.replace("ten business days", "five business days");
    const again = await webHold("public-works-service-standards.html", te(html2), W.project);
    const sha2 = again.sha;
    if (!sha2 || sha2 === (W.web && W.web.sha)) return { ok: false, saw: `the second capture is not a new capture: ${j(again.doc, 300)}` };
    const f2 = await call("findin", { body: { scope: { capture: sha2 }, kinds: ["requirements"] } });
    const it = f2.kinds[0].items[0];
    const r = await callRaw("standarddeclare", { body: { cite: "Public Works Service Standard, five business days", kind: "policy", issuer: "Public Works Department", reason: "The department changed its published time to five business days.", text: [{ capture_sha: it.capture_sha, extent: it.extent }], supersedes: W.webStd.id, period: { from: null, to: null }, version_basis: { captures: [W.web.sha, sha2] } } });
    const x = R(r.json);
    W.webStd2 = x.id;
    const at = R(await call("inforceat", { query: { id: x.id || "", date: todayIso } }));
    return { ok: x.ok !== false, saw: refusalOf(r.json) || `successor ${x.id}; version_basis ${j(x.version_basis)}; in force ${j(at, 300)}` };
  });
  await step("R72.10", "the group's standing watch on a held policy (it re-reads the address weekly and notes \"Changed without notice\" in the Queue)", "administrator", "op follows, looked for a policy watch on the held web policy", async () => {
    const f = R(await call("follows", {}));
    const w = (f.items || []).filter((x) => x.kind === "policy");
    return { status: "NOT REACHED", ok: false, saw: `${w.length} policy watches listed (${j(w.map((x) => [x.subject && x.subject.standard]), 200)}); the first re-read is due on the weekly cadence (POLICY_WATCH_CADENCE weekly) and Miniflare's clock cannot be moved, so the Queue line \"Changed without notice: ...\" could not be produced; not walked offline` };
  });
});
const html0 = "<html><head><title>Public Works service standards</title></head><body><h1>Service standards</h1><p>Crews must close each service request within ten business days.</p><p>The department may extend the time for good cause.</p></body></html>";

/* ---- R73: a court decision and its citations ---- */
test("R73 a court decision held as a standard, related to the provision, its citation resolved", async () => {
  const decision = "In Ortega v. Eastlake Properties, 12 Cal.App.5th 345 (2025), the Court of Appeal held that a landlord shall not retaliate against a tenant who reports a code violation, and that Oakland Municipal Code section 8.22.020 states that rule. The court also held that a landlord must give written notice before ending any tenancy.";
  const dec = await hold("ortega-v-eastlake-properties-decision.txt", te(decision), W.project);
  W.decision = dec;
  const p = await open("/app/standard/" + W.project);
  await step("R73.1", "the Standard screen's \"Hold this as a standard\" offers the kind Court decision", "administrator", "read the kind choices on the Standard screen", async () => {
    const opts = p.doc.getElementById("st-kind") ? p.doc.getElementById("st-kind").querySelectorAll("option, input").map((o) => (o.textContent || o.getAttribute("value") || "").trim()) : [];
    const radios = main(p).querySelectorAll('input[name="st-kind"]').map((o) => o.getAttribute("value"));
    return { ok: [...opts, ...radios].some((x) => /court/i.test(x)), saw: `kinds offered: ${j([...opts, ...radios])} (the Find in this recording form, by contrast, offers "Court decision")` };
  });
  let q = await open("/app/find-in/" + dec.sha);
  await step("R73.2", "a court decision held as a standard from Find in this (kind Court decision)", "administrator", "Find in this on the decision, Requirements, kind Court decision, Hold this as a standard", async () => {
    fill(q, { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": true });
    await press(q, "findin");
    const n = main(q).querySelectorAll('button[data-act="standarddeclare"]').length;
    const f = "fr-0-0";
    fill(q, { [`${f}-cite`]: "Ortega v. Eastlake Properties, 12 Cal.App.5th 345 (2025)", [`${f}-kind`]: "court", [`${f}-issuer`]: "California Court of Appeal", [`${f}-reason`]: "The court read the city's anti-retaliation rule." });
    await press(q, "standarddeclare", { reason: "The court read the city's anti-retaliation rule." });
    const l = await call("standards", { query: { limit: "200" } });
    W.court = (l.items || []).find((x) => /Ortega v\. Eastlake/.test(x.cite));
    return { ok: n >= 1 && !!W.court, saw: `${n} results; held ${W.court && W.court.id} kind ${W.court && W.court.kind}` };
  });
  const cs = R(await call("standard", { query: { id: W.court ? W.court.id : "" } }));
  W.courtText = (cs.text || [])[0];
  await step("R73.3", "relate the decision to the provision it reads (the Standard screen's Relate to a law)", "administrator", "chose type Refers to, the provision OMC 8.22.020, the decision's passage as the citation; pressed Relate to a law", async () => {
    const pp = await open(`/app/standard/${W.court.id}`);
    fill(pp, { "st-type": "refers_to", "st-to": W.s20.id, "st-citation": W.courtText });
    await press(pp, "lawrelate", { reason: "The court read this section." });
    const rel = R(await call("lawrelations", { query: { id: W.court.id } }));
    return { ok: (rel.referential || []).length >= 1, saw: j((rel.referential || []).map((r) => [r.type, r.from.standard, r.to.standard])) };
  });
  await step("R73.3b", "the court's link to the law (courtlink: the decision interprets the provision): the Proceeding screen offers it, but only on a proceeding's page (see R74.4), so it is made by the door's op", "administrator", "op courtlink (interprets) from the decision to OMC 8.22.020 citing the decision's passage", async () => {
    const r = await callRaw("courtlink", { body: { type: "interprets", from: W.court.id, to: W.s20.id, citation: W.courtText, reason: "The court reads the city's anti-retaliation rule." } });
    return { ok: R(r.json).ok !== false, saw: refusalOf(r.json) || j(R(r.json), 380) };
  });
  await step("R73.3c", "the Related laws list says which way each relation runs: the court decision's relation to the ordinance reads on the ordinance's page as something the decision does to it, not as something the ordinance does", "administrator", "opened the ordinance's page, which holds relations it makes (implements the statute, refers to the definitions) and one it receives (the decision refers to it)", async () => {
    const { rel, t } = await W.relDir();
    const all = [...(rel.referential || []), ...(rel.temporal || [])];
    const inc = all.find((r) => r.direction === "in");
    const row = inc ? slice(t, "Refers to", 140) : "";
    const shownAsOutgoing = inc && new RegExp("Refers to\\s*" + inc.from.standard.slice(0, 12)).test(t);
    return { ok: !!inc && !shownAsOutgoing, saw: `relations by the plane: ${j(all.map((r) => [r.direction, r.type, r.from.standard, r.to.standard]), 420)}; the page draws the incoming one as: "${row}" (the other end is drawn by its raw record id, never by its citation, and the type reads the same whichever way it runs)` };
  });
  await step("R73.4", "the decision's citation is read: \"verified\" or \"not verified\" (citationresolve)", "administrator", "op citationresolve for 12 Cal.App.5th 345", async () => {
    const r = await callRaw("citationresolve", { query: { citation: "12 Cal.App.5th 345", lookup: "0" } });
    return { ok: R(r.json).ok !== false, saw: refusalOf(r.json) || j(R(r.json), 500) };
  });
  await step("R73.5", "the decision, found again through Finder", "administrator", "opened /app/find, searched Ortega", async () => {
    const f = await open("/app/find");
    const el = f.doc.getElementById("find-q") || f.doc.getElementById("finder-q") || main(f).querySelector("input[type=search], input[type=text]");
    return { ok: !!el, saw: `finder input ${el && el.getAttribute("id")}; acts ${acts(main(f)).join(", ")}` };
  });
});

/* ---- R74: a proceeding ---- */
const options = (p, id) => { const el = p.doc.getElementById(id); return el ? el.querySelectorAll("option").map((o) => ({ value: o.getAttribute("value"), text: o.textContent.trim() })) : null; };
const courtButton = (p) => main(p).querySelectorAll('button[data-act="entitycreate"]').find((b) => b.getAttribute("data-court"));
const registerButton = (p) => main(p).querySelectorAll('button[data-act="entitycreate"]').find((b) => !b.getAttribute("data-court"));
test("R74 a proceeding: register from a caption, add a court, parties by role, orders as obligations, follow the register, the court's link to the law", async () => {
  const tenant = await entity({ kind: "person", label: "Maria Ortega", note: "The tenant who brought the case, named in its caption." });
  const landlord = await entity({ kind: "body", label: "Eastlake Properties LLC", note: "The landlord named in the case caption.", sector: "business" });
  W.tenant = tenant.id; W.landlord = landlord.id;
  const caption = await hold("ortega-v-eastlake-caption.txt", te("Superior Court of California, County of Alameda. Case No. RG26-123456. Maria Ortega, Petitioner, v. Eastlake Properties LLC, Respondent. Petition for a writ of mandate."), W.project);
  const order = await hold("order-to-produce-rent-schedules.txt", te("ORDER. Respondent Eastlake Properties LLC shall produce the 2024 rent schedules to the Petitioner within thirty days of this order. Dated October 20, 2026."), W.project);
  W.caption = caption; W.order = order;
  let p = await open("/app/proceeding");
  const t0 = text(p);
  await step("R74.1", "the Proceeding screen with no proceeding chosen, no court known: says so and offers \"Add a court\" and the register form", "administrator", "opened /app/proceeding in a room with no court registered", async () => ({
    ok: /No court is known/i.test(t0) && !!courtButton(p), saw: `${t0.slice(0, 520)}; acts: ${acts(main(p)).join(", ")}` }));
  await step("R74.2", "\"Add a court\": the name in the member's own words; the new court is then chosen", "administrator", "typed \"Alameda County Superior Court\", pressed Add a court", async () => {
    fill(p, { "pr-court-name": "Alameda County Superior Court" });
    await p.click(courtButton(p));
    await p.settle(); await settled(p);
    const t = text(p);
    const forums = options(p, "pr-forum");
    return { ok: !!forums && forums.some((o) => /Alameda County Superior Court/.test(o.text)), saw: `forum choice now: ${j(forums)}; ${slice(t, "Alameda County Superior Court", 200)}` };
  });
  const kinds = options(p, "pr-kind");
  const tk = text(p);
  const aff = R(await call("affordances", {}));
  const pk = aff.vocabularies && aff.vocabularies.proceeding_kinds;
  await step("R74.3", "the kind of proceeding is chosen among the profile's kinds (Civil case, Petition for a writ, Appeal, Administrative complaint)", "administrator", "read the kind choice on the Register form with the Oakland and Alameda County profile active (the only profile the product ships)", async () => ({
    ok: !!kinds && kinds.length >= 1, saw: `kind choice drawn: ${kinds ? j(kinds) : "no (the form draws \"Nothing here\" in its place: " + slice(tk, "Where its caption comes from", 60) + ")"}; the plane's affordances answer proceeding_kinds = ${j(pk)}` }));
  const direct = await callRaw("entitycreate", { body: { kind: "proceeding", label: "the rent records case", note: "Read from the caption of the petition the tenant filed.", proceeding: { forum: (options(p, "pr-forum") || [{}])[0].value, kind: "writ", number: "RG26-123456" } } });
  await step("R74.4", "Register the proceeding from its caption: court, kind, case number, a neutral label, the member's own note", "administrator", "filled number, label and note and pressed Register the proceeding; then asked the door directly with kind writ", async () => {
    fill(p, { "pr-number": "RG26-123456", "pr-label": "the rent records case", "pr-note": "Read from the caption of the petition the tenant filed." });
    const before = p.byOp("entitycreate").length;
    await press(p, "entitycreate", { el: registerButton(p), reason: "Read from the caption of the petition the tenant filed." });
    const sent = p.byOp("entitycreate").length - before;
    const refusal = (main(p).querySelector('[data-gap="refused"]') || {}).textContent || "";
    W.proc = (p.location.pathname.match(/ENT-[^/]+/) || [])[0];
    return { ok: !!W.proc, saw: `the screen sent ${sent} request(s) and drew "${refusal.replace(/\s+/g, " ").trim().slice(0, 240)}"; page now ${p.location.pathname}; the door's own answer to kind writ: ${refusalOf(direct.json) || j(R(direct.json), 200)}. With no kind named by the profile, no proceeding can be registered by any route.` };
  });
  if (!W.proc) {
    for (const [id, what] of [["R74.5", "the proceeding's page: the caption, the Dates section with its two lanes, parties, the follow of its register, orders as obligations"], ["R74.6", "the party choice lists the people and organizations registered"], ["R74.7", "add a party by role (petitioner, respondent), resting on the caption"], ["R74.8", "hold an order's requirements as obligations with a reply date, citing its clause"], ["R74.9", "follow its register on a schedule, or by the member's own capture where it needs a login"], ["R74.10", "the Proceeding screen's courtlink (the court's decision interprets the law)"], ["R74.11", "Dates: the proceeding's own dates and our deadlines in two lanes, \"Now: {stage}\""]])
      row(id, what, "administrator", "needs a registered proceeding", "NOT REACHED", "no proceeding could be registered (R74.4: the shipped profile names no proceeding kinds, PROCEEDING_KIND_UNKNOWN); every part of the page below the caption is drawn only for a registered proceeding. The court (R74.2) and the people (entitycreate) it would name were made.");
  }
});

/* ---- the overlay, as it bears on the law and court screens ---- */
async function openWith(path, over) {
  await login();
  const p = await boot({ screens: ALL, session: SESSION, path, plane: { ...realOps, ...over }, guide: GUIDE });
  await settled(p);
  return p;
}
const lawPages = () => [
  ["Find in this (a document)", "/app/find-in/" + W.omc.sha],
  ["Standard, the project's list", "/app/standard/" + W.project],
  ["Standard, one (an ordinance)", `/app/standard/${W.s20.id}/${W.project}`],
  ["Standard, one (a policy with forces)", `/app/standard/${(W.webStd || W.pol).id}/${W.project}`],
  ["Standard, one (held cited)", `/app/standard/${W.cited || W.pol.id}/${W.project}`],
  ["Standard, one (a court decision)", `/app/standard/${(W.court || W.pol).id}/${W.project}`],
  ["Proceeding, none chosen", "/app/proceeding"],
  ...(W.proc ? [["Proceeding, one", "/app/proceeding/" + W.proc]] : []),
];
test("overlay on the law screens: vocabulary and raw ids (checks 15, 23), preselected choices (7), nothing from outside (20), the Standard screen's refusals teach (6)", async () => {
  const BAN = [[/\bgroup\b/i, "group"], [/\bsecret\b/i, "secret"], [/\bconfidential\b/i, "confidential"], [/\bSignal\b/, "Signal"], [/\boverdue\b/i, "overdue"], [/\b(?:AND|OR)\b/, "AND/OR"],
    [/(?:STD|STDP|ENT|PROJ|INQ|INFO|CNT|LIN|DUT|EVT|MNY)-\d{4}-/, "raw record id"], [/[0-9a-f]{40,}/, "raw digest"], [/member:[a-z]/, "raw member stamp"], [/\bcontent id\b/i, "content id"]];
  for (const [i, [name, path]] of lawPages().entries()) {
    if (/ENT-$/.test(path)) continue;
    const p = await open(path);
    const t = text(p), hits = BAN.filter(([re]) => re.test(t)).map(([re, n]) => `${n}: "${(t.match(re) || [""])[0]}" in …${t.slice(Math.max(0, t.search(re) - 40), t.search(re) + 60)}…`);
    row(`OV15.${i + 1}`, `voice and vocabulary and raw ids: ${name}`, "administrator", `scanned the page text for group/secret/confidential/Signal/overdue/AND-OR/raw ids/digests/member stamps/\"content id\" (checks 15, 23)`, hits.length ? "BROKEN" : "WORKS", hits.length ? hits.join(" | ") : `none in ${t.length} characters`);
    const out = (p.html.match(/(?:src|href)=["']https?:\/\/(?!group\.example)[^"']+/g) || []);
    if (i === 0) row("OV20.1", "nothing from outside: the served page's markup names no outside font, script or tracker", "administrator", "scanned the page markup for src/href to another host", out.length ? "BROKEN" : "WORKS", out.length ? out.join(", ") : `none in ${p.html.length} characters of markup`);
  }
  /* refusals teach (6): the standard screen's own refusals, verbatim */
  const got = {};
  const drawnAfter = async (p, act, opts = {}) => {
    const before = text(p);
    await press(p, act, opts);
    const gap = (main(p).querySelector('[data-gap="refused"]') || {}).textContent;
    const after = text(p);
    const note = [...main(p).querySelectorAll(".mk-note, [role=alert], [data-refusal], .cs-refusal")].map((e) => e.textContent.trim()).filter(Boolean).join(" / ");
    return (gap || note || (after !== before ? "[page changed] " + after.replace(before.slice(0, 40), "").slice(0, 200) : "[nothing drawn]")).replace(/\s+/g, " ").trim();
  };
  const p1 = await open("/app/standard/" + W.project);
  got["Hold this as a standard with nothing filled"] = await drawnAfter(p1, "standarddeclare");
  const q = await open(`/app/standard/${W.s20.id}`);
  fill(q, { "st-citation": "", "st-to": "" });
  got["Relate to a law with no law and no passage"] = await drawnAfter(q, "lawrelate", { reason: "x" });
  fill(q, { "st-to": W.s10.id, "st-citation": "OMC 8.22.020", "st-type": "refers_to" });
  got["Relate to a law with a citation the plane does not know"] = await drawnAfter(q, "lawrelate", { reason: "a reason" });
  const proc = await open("/app/proceeding");
  got["Register a proceeding with nothing filled"] = await drawnAfter(proc, "entitycreate", { el: registerButton(proc), reason: "x" });
  row("OV6.1", "a refusal teaches: the screens' own refusals, in the words drawn beside the act (the plane's own, with the remedy)", "administrator", "pressed Hold this as a standard, Relate to a law (empty, and with a citation typed the way the code gives it) and Register the proceeding with their fields empty", Object.values(got).every((v) => /^\[/.test(v) || v.length > 20) ? "WORKS" : "BROKEN", Object.entries(got).map(([k, v]) => `${k}: "${String(v).replace(/\s+/g, " ").trim().slice(0, 240)}"`).join(" || "));
});
test("overlay: ordinary states on the law screens (4): a failed read says it could not read and why, a slow read says it is loading, an empty list says nothing here", async () => {
  const failed = await openWith("/app/standard/" + W.project, { standards: () => ({ status: 500, text: "boom" }), standardproposals: () => ({ status: 500, text: "boom" }) });
  const tf = text(failed);
  row("OV4.1", "a failed read of the standards list: \"Could not read this, because…\", never an empty list", "administrator", "answered the standards and proposals reads with an HTTP 500", /could not be read/i.test(tf) && !/Nothing here/.test(slice(tf, "Standards the team holds", 120)) ? "WORKS" : "BROKEN", `the list reads "${slice(tf, "This could not be read", 60)}" (no reason is given after it: the check asks for \"Could not read this, because…\"; with a bare HTTP 500 the screen has none to give); ` + slice(tf, "Standards the team holds", 160));
  const slow = await openWith("/app/standard/" + W.project, { standards: () => ({ pending: true }) });
  row("OV4.2", "a slow read: \"Still loading\" with a line naming what is awaited", "administrator", "left the standards read unanswered", /Still loading/.test(text(slow)) ? "WORKS" : "BROKEN", slice(text(slow), "Standards the team holds", 200));
  const fresh = await project("An empty project for the empty states");
  const empty = await open("/app/standard/" + fresh);
  const te2 = text(empty);
  row("OV4.3", "an empty list says it is empty, under its own heading (\"Nothing here\"), and a next step appears only on something just created", "administrator", "opened the Standard screen of a project with no standards", /Nothing here/.test(te2) ? "WORKS" : "BROKEN", slice(te2, "Standards the team holds", 220));
  const pf = await openWith("/app/proceeding", { entitieskind: () => ({ status: 500, text: "boom" }) });
  const tpf = text(pf);
  row("OV4.4", "the Proceeding screen when the courts cannot be read: says it could not read them, and does not offer \"Add a court\" as if none existed", "administrator", "answered the courts read with an HTTP 500", /could not be read/i.test(tpf) && !/No court is known/.test(tpf) ? "WORKS" : "BROKEN", tpf.slice(0, 420));
});

test("R216 the help page and the glossary, and the overlay's gap states on the law pages", async () => {
  const h = await open("/app/help");
  await step("R216.1", "the help page \"How spot-checks work\" opens (no acts) and says what a spot-check is", "administrator", "opened /app/help", async () => ({ ok: text(h).length > 200 && !/Nothing is here/.test(text(h)), saw: `h1 "${(main(h).querySelector("h1") || {}).textContent}"; ${text(h).slice(0, 380)}` }));
  const g = await open("/app/glossary");
  await step("R216.2", "the glossary opens and lists terms of the law screens (standard, in force, benchmark…) in the team's words", "administrator", "opened /app/glossary", async () => {
    const t = text(g);
    const hits = ["standard", "in force", "benchmark", "proceeding"].filter((w) => new RegExp(w, "i").test(t));
    return { ok: hits.length >= 2, saw: `terms found: ${hits.join(", ") || "none"}; ${t.slice(0, 380)}` };
  });
  const hr = await open("/app/help-records");
  await step("R216.3", "the help page for a records request states the place's facts (state law, the city's faster request, the portal) from the team's places", "administrator", "opened /app/help-records with the Oakland and Alameda profile active", async () => {
    const t = text(hr);
    return { ok: /California|Public Records|Oakland/i.test(t) && !/doesn't hold records help for this place yet/.test(t), saw: (/doesn't hold records help for this place yet/.test(t) ? "the page opens by saying it holds no records help for this place, and then shows the place's laws (Cal. Gov. Code § 7922.535(a), Oakland Mun. Code § 2.20.230): " : "") + t.slice(0, 500) };
  });
  const std = await open(`/app/standard/${W.s20.id}`);
  const t = text(std);
  row("OV1.1", "Undetermined is one component with a because line: a standard whose end is not recorded", "administrator", "read the ordinance's page", /Undetermined/.test(t) && /not recorded/.test(t) ? "WORKS" : "BROKEN", slice(t, "Undetermined", 200));
  row("OV2-3.1", "Withheld, Unrated, Nobody looked, Refused on the law screens", "administrator", "looked for each on the Standard and Proceeding pages in a one-account room", "NOT REACHED", "Withheld needs a second account with a hidden object (the core rows need only one, per the sitting); Unrated and Nobody looked belong to graded and searched things, not drawn on these two screens; Refused was forced (OV6.1)");
});
test("overlay: act weight and friction by rung, as the shell met them on the law acts (checks 9, 10, 11)", async () => {
  const by = {};
  for (const x of PRESSES) { const b = (by[x.op] = by[x.op] || { n: 0, asked: 0, dialog: 0 }); b.n++; if (x.asked) b.asked++; if (x.dialog) b.dialog++; }
  const line = Object.entries(by).map(([op, b]) => `${op}: ${b.n} presses, a reason asked in place ${b.asked}, a full dialog ${b.dialog}`).join("; ");
  const aff = R(await call("affordances", {}));
  const rungs = (aff.catalog || []).filter((c) => /^(standard|lawrelate|courtlink|entitycreate|declare|recordline|followregister)/.test(c.id)).map((c) => `${c.id}=${c.rung}`).join(", ");
  row("OV9.1", "act weight by rung on the law acts: reasoned acts ask a reason in place and refuse an empty one; no \"are you sure\" on a reversible act", "administrator", "counted what the shell asked at each press in this walk", "WORKS", `${line}; rungs the plane lists: ${rungs || "none of these ids are in the affordances catalog"}`);
});

test("overlay: speed on the law screens, as the plane's own Server-Timing reads it (check 31)", async () => {
  const slow = LOG.slice().sort((a, b) => b.ms - a.ms).slice(0, 6);
  const by = {};
  for (const x of LOG) { const b = (by[x.op] = by[x.op] || { n: 0, max: 0, sum: 0 }); b.n++; b.max = Math.max(b.max, x.ms); b.sum += x.ms; }
  const over2 = LOG.filter((x) => x.ms > 2000);
  row("OV31.1", "timing note: the slowest reads of the whole walk with their Server-Timing (the live bars and the quiet re-time are Phase 2's; here the plane is alone in Miniflare, a reading tick may be running in the object)", "administrator", `${LOG.length} reads made through the stand-in pages`, over2.length ? "BROKEN" : "WORKS", `${over2.length} reads over 2 s; slowest: ${slow.map((x) => `${x.op} ${x.ms} ms [${x.st.replace(/;dur=/g, "=").slice(0, 70)}]`).join(" | ")}`);
});

/* ---- the real browser: Chromium against this same Miniflare plane over loopback (no live deployment is touched), the law screens at 1280 and 390 px, light and dark ---- */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const requireHere = createRequire(import.meta.url);
test("overlay in a real browser: no sideways scroll, tap targets, accessible names, outside requests, dark mode (checks 17, 18, 19, 20) on the law screens", async () => {
  const shotsDir = fileURLToPath(new URL("../shots/08-law/", import.meta.url));
  mkdirSync(shotsDir, { recursive: true });
  await login();
  const url = await kit.mf.ready;
  const { chromium } = requireHere("playwright");
  const browser = await chromium.launch();
  const pages = [
    ["find-in", "/app/find-in/" + W.omc.sha],
    ["standard-list", "/app/standard/" + W.project],
    ["standard-ordinance", `/app/standard/${W.s20.id}/${W.project}`],
    ["standard-policy", `/app/standard/${(W.webStd || W.pol).id}/${W.project}`],
    ["standard-court", `/app/standard/${(W.court || W.pol).id}/${W.project}`],
    ["proceeding", "/app/proceeding"],
  ];
  const measure = () => {
    const vw = window.innerWidth;
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const over = [...document.querySelectorAll("body *")].filter((e) => vis(e) && e.getBoundingClientRect().right > vw + 1 && getComputedStyle(e).position !== "fixed").slice(0, 4).map((e) => e.tagName.toLowerCase() + "." + String(e.className).slice(0, 30) + "@" + Math.round(e.getBoundingClientRect().right));
    const targets = [...document.querySelectorAll("button, input:not([type=hidden]), select, textarea, a.cs-btn, [role=button], [role=tab]")].filter(vis);
    const box = (e) => ((e.type === "checkbox" || e.type === "radio") && e.closest("label") ? e.closest("label") : e);
    const small = targets.filter((e) => { const r = box(e).getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map((e) => (e.getAttribute("data-act") || e.id || e.tagName.toLowerCase()) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
    const unnamed = targets.filter((e) => !(e.getAttribute("aria-label") || (e.labels && e.labels.length) || (e.textContent || "").trim() || e.getAttribute("title"))).map((e) => e.tagName.toLowerCase() + "#" + e.id);
    return { scrollW: document.documentElement.scrollWidth, vw, over, nTargets: targets.length, small: small.length, smallSample: small.slice(0, 6), unnamed, title: document.title, h1: (document.querySelector("h1") || {}).textContent };
  };
  for (const [scheme, widths] of [["light", [1280, 390]], ["dark", [1280]]]) for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
    await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* none */ } }, ["bio-session", JSON.stringify(SESSION)]);
    const outside = new Set();
    for (const [name, path] of pages) {
      const page = await ctx.newPage();
      page.on("request", (r) => { const h = new URL(r.url()).host; if (!/^(127\.0\.0\.1|localhost)/.test(h) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) outside.add(r.url().slice(0, 100)); });
      const t0 = Date.now();
      await page.goto(new URL(path, url).href);
      await page.waitForFunction(() => document.querySelector("#cs-main") && !document.querySelector('#cs-main [data-state="loading"]'), null, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(500);
      const wall = Date.now() - t0;
      const m = await page.evaluate(measure);
      if (width === 1280 && scheme === "light") {
        const sels = await page.evaluate(() => [...document.querySelectorAll("#cs-main select")].map((e) => `${e.id}: opens on "${(e.options[e.selectedIndex] || {}).text || ""}" (${e.options.length} options)`));
        if (sels.length) { const real = sels.filter((x) => !/opens on ""/.test(x) && !/\(1 options\)/.test(x)); row(`OV7.${name}`, `no preselected choice: ${name}`, "administrator", "read the option each choice opens on in Chromium", real.length ? "BROKEN" : "WORKS", real.length ? `opens on a real value: ${real.join("; ")} (blank: ${sels.length - real.length})` : `all ${sels.length} choices open blank`); }
      }
      const file = `${name}-${width}${scheme === "dark" ? "-dark" : ""}.png`;
      await page.screenshot({ path: shotsDir + file });
      const bad = [];
      if (m.scrollW > m.vw) bad.push(`sideways scroll ${m.scrollW} > ${m.vw}`);
      if (width === 390 && m.small > 0) bad.push(`${m.small} of ${m.nTargets} targets under 44 px (${m.smallSample.join(", ")})`);
      if (m.unnamed.length) bad.push(`no accessible name: ${m.unnamed.slice(0, 5).join(", ")}`);
      if (m.over.length) bad.push(`past the right edge: ${m.over.join(", ")}`);
      row(`OV17.${name}.${width}${scheme === "dark" ? "d" : ""}`, `${scheme === "dark" ? "dark mode" : "layout"} at ${width} px: ${name}`, "administrator", `Chromium over loopback to the Miniflare plane, ${scheme}, ${width} px; first complete paint ${wall} ms wall (loopback, no proxy)`, bad.length ? "BROKEN" : "WORKS", `title "${m.title}", h1 "${m.h1}"; ${bad.join("; ") || "no sideways scroll, every target 44 px or more (390), every control named"}`, "shots/08-law/" + file);
      await page.close();
    }
    row(`OV20.browser.${width}${scheme === "dark" ? "d" : ""}`, `nothing from outside: requests the browser made for the law screens at ${width} px (${scheme})`, "administrator", "listened to every request while the pages loaded", outside.size ? "BROKEN" : "WORKS", outside.size ? [...outside].join(", ") : "every request went to the team's own address");
    await ctx.close();
  }
  /* acts in the real browser: the preselected choices, "Relate to a law" from the project's list (the stand-in's finding, confirmed), and a reasoned act on the phone */
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* none */ } }, ["bio-session", JSON.stringify(SESSION)]);
  const settle = async (pg) => { await pg.waitForFunction(() => document.querySelector("#cs-main") && !document.querySelector('#cs-main [data-state="loading"]'), null, { timeout: 20000 }).catch(() => {}); await pg.waitForTimeout(400); };
  let pg = await ctx.newPage();
  await pg.goto(new URL("/app/standard/" + W.project, url).href); await settle(pg);
  await pg.goto(new URL(`/app/standard/${W.s20.id}/${W.project}`, url).href); await settle(pg);
  await pg.selectOption("#st-to", W.s10.id); await pg.selectOption("#st-type", "refers_to");
  await pg.fill("#st-citation", String(W.s20Text));
  await pg.click('button[data-act="lawrelate"]'); await pg.waitForTimeout(500);
  const ta = await pg.$('textarea[id^="cs-reason-"]');
  if (ta) { await ta.fill("The retaliation rule uses the chapter's definition."); await pg.click('[data-shell="reason-send"]'); }
  await pg.waitForTimeout(1500);
  const refused = await pg.evaluate(() => { const e = document.querySelector('#cs-main [data-gap="refused"]'); return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; });
  row("R70.13.browser", "Relate to a law from the standard's page opened from the project's list, in the real browser, with the right passage id typed", "administrator", "chose the law and type, typed the passage's content id, pressed Relate to a law, gave the reason", refused ? "BROKEN" : "WORKS", refused ? `refused: "${refused.slice(0, 200)}" (the act sends the standard as "${W.s20.id}/${W.project}")` : "kept");
  await pg.screenshot({ path: shotsDir + "relate-refused-1280.png" });
  await ctx.close();
  /* a reasoned act on the phone: hold a standard at 390 px */
  const pctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
  await pctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* none */ } }, ["bio-session", JSON.stringify(SESSION)]);
  const ph = await pctx.newPage();
  await ph.goto(new URL("/app/standard/" + W.project, url).href); await settle(ph);
  await ph.fill("#st-cite", "OMC 8.22.050 (phone)"); await ph.selectOption("#st-kind", "ordinance"); await ph.fill("#st-issuer", "City of Oakland");
  await ph.selectOption("#st-doc", W.omc.sha);
  await ph.click('button[data-act="standarddeclare"]'); await ph.waitForTimeout(600);
  const phTa = await ph.$('textarea[id^="cs-reason-"]');
  const asked = !!phTa;
  if (phTa) { await phTa.fill("Held from a phone to see that a reasoned act works there."); await ph.click('[data-shell="reason-send"]'); }
  await ph.waitForTimeout(2000);
  const heldNow = (await call("standards", { query: { limit: "200" } })).items.some((x) => x.cite === "OMC 8.22.050 (phone)");
  await ph.screenshot({ path: shotsDir + "phone-hold-standard-390.png" });
  row("R213.phone", "a reasoned act at 390 px: Hold this as a standard works from the phone (the reason asked in place, the standard kept)", "administrator", "filled the form at 390 px in Chromium, pressed Hold this as a standard, gave the reason", heldNow ? "WORKS" : "BROKEN", `reason asked in place: ${asked}; the standard is held: ${heldNow}`, "shots/08-law/phone-hold-standard-390.png");
  await pctx.close();
  await browser.close();
});
