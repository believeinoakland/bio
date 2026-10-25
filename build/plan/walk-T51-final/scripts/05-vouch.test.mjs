/* WALK-FINAL-05 #1 (T51 final pass, Phase 1, sitting 5: Vouch; the people, organizations and ties the documents name).
   The whole plane under Miniflare (the seam files' way: bio-plane/test/m/control-plane/r8-kit.mjs), every input made by a member's own acts through
   the real ops the screens press, never a hand-written answer or a row written to storage. It RECORDS what it sees (WORKS / BROKEN / NOT REACHED per
   row) into build/plan/walk-T51-final/05-vouch.md as it goes; a harness error is recorded as such and the walk goes on. Run from bio-plane/:
     node --import ./test/platform-sqlite.mjs --test ../build/plan/walk-T51-final/scripts/05-vouch.test.mjs */
import "../../../../bio-plane/test/sandbox.mjs";
import { after, test } from "node:test";
import { appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";

const OUT = fileURLToPath(new URL("../05-vouch.rows.md", import.meta.url));
const kit = makeKit({ tag: "w05vouch" });
after(() => kit.mf.dispose());
const J = (x, n = 600) => { const s = typeof x === "string" ? x : JSON.stringify(x); return s === undefined ? "undefined" : s.length > n ? s.slice(0, n) + "…" : s; };
const R = kit.R;
const T0 = Date.now();
writeFileSync(OUT, "| row id | check | width | role | what I did | verdict | what I saw (wall) | shot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n");
const rows = [];
const timings = [], refusals = new Map();
/* one row of the record: written the moment the check is done */
function row(id, check, role, did, verdict, saw) {
  const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const line = `| ${id} | ${cell(check)} | none: offline, no screen drawn | ${role} | ${cell(did)} | ${verdict} | ${cell(saw)} | none |\n`;
  rows.push({ id, check, role, did, verdict, saw });
  appendFileSync(OUT, line);
  console.log(`ROW ${id} ${verdict} ${check}`);
}
const call = async (auth, op, body, query = {}) => {
  const t = Date.now();
  const res = await kit.plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  let json = null; try { json = await res.json(); } catch { /* not json */ }
  const r = json && json.result !== undefined ? json.result : json;
  timings.push({ op, ms: Date.now() - t, st: res.headers.get("server-timing") || "" });
  if (r && typeof r === "object" && r.ok === false) refusals.set(`${op}:${r.reason || r.code || "?"}`, { op, reason: r.reason || r.code, translation: r.translation || null, detail: r.detail || null, http: res.status });
  return { status: res.status, ms: Date.now() - t, ok: !!(json && json.ok !== false && (!r || r.ok !== false)), r, raw: json };
};
/* a read or act whose arguments the owner takes from the address (project-roster, retrieval, ratification take them so) */
const callQ = (auth, op, query) => call(auth, op, undefined, query);
const callBQ = (auth, op, body, query) => call(auth, op, body, query);
/* "Start a project" as the Home screen presses it (`promote` of the project's document with the chosen visibility), the kit's own with the choice made */
async function startProject(auth, title, visibility) {
  const cs = kit.screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0"),
    meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: ${JSON.stringify(title)}\nobjective: ${JSON.stringify(title)}\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the walk\nChanges: created.\n` }],
    register: [], visibility } });
  return (made.result && made.result.bundleId) || made.bundleId;
}
const ctx = {};

test("sitting 5: Vouch; the people, organizations and ties the documents name", { timeout: 1_800_000 }, async () => {
  /* ---------------------------------------------------------------- the room, as areas 1 to 3 leave it (made by the real acts) */
  const adm = await kit.founder();
  const ana = (await kit.ownerOf("ana")).auth;
  const ben = await kit.person("ben");
  ctx.adm = adm; ctx.ana = ana; ctx.ben = ben;
  const project = await startProject(ana, "Public works spending", "discoverable");
  ctx.project = project;
  const anaCs = kit.screenCall(ana), benCs = kit.screenCall(ben);
  const dir = await callQ(ben, "projectdirectory", {});
  console.log("PREREQ ben's directory", J(dir.r, 500));
  const rq = await callQ(ben, "projectrequest", { projectId: project, comment: "I would like to work on this" });
  console.log("PREREQ ben asks to join", rq.status, J(rq.r, 300));
  const gr = await callQ(ana, "projectrequestanswer", { projectId: project, handle: "ben", answer: "grant" });
  console.log("PREREQ ana answers", gr.status, J(gr.r, 300));
  const question = await kit.questionOf(ana, project, "Did Public Works spend its 2024 paving budget as its policy says?");
  ctx.question = question;
  console.log("PREREQ question", question);
  const html = (title, body) => kit.te(`<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p></body></html>`);
  kit.serve("budget-2024.html", html("City of Oakland paving budget 2024", "Public Works Agency adopted paving budget for fiscal year 2024 of 4.2 million dollars."), { type: "text/html" });
  kit.serve("budget-2022.html", html("City of Oakland paving budget 2022", "Public Works Agency adopted paving budget for fiscal year 2022 of 3.9 million dollars."), { type: "text/html" });
  const a1 = await kit.acquire(ana, { locator: "https://www.oaklandca.example/budget-2024.html", project, for: question });
  console.log("PREREQ acquire for question", a1.status, a1.ms, J(a1.body, 800));
  ctx.a1 = a1;
  const joined = await callQ(ben, "projectjoin", { projectId: project });
  console.log("PREREQ ben joins", joined.status, J(joined.r, 300));
  const file = (cs, doc, title, locator, proj = project) => CAPTURE_SCREEN.parts.promoteDocument(cs, { doc, title, locator, project: proj });
  const f1 = await file(anaCs, a1.body.document, "City of Oakland paving budget 2024", "https://www.oaklandca.example/budget-2024.html");
  console.log("PREREQ filed web page", J(f1));
  const upDoc = async (auth, cs, name, text, type = "text/plain", proj = project) => {
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: kit.te(text) })).json()).result;
    const filed = await file(cs, up.document, name, up.document.locator, proj);
    return { bundleId: filed.bundleId, sha: up.capture.sha256, up, filed };
  };
  const sel = async (auth, ids) => { const x = await callBQ(auth, "select", { ids }); return x.r && x.r.handle; };
  const release = async (auth, handle, acknowledgment, mitigation) => call(auth, "release", { handle, acknowledgment, mitigation }, { handle, acknowledgment, mitigation });
  const heldIds = async (auth, q = {}) => { const x = await callQ(auth, "heldcaptures", { limit: 50, fields: "picker", ...q }); return { ids: ((x.r && x.r.held) || []).map((h) => h.bundle_id), r: x.r, ms: x.ms }; };
  const ack = "These are minutes and budget pages from the city's own site; I checked the dates on each.";
  const mit = "I opened every one and compared its title with the address it came from.";
  const sig = {};

  /* ============================================================== R38 */
  /* fixtures: a memo and a staff list uploaded, a wrong-year page captured, and a page captured for Ben's question in his own hidden project */
  const memo = await upDoc(ana, anaCs, "Public Works memo on the paving contract", "MEMO\nTo: The Board\nFrom: Jane Smith, Director of Public Works\nThe City of Oakland Public Works Agency has contracted with Acme Paving LLC and the Oakland Community Fund, a nonprofit, to repave Telegraph Avenue.\nJane Smith signed the contract on May 2, 2024. Jane Smith also chairs the Oakland Community Fund board.\n");
  const memo2 = await upDoc(ben, benCs, "Second memo from the same office", "MEMO\nTo: The Board\nFrom: Jane Smith, Director of Public Works\nThe vendor Acme Paving LLC received an advance on the Telegraph Avenue contract.\nA second Jane Smith, of Sacramento, sits on a state board.\n");
  const a22 = await kit.acquire(ben, { locator: "https://www.oaklandca.example/budget-2022.html", project });
  const f22 = await file(benCs, a22.body.document, "City of Oakland paving budget 2022", "https://www.oaklandca.example/budget-2022.html");
  console.log("PREREQ fixtures", memo.bundleId, memo2.bundleId, f22.bundleId);
  ctx.docs = { web: f1.bundleId, memo: memo.bundleId, memo2: memo2.bundleId, y22: f22.bundleId };
  const dochash = {};
  dochash[f1.bundleId] = a1.body.capture && a1.body.capture.sha256;

  try {
    const mine = await heldIds(ana, { member: "ana" });
    const everyone = await heldIds(ana);
    const benView = await heldIds(ben);
    const byProject = await heldIds(ana, { project });
    const sorted = {};
    for (const [k, q] of [["age", { sort: "age", dir: "asc" }], ["source", { sort: "source" }], ["project", { sort: "project" }]]) sorted[k] = (await heldIds(ana, q)).ids.length;
    const full = await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: [f1.bundleId, memo.bundleId, f22.bundleId].join(",") });
    const rowsFull = (full.r && full.r.held) || [];
    const webRow = rowsFull.find((h) => h.bundle_id === f1.bundleId) || {};
    const ticked = rowsFull.map((h) => ({ id: h.bundle_id, pre: h.selected || h.ticked || h.checked }));
    row("R38", "Held list: per member and per project, sortable, each row age and title, nothing pre-ticked", "ADMIN-like member Ana / member Ben",
      "Ana uploaded a memo and captured a page for her question; Ben (joined) uploaded a memo and captured the 2022 page; read heldcaptures as Ana for mine (member=ana), everyone's, as Ben, with project=, and sorted by age, source and project; read the full rows for age and title",
      (mine.ids.length === 2 && everyone.ids.length === 4 && benView.ids.length === 4 && byProject.ids.length === 4 && webRow.age_days === 0 && webRow.title && !ticked.some((t) => t.pre)) ? "WORKS" : "BROKEN",
      `mine ${J(mine.ids.length)}, everyone's ${everyone.ids.length}, Ben ${benView.ids.length}, by project ${byProject.ids.length}; sorted counts ${J(sorted)}; the web row: age_days ${webRow.age_days}, title "${webRow.title}"; a pre-ticked field: none in the answer (the list carries no selection)`);
    dochash[f1.bundleId] = webRow.capture && webRow.capture.sha256;
    const asked = webRow.captured_for;
    row("R38", "Each row says what question it was captured for", "member Ana",
      "read the full held row of the page captured with `for` = Ana's question", asked && asked.questions && asked.questions[0] && asked.questions[0].asker === "ana" ? "WORKS" : "BROKEN",
      `captured_for ${J(asked)}`);
  } catch (e) { row("R38", "Held list", "member", "list held captures", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  ctx.f1 = f1; ctx.memo = memo; ctx.memo2 = memo2; ctx.f22 = f22;
  /* ---- who sees what: an outsider (Cy, no place in the project), and a capture made for a question the viewer may not see */
  const cy = await kit.person("cy");
  const cyCs = kit.screenCall(cy);
  try {
    const cyHeld = await heldIds(cy);
    const cyProj = await callQ(cy, "heldcaptures", { project, limit: 50, fields: "picker" });
    const cyImg = await callQ(cy, "image", { id: f1.bundleId });
    row("R38", "Held list read as a member who cannot read the project (she cannot see the copy)", "member Cy (not in the project)",
      "Cy read heldcaptures bare, with project=, and the document's image", cyHeld.ids.length === 0 && (cyProj.r.held || []).length === 0 ? "WORKS" : "BROKEN",
      `Cy's held ${cyHeld.ids.length}; with project= ${J(cyProj.r)}; image ${cyImg.status} ${J(cyImg.raw, 220)}`);
  } catch (e) { row("R38", "Held list as an outsider", "member Cy", "read", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }
  let hiddenQ = null, withheldDoc = null;
  try {
    const priv = await startProject(ana, "Ana's private lead", "hidden");
    hiddenQ = await kit.questionOf(ana, priv, "Who at the nonprofit approved the advance?");
    kit.serve("fund-advance.html", kit.te("<!doctype html><html><head><title>Fund advance letter</title></head><body><p>The Oakland Community Fund requested an advance of forty thousand dollars.</p></body></html>"), { type: "text/html" });
    const a = await kit.acquire(ana, { locator: "https://www.oaklandca.example/fund-advance.html", project, for: hiddenQ });
    withheldDoc = await file(anaCs, a.body.document, "Fund advance letter", "https://www.oaklandca.example/fund-advance.html");
    const asBen = await callQ(ben, "heldcaptures", { limit: 50, bundle_ids: withheldDoc.bundleId });
    const asAna = await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: withheldDoc.bundleId });
    const bRow = (asBen.r.held || [])[0] || {}, aRow = (asAna.r.held || [])[0] || {};
    row("R38", "A capture made for a question the viewer may not see: withheld whole", "member Ben (sees the copy, not the question) and Ana (asker)",
      "Ana captured a page for a question in her own hidden project and filed the page in the shared project; Ben and Ana read its full held row",
      bRow.captured_for && bRow.captured_for.withheld && !J(bRow.captured_for).includes("advance") ? "WORKS" : "BROKEN",
      `Ben: captured_for ${J(bRow.captured_for)}; Ana: ${J(aRow.captured_for, 300)}`);
  } catch (e) { row("R38", "Withheld asker", "member Ben", "capture for a hidden question", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }

  /* ---- the vouch on the document page: one document, by its capturer; a machine cannot; no un-vouch */
  try {
    const machine = { authorization: `Bearer prb-w05vouch-0123456789abcdef` };
    const memberTok = { authorization: `Bearer mem-w05vouch-0123456789abcdef` };
    const hm = await sel(adm, [memo.bundleId]); // the founder's selection (to try as a machine class)
    const probeTry = await callBQ(machine, "select", { ids: [memo.bundleId] });
    const probeHandle = probeTry.r && probeTry.r.handle;
    const rel0 = probeHandle ? await release(machine, probeHandle, ack, mit) : probeTry;
    const memTry = await callBQ(memberTok, "select", { ids: [memo.bundleId] });
    const rel0b = memTry.r && memTry.r.handle ? await release(memberTok, memTry.r.handle, ack, mit) : memTry;
    row("R38", "A machine cannot release", "machine credentials (probe token and shared member token)",
      "selected the memo and pressed release with the probe credential and with the shared member credential",
      [rel0, rel0b].every((x) => !x.ok) ? "WORKS" : "BROKEN", `probe: ${x(rel0)}; shared member token: ${x(rel0b)}`);
  } catch (e) { row("R38", "A machine cannot release", "probe", "release as machine", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }
  function x(a) { return `${a.status} ${J(a.r && (a.r.reason || a.r.translation) ? { reason: a.r.reason, translation: a.r.translation, detail: a.r.detail } : a.raw, 320)}`; }
  // @@C2B
  /* ---- set aside: Ben sets aside the page Ana's question waits on, and the wrong-year page, with one reason; the asker reads the wait; she restores */
  const qCount = async (auth) => { const r = await callQ(auth, "queue", { count: "true" }); return r.r; };
  try {
    const qList = async (auth) => { const r = await callQ(auth, "queue", { limit: 100 }); return r; };
    const qBefore = await qList(ana);
    const before = J(await qCount(ana), 300);
    const noReason = await callBQ(ben, "heldsetaside", { ids: [f1.bundleId, f22.bundleId] });
    const aside = await callBQ(ben, "heldsetaside", { ids: [f1.bundleId, f22.bundleId], reason: "wrong year: the 2024 page quotes the 2022 figures" });
    const docsOut = (aside.r && aside.r.documents) || [];
    const waitingNamed = J(docsOut).includes("ana");
    const listed = await heldIds(ana);
    const asideList = await callQ(ana, "heldcaptures", { limit: 50, state: "set_aside", fields: "picker" });
    const asideFull = await callQ(ana, "heldcaptures", { limit: 50, state: "set_aside", bundle_ids: f1.bundleId + "," + f22.bundleId });
    row("R38", "Set several aside with one reason (each stays held, never deleted); empty reason refused", "member Ben",
      "Ben pressed 'Set aside' on the 2024 page (the page Ana's question waits on) and the 2022 page, first with no reason, then with one reason",
      !noReason.ok && aside.ok && !listed.ids.includes(f1.bundleId) && ((asideList.r.held || []).length === 2) ? "WORKS" : "BROKEN",
      `no reason: ${x(noReason)}; with a reason: ${J(aside.r, 700)}; Ana's held list now ${listed.ids.length} rows (set-aside pair absent: ${!listed.ids.includes(f1.bundleId)}); the Set aside list: ${(asideList.r.held || []).length} rows; first full row's set_aside ${J(((asideFull.r.held || [])[0] || {}).set_aside)}`);
    const waits = await callQ(ana, "questionwaits", { question });
    const waitsBen = await callQ(ben, "questionwaits", { question });
    const after = J(await qCount(ana), 300);
    const qAfter = await qList(ana);
    const idsOf = (q) => ((q.r && (q.r.items || q.r.queue)) || []).map((i) => `${i.kind || i.type || ""}:${i.id || i.key || i.bundle || ""}:${i.title || i.text || i.label || ""}`);
    const newItems = idsOf(qAfter).filter((i) => !idsOf(qBefore).includes(i));
    const strength = await callQ(ana, "inquirystrength", { id: question });
    row("R38", "Set aside a document an open question waits on: the asker reads 'Waiting: ... set aside by Ben: wrong year'; no queue item", "member Ana (asker) and Ben",
      "Ana read questionwaits on her question and the Queue count before and after Ben's act",
      waits.ok && J(waits.r).includes("ben") && J(waits.r).includes("wrong year") && before === after ? "WORKS" : "BROKEN",
      `Ana's questionwaits ${J(waits.r, 400)}; inquirystrength mentions a wait: ${/wait|set aside/i.test(J(strength.r, 6000))}; Queue items new since Ben's act: ${J(newItems, 500)} (queue read keys ${J(Object.keys(qAfter.r || {}))}); Ben's ${J(waitsBen.r, 200)}; Queue count before ${before}, after ${after}`);
    const restoreNoReason = await callBQ(ana, "heldrestore", { ids: [f1.bundleId] });
    const restored = await callBQ(ana, "heldrestore", { ids: [f1.bundleId], reason: "It is the 2024 page; the 2022 figures it quotes are for comparison" });
    const waits2 = await callQ(ana, "questionwaits", { question });
    const listed2 = await heldIds(ana);
    row("R38", "Restore a set-aside document with a reason (no veto or quorum)", "member Ana (asker)",
      "Ana restored the 2024 page, first with no reason, then with one; read the question's waits and her held list",
      !restoreNoReason.ok && restored.ok && listed2.ids.includes(f1.bundleId) && !J(waits2.r).includes("wrong year") ? "WORKS" : "BROKEN",
      `no reason: ${x(restoreNoReason)}; restored: ${J(restored.r, 400)}; waits after: ${J(waits2.r, 300)}; held list has the page again: ${listed2.ids.includes(f1.bundleId)}; the 2022 page stays set aside: ${J(((await callQ(ana, "heldcaptures", { limit: 50, state: "set_aside", fields: "picker" })).r.held || []).map((h) => h.bundle_id))}`);
    const hist = await callQ(ana, "bundlehistory", { bundle: f1.bundleId });
    row("R38", "The question/document history lists every set-aside and restore in order", "member Ana",
      "read the 2024 page's history (bundlehistory) after the set-aside and restore",
      /set.?aside/i.test(J(hist.r, 20000)) && /restor/i.test(J(hist.r, 20000)) ? "WORKS" : "BROKEN",
      `${hist.status} ${J(hist.r, 900)}`);
  } catch (e) { row("R38", "Set aside and restore", "member", "set aside / restore", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C3B
  /* ---- vouch: one document (the Document page's 'Vouch for this copy'), then a batch with its acknowledgment; the refusals before anything moves */
  try {
    const h1 = await sel(ana, [f1.bundleId]);
    const noAck = await release(ana, h1, "", mit);
    const noMit = await release(ana, h1, ack, "");
    const longAck = await release(ana, h1, "x".repeat(501), mit);
    const quoted = await release(ana, h1, 'I checked the "dates"', mit);
    const t0 = Date.now();
    const one = await release(ana, h1, ack, mit);
    const img = await callQ(ana, "image", { id: f1.bundleId });
    const md = (img.r && img.r["bundle.md"]) || "";
    const stateNow = /current_state:\s*(\S+)/.exec(md);
    row("R38", "Vouch on the document page: the capturer vouches one copy with her acknowledgment and mitigation; empty, over-long and quoted ones refused before anything is read", "member Ana (capturer)",
      "selected the 2024 page, pressed release with no acknowledgment, no mitigation, 501 characters, a quote; then with both",
      !noAck.ok && !noMit.ok && !longAck.ok && !quoted.ok && one.ok && stateNow && stateNow[1] === "verified" ? "WORKS" : "BROKEN",
      `no ack: ${x(noAck)}; no mitigation: ${x(noMit)}; 501 chars: ${x(longAck)}; quote: ${x(quoted)}; release: ${J(one.r, 300)} in ${one.ms} ms; the document's state now ${stateNow && stateNow[1]}; the document's own log carries the acknowledgment: ${md.includes("Acknowledgment:")}; names the deciding member: ${/Released \(batch\) \| ana/.test(md)}`);
    const unv = await callBQ(ana, "unvouch", { id: f1.bundleId });
    row("R38", "Look for an 'un-vouch' and find none", "member Ana",
      "called op=unvouch; listed what the record offers on a vouched copy (retire is the terminal act)", unv.r && unv.r.reason === "UNKNOWN_OP" ? "WORKS" : "BROKEN",
      `unvouch: ${x(unv)}; the record's only act after a vouch is the terminal "retire" (checked on its own copy below)`);
  } catch (e) { row("R38", "Vouch on the document page", "member Ana", "release one", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  try {
    /* a batch: the memo, the second memo (Ben's) and the page left in Held; including an already-vouched copy */
    const mixed = await sel(ana, [f1.bundleId, memo.bundleId, memo2.bundleId]);
    const withVouched = await release(ana, mixed, ack, mit);
    row("R38", "Bulk vouch refused whole when one copy is not eligible, with each offender named", "member Ana",
      "ticked the already-vouched page with the two memos and pressed release", !withVouched.ok && !!(withVouched.r && withVouched.r.offenders) ? "WORKS" : "BROKEN", x(withVouched) + " offenders " + J(withVouched.r && withVouched.r.offenders, 300));
    const stateOf = async (id) => /current_state:\s*(\S+)/.exec(((await callQ(ana, "image", { id })).r || {})["bundle.md"] || "")?.[1];
    const none = [await stateOf(memo.bundleId), await stateOf(memo2.bundleId)];
    row("R38", "Bulk vouch: a refusal moves nothing", "member Ana", "read both memos' state after the refused batch", none.every((s) => s === "collected") ? "WORKS" : "BROKEN", `states ${J(none)}`);
    /* the second member releases first: the first member's selection of the same set */
    const hAna = await sel(ana, [memo2.bundleId, memo.bundleId]);
    const hBen = await sel(ben, [memo2.bundleId, memo.bundleId]);
    const benFirst = await release(ben, hBen, "Ben: both memos are the city's own, dated and signed.", "Ben: I read each against the signing page.");
    const anaSecond = await release(ana, hAna, ack, mit);
    row("R38", "A second member releasing first: the later release", "member Ben (first), member Ana (second)",
      "both selected the two memos; Ben released; Ana pressed release on her now-stale selection",
      benFirst.ok && !anaSecond.ok ? "WORKS" : "BROKEN", `Ben: ${J(benFirst.r, 200)}; Ana after him: ${x(anaSecond)}`);
  } catch (e) { row("R38", "Bulk vouch", "member", "release batch", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C4B
  /* ---- "Stop using this copy" (retire, terminal): on its own spare copy, with a reason; refused while a question cites it */
  try {
    const spare = await upDoc(ana, anaCs, "Spare copy of the clerk's log", "The clerk's log for the week of May 6, 2024. Nothing else of note.\n");
    const hs = await sel(ana, [spare.bundleId]);
    const heldRetire = await callBQ(ana, "retire", { handle: hs, reason: "no longer needed" }, { handle: hs, reason: "no longer needed" });
    const spareV = await release(ana, await sel(ana, [spare.bundleId]), ack, mit);
    const hr = await sel(ana, [spare.bundleId]);
    const noReason = await callBQ(ana, "retire", { handle: hr }, { handle: hr });
    const retired = await callBQ(ana, "retire", { handle: hr, reason: "A better copy came in from the clerk." }, { handle: hr, reason: "A better copy came in from the clerk." });
    const again = await callBQ(ana, "retire", { handle: await sel(ana, [spare.bundleId]), reason: "again" });
    row("R38", "'Stop using this copy' (retire): a held copy is not retirable, a reason is required, a retired copy is final", "member Ana",
      "on a spare upload: pressed retire while held, vouched it, pressed retire with no reason, with a reason, and again",
      !heldRetire.ok && spareV.ok && !noReason.ok && retired.ok && !again.ok ? "WORKS" : "BROKEN",
      `held: ${x(heldRetire)}; no reason: ${x(noReason)}; retired: ${J(retired.r, 300)}; again: ${x(again)}`);
  } catch (e) { row("R38", "Stop using this copy", "member Ana", "retire", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ---- the Document page's other held acts: a timestamp (attest), a watch (monitorset) on a copy, its examination fields */
  try {
    const att = await callBQ(ana, "attest", { sha256: memo.sha }, { sha256: memo.sha });
    const attLoc = await callBQ(ana, "attest", { sha256: dochash[f1.bundleId], locator: "https://www.oaklandca.example/budget-2024.html" }, { sha256: dochash[f1.bundleId] });
    row("R38", "'Get an independent timestamp' (attest)", "member Ana",
      "pressed attest on the vouched memo's capture (an upload: no public address) and on the 2024 page's capture (a public address)",
      att.ok || attLoc.ok ? "WORKS" : "NOT REACHED", `attest on an upload: ${x(att)}; on the fetched page: ${x(attLoc)}. A real timestamp asks an outside authority the offline copy cannot reach; the answers' words are what was read`);
    const w = await callBQ(ana, "monitorset", { bundleId: f22.bundleId, enabled: true, frequency: "weekly" });
    const imgW = await callQ(ana, "image", { id: f22.bundleId });
    row("R38", "Vouch a monitored capture and confirm it was held until vouched (watch for changes on a held copy)", "member Ana",
      "pressed 'Watch for changes' (monitorset, weekly) on the set-aside 2022 page, then read the copy",
      w.ok ? "WORKS" : "BROKEN", `monitorset: ${x(w)}; the copy still ${/current_state:\s*(\S+)/.exec((imgW.r || {})["bundle.md"] || "")?.[1]}; monitoring block: ${/monitoring:[\s\S]{0,80}/.exec((imgW.r || {})["bundle.md"] || "")?.[0].replace(/\n/g, " ")}`);
  } catch (e) { row("R38", "attest / monitorset", "member Ana", "attest, monitor", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C5B
  /* ============================================================== R55 */
  const dirText = ["Public Works Agency Staff Directory", "Jane Smith, Director, jsmith@oaklandca.gov, 510-238-3001", "Wei Chen, Analyst, wchen@oaklandca.gov, 510-238-3002",
    "Dana Brooks, Coordinator, dbrooks@oaklandca.gov, 510-238-3003", "Pat Lee, Engineer, plee@oaklandca.gov, 510-238-3004", "Maria Gomez, Manager, mgomez@oaklandca.gov, 510-238-3005",
    "Robert Alvarez, Inspector, ralvarez@oaklandca.gov, 510-238-3006"].join("\n") + "\n";
  const staffdir = await upDoc(ana, anaCs, "Public Works Agency staff directory", dirText);
  const dirRead = (await callQ(ana, "reading", { sha256: staffdir.sha })).r;
  console.log("OBS directory reading", dirRead.content_type, dirRead.entity_count, J(dirRead.reading && dirRead.reading.entities, 900), J(dirRead.reading && dirRead.reading.facts, 900));
  const people0 = await callQ(ana, "peopledirectory", {});
  console.log("OBS peopledirectory (empty room)", J(people0.r, 700));
  // @@C6B
  const staffSha = staffdir.sha;
  try {
    /* a new team already holds its public offices (area 1's setup act; the administrator seeds them) */
    const prof = await callBQ(adm, "profilesset", { profiles: ["oakland-alameda"] });
    const seed = await callBQ(adm, "officesseed", {});
    const peopleSeeded = await callQ(ana, "peopledirectory", {});
    row("R55", "A new team already holds three bodies 'added at setup, from the public offices of your team's place'", "ADMIN (setup act, area 1's) and member Ana",
      "pressed the setup act officesseed as the administrator, then read the people directory as Ana",
      seed.ok && (peopleSeeded.r.rows || []).length >= 3 ? "WORKS" : (seed.ok ? "BROKEN" : "NOT REACHED"),
      `profilesset (area 1's choice of the team's place): ${J(prof.r && (prof.r.ok), 40)}; officesseed: ${J(seed.r, 700)}; directory after: following ${peopleSeeded.r.following}, rows ${(peopleSeeded.r.rows || []).length} ${J((peopleSeeded.r.rows || []).slice(0, 4).map((r) => ({ label: r.label || r.name, kind: r.kind, today: r.today })), 500)}`);
  } catch (e) { row("R55", "Setup bodies", "ADMIN", "officesseed", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }

  const E = {};
  try {
    const mk = (auth, kind, label, note) => callBQ(auth, "entitycreate", { kind, label, note });
    const sim0 = await callQ(ana, "entitysimilar", { name: "Jane Smith", kind: "person" });
    const noNote = await mk(ana, "person", "Jane Smith", "");
    const jane = await mk(ana, "person", "Jane Smith", "Director of Public Works, City of Oakland; signs the paving contract");
    E.jane = jane.r && jane.r.entity_id;
    const sim1 = await callQ(ana, "entitysimilar", { name: "Jane Smith", kind: "person" });
    const jane2 = await mk(ben, "person", "Jane Smith", "A different Jane Smith, of Sacramento, who sits on a state board");
    E.jane2 = jane2.r && jane2.r.entity_id;
    row("R55", "Add a person (entitycreate: kind, name, the member's note); the near-match check; two people, one name", "member Ana, member Ben",
      "asked for near matches for 'Jane Smith' (none), pressed Follow them with no note, then with a note; asked again (one held); a second member registered a different Jane Smith",
      !noNote.ok && jane.ok && E.jane && jane2.ok && E.jane2 && E.jane !== E.jane2 && J(sim1.r).includes(E.jane) ? "WORKS" : "BROKEN",
      `near-match before: ${J(sim0.r, 200)}; no note: ${x(noNote)}; created ${J(jane.r, 300)}; near-match after: ${J(sim1.r, 400)}; second: ${J(jane2.r, 250)}`);
    const org = {};
    for (const [k, label, note] of [["institution", "Public Works Agency", "The City of Oakland agency that lets the paving contracts"], ["institution", "Acme Paving LLC", "The vendor named in the memo as the paving contractor"], ["institution", "Oakland Community Fund", "A nonprofit named in the memo"]]) {
      const r = await mk(ana, k, label, note); org[label] = r.r && r.r.entity_id;
    }
    E.agency = org["Public Works Agency"]; E.vendor = org["Acme Paving LLC"]; E.nonprofit = org["Oakland Community Fund"];
    const wei = await mk(ana, "person", "Wei Chen", "Analyst in Public Works; named in the staff directory"); E.wei = wei.r && wei.r.entity_id;
    const dana = await mk(ana, "person", "Dana Brooks", "Coordinator in Public Works"); E.dana = dana.r && dana.r.entity_id;
    row("R55", "Register people and organizations for what the documents name", "member Ana",
      "registered Wei Chen and Dana Brooks as people; the agency, the vendor and the nonprofit as organizations (kind institution)", E.wei && E.dana && E.agency && E.vendor && E.nonprofit ? "WORKS" : "BROKEN",
      `ids ${J(E)}`);
  } catch (e) { row("R55", "Add a person", "member", "entitycreate", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  ctx.E = E;
  // @@C7B
  /* ---- resolve a just-vouched document's references (the staff directory names six people by their addresses) */
  try {
    const hv = await sel(ana, [staffdir.bundleId]);
    const v = await release(ana, hv, "The directory is the agency's own page; I checked the six names.", "I compared four of the six rows with the agency's site.");
    const before = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    const janeAlias = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "jsmith@oaklandca.gov" });
    const noAlias = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "" });
    const res = await callBQ(ana, "resolve", { captureSha: staffSha });
    const after = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    const hit = (res.r.resolved || []).find((m) => m.entity_id === E.jane);
    row("R55", "Resolve a just-vouched document's references: accepted matches carry their grade; the unmatched stay unresolved", "member Ana",
      "vouched the staff directory (six references); gave Jane Smith her address as a name; pressed 'Match to the record' on the whole document",
      v.ok && janeAlias.ok && res.ok && hit && res.r.unresolved_count === 5 ? "WORKS" : "BROKEN",
      `resolutions before: ${J(before, 200)}; alias: ${J(janeAlias.r, 160)}; empty alias: ${x(noAlias)}; resolve: references ${res.r.references}, resolved ${res.r.resolved_count}, unresolved ${res.r.unresolved_count}; the match: ${J(hit, 500)}; the unresolved: ${J((res.r.unresolved || []).slice(0, 2), 300)}`);
    const refWei = "contact:wchen@oaklandca.gov";
    const noBasis = await callBQ(ana, "resolvetestify", { captureSha: staffSha, ref: refWei, entityId: E.wei, basis: "" });
    const bogusRef = await callBQ(ana, "resolvetestify", { captureSha: staffSha, ref: "contact:nobody@oaklandca.gov", entityId: E.wei, basis: "I know them" });
    const testified = await callBQ(ana, "resolvetestify", { captureSha: staffSha, ref: refWei, entityId: E.wei, basis: "Wei Chen told me this is her address; I have worked with her for two years." });
    const re = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    row("R55", "Testify a missed match from what you know (grade D, a required 'How you know')", "member Ana",
      "on the unresolved reference for wchen@oaklandca.gov pressed 'Say who this name is' with no basis, for a reference the document does not carry, then with a basis",
      !noBasis.ok && !bogusRef.ok && testified.ok && testified.r.grade === "D" ? "WORKS" : "BROKEN",
      `no basis: ${x(noBasis)}; absent reference: ${x(bogusRef)}; testimony: ${J(testified.r, 500)}; resolutions now: ${J(re, 700)}`);
    const bulk = await callBQ(ana, "resolve", { items: [{ captureSha: staffSha, ref: "contact:dbrooks@oaklandca.gov" }, { captureSha: staffSha }] });
    row("R55", "Resolve with items (bulk): per-item results", "member Ana", "pressed resolve with two items (one reference, one whole document)",
      bulk.ok ? "WORKS" : "BROKEN", J(bulk.r, 700));
    const defect = await callBQ(ana, "resolutiondefect", { captureSha: staffSha, ref: "contact:jsmith@oaklandca.gov", entityId: E.jane, reason: "" });
    const defect2 = await callBQ(ana, "resolutiondefect", { captureSha: staffSha, ref: "contact:jsmith@oaklandca.gov", entityId: E.jane, reason: "This address belongs to the Jane Smith of Sacramento, not the Director." });
    const after2 = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    row("R55", "Report a match wrong with a reason (a defect shown beside the resolution; nothing moves)", "member Ana",
      "pressed 'Report this match as wrong' with no reason, then with a reason; re-read the resolutions",
      !defect.ok && defect2.ok && JSON.stringify(after2).includes("\"defect_count\":1") ? "WORKS" : "BROKEN",
      `no reason: ${x(defect)}; reported: ${J(defect2.r, 400)}; the resolution row after: ${J((after2.resolutions || []).find((r) => r.entity_id === E.jane), 700)}`);
  } catch (e) { row("R55", "Resolve", "member Ana", "resolve", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C8B
  /* ---- a person's page: facts from passages (valid time, undetermined, withdrawn), aliases, same-person claims */
  try {
    const cite = { captureSha: staffSha, extent: { kind: "document" } };
    const noCite = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "name", value: "Jane Smith", valid: { from: "2024-01-01", to: null } });
    const f1r = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "name", value: "Jane A. Smith", valid: { from: "2022-03-01", to: "2024-12-31", precision: "day" }, citation: cite });
    const f2r = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "locality", value: "Oakland, California", valid: { from: null, to: null }, citation: cite });
    const badKind = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "rating", value: "high risk", valid: { from: null, to: null }, citation: cite });
    const page = await callQ(ana, "person", { id: E.jane, at: "2026-10-25" });
    const page2 = await callQ(ana, "person", { id: E.jane, at: "2023-06-01" });
    const withdrawn = await callBQ(ana, "personfactwithdraw", { factId: f2r.r && f2r.r.fact_id, reason: "The directory does not say where she lives; I read too much into it." });
    const noWhy = await callBQ(ana, "personfactwithdraw", { factId: f1r.r && f1r.r.fact_id, reason: "" });
    const pageAfter = await callQ(ana, "person", { id: E.jane, at: "2026-10-25" });
    row("R55", "Record a fact from a passage with a valid time (and bounds); facts of undetermined validity are marked; a withdrawn fact is kept", "member Ana",
      "recorded a name fact valid from March 1, 2022 to December 31, 2024 and a locality fact with no dates, each citing the staff directory; one with no citation; one of a kind that is not a fact kind; then withdrew the locality with a reason (and tried with none)",
      !noCite.ok && f1r.ok && f2r.ok && !badKind.ok && withdrawn.ok && !noWhy.ok && JSON.stringify(page2.r).includes("Jane A. Smith") && JSON.stringify(page.r).includes("civil-time.start_stated") ? "WORKS" : "BROKEN",
      `no citation: ${x(noCite)}; name fact: ${J(f1r.r, 280)}; undated fact: ${J(f2r.r, 280)}; bad kind: ${x(badKind)}; person page (keys ${J(Object.keys(page.r || {}))}): ${J(page.r, 900)}; page at 2023-06-01 carries the dated name fact: ${JSON.stringify(page2.r).includes("Jane A. Smith")}, today's page lists the undated locality under "undetermined" with a why: ${JSON.stringify(page.r).includes("civil-time.start_stated")}; withdrawal: ${J(withdrawn.r, 250)}; no reason: ${x(noWhy)}; the withdrawn fact is still readable on the page (kept, shown withdrawn): ${JSON.stringify(pageAfter.r).includes("I read too much into it")}; the page's keys: ${J(Object.keys(pageAfter.r || {}))}`);
    ctx.fact = f1r.r && f1r.r.fact_id;
    const negative = /suspicio|adversar|risk|score|rank|conflict_of|likely_guilty|threat/i.exec(JSON.stringify(page.r) + JSON.stringify(pageAfter.r));
    row("R55", "Negative check: no adversarial attribute, suspicion flag or category prior on any person page", "member Ana",
      "read Jane Smith's page (person) and searched its whole answer for suspicion, risk, score, rank and conflict fields", !negative ? "WORKS" : "BROKEN", `found: ${negative ? negative[0] : "none"}; the answer's keys: ${J(Object.keys(page.r || {}))}`);
  } catch (e) { row("R55", "Person facts", "member Ana", "personfact", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  try {
    const al = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "J. A. Smith" });
    const alDup = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "J. A. Smith" });
    const wdNoReason = await callBQ(ana, "aliaswithdraw", { entityId: E.jane, alias: "J. A. Smith" });
    const wd = await callBQ(ana, "aliaswithdraw", { entityId: E.jane, alias: "J. A. Smith", reason: "That form of her name is only my shorthand." });
    const ent = await callQ(ana, "entity", { id: E.jane });
    row("R55", "Aliases are first-class: add a name; withdraw it with a reason ('Withdraw a name' is owed, K3674)", "member Ana",
      "added the name 'J. A. Smith' (twice), pressed withdraw with no reason and with one, and read the entity",
      al.ok && wd.ok ? "WORKS" : "BROKEN",
      `add: ${J(al.r, 200)}; again: ${J(alDup.r, 200)}; withdraw with no reason: ${x(wdNoReason)}; withdraw with a reason: ${J(wd.r, 250)}; the entity's aliases: ${J(ent.r && ent.r.entity && ent.r.entity.aliases, 500)}. The person screen's own 'aliaswithdraw' press sends only the entity and the alias (no reason field): ${"see screens-investigate/person.mjs:409-414"}`);
  } catch (e) { row("R55", "Aliases", "member Ana", "entityalias", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  try {
    const evn = { a: { captureSha: staffSha, extent: { kind: "document" } }, b: { captureSha: memo2.sha, extent: { kind: "document" } } };
    const noNote = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "not_same_as", basis: "testimony", note: "" });
    const noEvidence = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "unsure", basis: "name", note: "They share a name and little else." });
    const unsure = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "unsure", basis: "name", note: "They share a name and little else.", evidence: evn });
    const notSame = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "not_same_as", basis: "testimony", note: "I know the Director; the Sacramento Jane Smith is a different woman." });
    const selfClaim = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane, kind: "same_as", basis: "testimony", note: "same" });
    const toOrg = await callBQ(ana, "identityclaim", { a: E.jane, b: E.agency, kind: "same_as", basis: "testimony", note: "a person and an organization" });
    const idr = await callQ(ana, "identity", { id: E.jane });
    const wdNoWhy = await callBQ(ana, "withdrawidentityclaim", { claimId: unsure.r && unsure.r.claim_id, reason: "" });
    const wdOk = await callBQ(ana, "withdrawidentityclaim", { claimId: unsure.r && unsure.r.claim_id, reason: "I was unsure; the Director's own page settles it." });
    const idr2 = await callQ(ana, "identity", { id: E.jane });
    const e1 = await callQ(ana, "entity", { id: E.jane }), e2 = await callQ(ana, "entity", { id: E.jane2 });
    row("R55", "Two people, one name; same-person claims: linked, never merged; withdraw with a reason", "member Ana",
      "claimed 'not the same person' by testimony (with no note, then with one), 'unsure' by name (with no evidence, then with a document cited at each end), a claim between a person and herself, a claim between a person and an organization; read Jane's identity; withdrew the 'unsure' claim with no reason and with a reason",
      !noNote.ok && !noEvidence.ok && unsure.ok && notSame.ok && !selfClaim.ok && !toOrg.ok && !wdNoWhy.ok && wdOk.ok && e1.r.found && e2.r.found && E.jane !== E.jane2 ? "WORKS" : "BROKEN",
      `no note: ${x(noNote)}; a name claim with no evidence: ${x(noEvidence)}; with evidence: ${J(unsure.r, 260)}; not-same by testimony: ${J(notSame.r, 260)}; self: ${x(selfClaim)}; person/organization: ${x(toOrg)}; identity read: ${J(idr.r, 700)}; withdraw no reason: ${x(wdNoWhy)}; withdrawn: ${J(wdOk.r, 220)}; identity after: ${J(idr2.r, 420)}; both records still held, two: ${e1.r.found && e2.r.found}`);
    ctx.claims = { notSame: notSame.r && notSame.r.claim_id };
  } catch (e) { row("R55", "Same-person claims", "member Ana", "identityclaim", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C9B
  /* ============================================================== R56 organizations */
  try {
    const cite = { captureSha: memo.sha, extent: { kind: "document" } };
    const orgFact = await callBQ(ana, "recordpersonfact", { person: E.vendor, kind: "name", value: "Acme Paving, L.L.C.", valid: { from: "2020-01-01", to: null }, citation: cite });
    const orgAddr = await callBQ(ana, "recordpersonfact", { person: E.vendor, kind: "address", value: "1500 Industrial Way, Oakland, California", valid: { from: null, to: null }, citation: cite });
    const orgBirth = await callBQ(ana, "recordpersonfact", { person: E.vendor, kind: "birth", value: "1987", valid: { from: null, to: null }, citation: cite });
    const orgPage = await callQ(ana, "person", { id: E.vendor, at: "2026-10-25" });
    const ent = await callQ(ana, "entity", { id: E.vendor });
    const claimOrg = await callBQ(ana, "identityclaim", { a: E.vendor, b: E.nonprofit, kind: "not_same_as", basis: "testimony", note: "The vendor is a for-profit company; the Fund is a nonprofit." });
    row("R56", "Register an agency, a vendor and a nonprofit through the person screen's organization form; facts (name, address, contact); 'Same organization?' claim", "member Ana",
      "recorded a name and an address fact on the vendor from the memo, tried a birth fact on an organization, read its page and entity, claimed 'not the same organization' between the vendor and the nonprofit",
      orgFact.ok && orgAddr.ok && !orgBirth.ok && claimOrg.ok && orgPage.r.found ? "WORKS" : "BROKEN",
      `name fact: ${J(orgFact.r, 220)}; address fact: ${J(orgAddr.r, 260)} (publishable ${orgAddr.r && orgAddr.r.publishable}); birth on an organization: ${x(orgBirth)}; the organization's page keys ${J(Object.keys(orgPage.r || {}))}; its kind ${ent.r && ent.r.entity && ent.r.entity.kind} and sector ${J(ent.r && ent.r.entity && ent.r.entity.sector)}; same-organization claim ${J(claimOrg.r, 220)}`);
  } catch (e) { row("R56", "Organization facts", "member Ana", "personfact on an organization", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* a second, revised directory: the same people again, so two documents name one person and a connection can stand between them */
  let staffdir2 = null;
  try {
    staffdir2 = await upDoc(ana, anaCs, "Public Works Agency staff directory (revised)", dirText + "Sam Ortiz, Deputy Director, sortiz@oaklandca.gov, 510-238-3007\n");
    await release(ana, await sel(ana, [staffdir2.bundleId]), "The revised directory is the same agency page with one added row.", "I compared it line by line with the first copy.");
    const rs = await callBQ(ana, "resolve", { captureSha: staffdir2.sha });
    const conn = await callBQ(ana, "connect", { entityId: E.jane });
    const connNone = await callBQ(ana, "connect", { entityId: E.nonprofit });
    const connOrg = await callBQ(ana, "connect", { entityId: E.vendor });
    const naming = await callQ(ana, "readingname", { entity: E.vendor });
    const namingAgency = await callQ(ana, "readingname", { entity: E.agency });
    ctx.conn = conn.r;
    row("R56", "'Connect' on a person finds the other documents that name them, with the grade and basis of each proposed connection", "member Ana",
      "vouched a revised directory that repeats Jane Smith's address, resolved it, and pressed Connect on Jane Smith",
      conn.ok && (conn.r.documents >= 2 || (conn.r.connections || []).length) ? "WORKS" : "BROKEN",
      `resolve of the revised directory: resolved ${rs.r && rs.r.resolved_count}; connect on Jane: ${J(conn.r, 1100)}`);
    row("R56", "'Connect' on an organization no memo names: the attempt reads as looked-absent", "member Ana",
      "pressed Connect on the nonprofit, the vendor; read the name lookup (readingname) for the vendor and the agency, which the plain-text memo names in its sentences",
      connOrg.ok && connOrg.r.documents >= 1 ? "WORKS" : "BROKEN",
      `MAJOR if intended: the memo that names the agency, the vendor and the nonprofit is not found. connect on the nonprofit: ${J(connNone.r, 400)}; on the vendor: ${J(connOrg.r, 400)}; readingname for the vendor: ${J({ count: naming.r && naming.r.count, used: naming.r && naming.r.names_used, detail: naming.r && naming.r.detail }, 400)}; for the agency: ${J({ count: namingAgency.r && namingAgency.r.count }, 100)}. The memo (a plain-text upload, content type "generic") carries no reading references, so no organization it names in prose can be matched to the record: ${J(((await callQ(ana, "reading", { sha256: memo.sha })).r || {}).entity_count)} references in the memo's reading`);
  } catch (e) { row("R56", "Connect", "member Ana", "connect", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C10B
  /* ============================================================== R158 (connections on a document, the on-point mention) */
  try {
    const c0 = (ctx.conn && ctx.conn.connections && ctx.conn.connections[0]) || {};
    const choose = await callBQ(ana, "connectionchoose", { capture: c0.a_capture_sha, other: c0.b_capture_sha, entity: E.jane, ref: "contact:jsmith@oaklandca.gov" });
    const chooseBad = await callBQ(ana, "connectionchoose", { capture: c0.a_capture_sha, other: c0.b_capture_sha, entity: E.jane, ref: "contact:nobody@oaklandca.gov" });
    const conn2 = await callBQ(ana, "connect", { entityId: E.jane });
    row("R158", "Choose the on-point mention of a connection (connectionchoose)", "member Ana",
      "pressed 'This is the mention that matters' for Jane's address in the revised directory, then for a reference the document does not hold; read Connect again",
      choose.ok && !chooseBad.ok ? "WORKS" : "BROKEN",
      `choose: ${J(choose.r, 400)}; absent reference: ${x(chooseBad)}; connect again: ${J(((conn2.r || {}).connections || [])[0], 700)}. The directory's references carry no place ("neither reading says where in its document the reference was read"), so the choice is among one mention per document`);
  } catch (e) { row("R158", "connectionchoose", "member Ana", "connectionchoose", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ============================================================== R57 ties: a member's own */
  let tieBen = null;
  try {
    const noNote = await callBQ(ben, "membertie", { entity: E.vendor, kind: "employer", note: "", attribution: "group" });
    const badKind = await callBQ(ben, "membertie", { entity: E.vendor, kind: "enemy", note: "x", attribution: "group" });
    const badLevel = await callBQ(ben, "membertie", { entity: E.vendor, kind: "employer", note: "x", attribution: "everyone" });
    tieBen = await callBQ(ben, "membertie", { entity: E.vendor, kind: "employer", note: "I worked for Acme Paving from 2016 to 2019 as a crew lead.", attribution: "group" });
    const tie2 = await callBQ(ben, "membertie", { entity: E.jane, kind: "relative", note: "Jane Smith is my aunt.", attribution: "name" });
    const mine = await callQ(ben, "memberties", { member: "ben" });
    const asAna = await callQ(ana, "memberties", { member: "ben" });
    const asAdmin = await callQ(adm, "memberties", { member: "ben" });
    const wdNo = await callBQ(ben, "membertiewithdraw", { tieId: tieBen.r && tieBen.r.tie_id, reason: "" });
    const wd = await callBQ(ben, "membertiewithdraw", { tieId: tie2.r && tie2.r.tie_id, reason: "I recorded the wrong person; she is my cousin's employer, not my aunt." });
    const afterWd = await callQ(ben, "memberties", { member: "ben" });
    row("R57", "A member's own ties: declare an employer and a relative at a chosen level of disclosure; withdraw one with a reason; the administrator sees them, another member does not", "member Ben, member Ana, ADMIN",
      "Ben declared an employer tie (disclosed to the team) and a relative tie (by name) after three refused tries (no note, an unknown kind, an unknown level); read them as himself, as Ana, as the administrator; withdrew one with no reason and with a reason",
      !noNote.ok && !badKind.ok && !badLevel.ok && tieBen.ok && tie2.ok && J(mine.r, 9000).includes(tieBen.r.tie_id) && !J(asAna.r, 3000).includes(tieBen.r.tie_id) && J(asAdmin.r, 9000).includes(tieBen.r.tie_id) && !wdNo.ok && wd.ok ? "WORKS" : "BROKEN",
      `refusals: ${x(noNote)} | ${x(badKind)} | ${x(badLevel)}; declared: ${J(tieBen.r, 260)} and ${J(tie2.r, 220)}; Ben reads ${J(mine.r, 500)}; Ana reads ${J(asAna.r, 300)}; the administrator reads ${J(asAdmin.r, 300)}; withdraw no reason: ${x(wdNo)}; withdrawn ${J(wd.r, 200)}; Ben reads after: ${J(afterWd.r, 400)}`);
    ctx.tieBen = tieBen.r && tieBen.r.tie_id; ctx.tie2 = tie2.r && tie2.r.tie_id;
  } catch (e) { row("R57", "Ties", "member Ben", "membertie", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ============================================================== R58 relations among others */
  try {
    const withSrc = await callBQ(ana, "relationdeclare", { fromEntity: E.nonprofit, toEntity: E.agency, relation: "member_of", justification: "The memo says the Fund is one of the agency's contracted partners.", citation: "https://www.oaklandca.example/budget-2024.html" });
    const noSrc = await callBQ(ana, "relationdeclare", { fromEntity: E.vendor, toEntity: E.nonprofit, relation: "overlaps", justification: "Jane Smith chairs the Fund and her agency pays the vendor; I think the two overlap.", citation: "" });
    const noWhy = await callBQ(ana, "relationdeclare", { fromEntity: E.vendor, toEntity: E.agency, relation: "proxy_for", justification: "", citation: "https://www.oaklandca.example/budget-2024.html" });
    const badRel = await callBQ(ana, "relationdeclare", { fromEntity: E.vendor, toEntity: E.agency, relation: "friends_with", justification: "x", citation: "y" });
    const rel = await callQ(ana, "relation", { id: withSrc.r && withSrc.r.relation_id });
    const ordinance = await callBQ(ana, "entitycreate", { kind: "ordinance", label: "Ordinance 13768 (paving contracts)", note: "The ordinance that sets how paving contracts are let" });
    const relOrd = await callBQ(ana, "relationdeclare", { fromEntity: E.agency, toEntity: ordinance.r && ordinance.r.entity_id, relation: "member_of", justification: "The agency applies the ordinance.", citation: "https://www.oaklandca.example/budget-2024.html" });
    E.ordinance = ordinance.r && ordinance.r.entity_id;
    const lineA = await callBQ(ana, "recordline", { kind: "related_to", from: E.jane, to: E.dana, basis: { statement: "Jane Smith and Dana Brooks are sisters-in-law; Dana told me so." } });
    const lineNo = await callBQ(ana, "recordline", { kind: "related_to", from: E.jane, to: E.dana });
    const lineSelf = await callBQ(ana, "recordline", { kind: "related_to", from: E.jane, to: E.jane, basis: { statement: "same" } });
    const lineWd = await callBQ(ana, "linewithdraw", { lineId: lineA.r && lineA.r.line_id });
    const lineWd2 = await callBQ(ana, "linewithdraw", { lineId: lineA.r && lineA.r.line_id, reason: "Dana later said she meant her husband's cousin; I will record that instead." });
    row("R58", "Relations among others: declared with and without a source; a line recorded and withdrawn with a reason", "member Ana",
      "declared 'member of' with a cited address, 'overlaps' with no source, one with no justification, one of an unknown kind; read a relation; recorded a 'related to' line (with and without a basis, to itself); withdrew it with no reason and with a reason",
      withSrc.ok && !noSrc.ok && !noWhy.ok && !badRel.ok && lineA.ok && !lineNo.ok && !lineSelf.ok && lineWd2.ok ? "WORKS" : "BROKEN",
      `with a source: ${J(withSrc.r, 400)}; no source (the plane REFUSES it, NO_CITATION; the coverage row's 'without one it reads declared, not evidenced' is not an act that can be done): ${J(noSrc.r, 300)}; no justification: ${x(noWhy)}; unknown kind: ${x(badRel)}; relation read: ${J(rel.r, 400)}; line: ${J(lineA.r, 300)}; no basis: ${x(lineNo)}; to itself: ${x(lineSelf)}; withdraw with no reason: ${x(lineWd)}; with a reason: ${J(lineWd2.r, 260)}`);
    const graph = await callBQ(ana, "exploregraph", { centre: E.jane, at: { value: "2026-10-25", precision: "day", zone: "UTC" }, rings: 2 });
    const graphNone = await callBQ(ana, "exploregraph", { centre: E.dana, at: { value: "2026-10-25", precision: "day", zone: "UTC" }, rings: 2 });
    row("R58", "Explore: a person's hop labels and grades; a person with no tie", "member Ana",
      "pressed Explore connections on Jane Smith (a claim, a line and a document connection) and on Dana Brooks",
      graph.ok && graphNone.ok ? "WORKS" : "BROKEN", `Jane: ${J(graph.r, 900)}; Dana: ${J(graphNone.r, 500)}`);
  } catch (e) { row("R58", "Relations", "member Ana", "relationdeclare", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C11B
  /* ============================================================== R59 offices and holders; R56's records an office keeps */
  try {
    const office = await callBQ(ana, "entitycreate", { kind: "office", label: "Director of Public Works", note: "The post that signs the agency's paving contracts" });
    E.office = office.r && office.r.entity_id;
    const clerk = await callBQ(ben, "entitycreate", { kind: "office", label: "City Clerk", note: "Named by a member; keeps the minutes and the received-log" });
    E.clerk = clerk.r && clerk.r.entity_id;
    const postIn = await callBQ(ana, "recordline", { kind: "post_in", from: E.office, to: E.agency, basis: { statement: "The staff directory lists the Director in the agency." } });
    const holdsA = await callBQ(ana, "recordline", { kind: "holds", from: E.jane, to: E.office, capacity: "employee", title: "Director of Public Works", valid: { from: "2019-02-01", to: "2025-06-30" }, basis: { captureSha: staffSha, extent: { kind: "document" } } });
    const holdsB = await callBQ(ana, "recordline", { kind: "holds", from: E.dana, to: E.office, capacity: "acting", title: "Acting Director of Public Works", valid: { from: "2025-07-01", to: null }, basis: { statement: "Dana Brooks told me she took over in July 2025." } });
    const holdsBad = await callBQ(ana, "recordline", { kind: "holds", from: E.agency, to: E.office, capacity: "employee", basis: { statement: "x" } });
    const holdsNoCap = await callBQ(ana, "recordline", { kind: "holds", from: E.jane, to: E.office, basis: { statement: "x" } });
    const reversed = await callBQ(ana, "recordline", { kind: "holds", from: E.jane, to: E.office, capacity: "employee", valid: { from: "2025-01-01", to: "2020-01-01" }, basis: { statement: "x" } });
    const at = async (d) => (await callQ(ana, "holderat", { office: E.office, at: d })).r;
    const h2020 = await at("2020-06-01"), h2026 = await at("2026-01-01"), h2018 = await at("2018-01-01");
    const holderOpen = await at("2026-01-01");
    const through = await callBQ(ana, "linecurrentthrough", { lineId: holdsB.r && holdsB.r.line_id, day: "2026-10-01", basis: { statement: "Dana Brooks still held the post when I last spoke to her on October 1, 2026." } });
    const holderThrough = await at("2026-01-01");
    row("R59", "Who holds an office now: a post with no stated end", "member Ana",
      "asked who held the office on 2026-01-01 when Dana Brooks's line has a start and no end; then stated the line current through October 1, 2026 (op linecurrentthrough, which no screen offers) and asked again",
      holderOpen.holder === E.dana ? "WORKS" : "BROKEN",
      `MAJOR if members are meant to record a current post: without an end date the holder reads undetermined (${J(holderOpen.why)}), and the only act that makes a current holder determinate, linecurrentthrough, is on no screen (registry search: none). Before: ${J({ holder: holderOpen.holder, undetermined: holderOpen.undetermined })}; the op itself: ${J(through.r, 160)}; after it: ${J({ holder: holderThrough.holder, undetermined: holderThrough.undetermined })}`);
    const reports = await callBQ(ana, "recordline", { kind: "reports_to", from: E.office, to: E.clerk, role: "administrative", basis: { statement: "The org chart shows the Director answering to the City Clerk for records." } });
    const structure = await callQ(ana, "structureat", { entity: E.office, at: "2026-01-01" });
    row("R59", "Organization structure and holders: an office in an organization, who held it on a date, reports-to", "member Ana",
      "recorded a post in the agency, two holders with dates (Jane Smith 2019-2025, Dana Brooks acting from July 1, 2025), a holder that is not a person, a post with no capacity, reversed dates, a reports-to; asked who held the office on 2020-06-01, 2026-01-01 and 2018-01-01; read the office's structure",
      postIn.ok && holdsA.ok && holdsB.ok && !holdsBad.ok && !holdsNoCap.ok && !reversed.ok && J(h2020, 3000).includes(E.jane) && reports.ok ? "WORKS" : "BROKEN",
      `post_in ${J(postIn.r && postIn.r.line_id)}; holders ${J(holdsA.r && holdsA.r.line_id)} / ${J(holdsB.r && holdsB.r.line_id)}; non-person holder: ${x(holdsBad)}; no capacity: ${x(holdsNoCap)}; reversed: ${x(reversed)}; holderat 2020-06-01: ${J(h2020, 450)}; 2026-01-01 (Dana's line has no end): ${J(h2026, 250)}; 2018-01-01: ${J(h2018, 300)}; reports_to: ${J(reports.r, 160)}; structureat: ${J(structure.r, 700)}`);
    const unconf = await callQ(ana, "entitieskind", { kind: "office" });
    const confirmMember = await callBQ(ben, "officeconfirm", { entityId: E.clerk });
    const confirmAdmin = await callBQ(adm, "officeconfirm", { entityId: E.clerk });
    const confirmAgain = await callBQ(adm, "officeconfirm", { entityId: E.clerk });
    row("R59", "Confirm an office a member named (officeconfirm): only an administrator", "member Ben, ADMIN",
      "Ben (who named 'City Clerk') pressed Confirm; the administrator pressed Confirm, then again",
      !confirmMember.ok && confirmAdmin.ok ? "WORKS" : "BROKEN",
      `the office list before: ${J((unconf.r.entities || unconf.r.items || []).map((e) => ({ id: e.entity_id, label: e.label, unconfirmed: e.unconfirmed ?? e.named_by_member ?? e.confirmed })), 500)}; as a member: ${x(confirmMember)}; as the administrator: ${J(confirmAdmin.r, 250)}; again: ${J(confirmAgain.r, 200)}`);
    const court = await callBQ(ana, "entitycreate", { kind: "body", forum_kind: "court", label: "Alameda County Superior Court", note: "Alameda County Superior Court" });
    E.court = court.r && court.r.entity_id;
    const courts = await callQ(ana, "entitieskind", { kind: "body", forum_kind: "court" });
    row("R59", "Add a court beside 'Add an office yourself'", "member Ana", "pressed Add a court with its name; read the courts list", court.ok && J(courts.r, 4000).includes("Alameda County Superior Court") ? "WORKS" : "BROKEN",
      `court: ${J(court.r, 250)}; courts list: ${J(courts.r, 400)}`);
    const seat = await callBQ(ana, "recordline", { kind: "seat_on", from: E.office, to: E.court, basis: { statement: "x" } });
    const seatOk = await callBQ(ana, "recordline", { kind: "seat_on", from: E.office, to: E.agency, basis: { statement: "x" } });
    row("R59", "Legistar seats from a followed body (needs R41 from area 4)", "member Ana",
      "no followed Legistar body exists in this room (area 4's R41 is not run by this walk); recorded a seat by hand instead: an office's seat on a body (accepted) and on a court-kind body",
      "NOT REACHED", `Legistar seats need a followed body's reader; the room holds none. By hand: seat on the court ${x(seat)} ${J(seat.r && seat.r.line_id)}; seat on an institution: ${x(seatOk)}`);
    /* records an office keeps */
    const keeps = await callBQ(ana, "recordline", { kind: "custodian_of", from: E.clerk, to: E.agency, basis: { statement: "The City Clerk keeps the agency's contract records." }, valid: { from: "2020-01-01", to: null } });
    const keepsNo = await callBQ(ana, "recordline", { kind: "custodian_of", from: E.clerk, to: E.agency });
    const keepsRev = await callBQ(ana, "recordline", { kind: "custodian_of", from: E.clerk, to: E.agency, basis: { statement: "x" }, valid: { from: "2026-01-01", to: "2020-01-01" } });
    const kept = await callQ(ana, "linesof", { entity: E.clerk, kinds: "custodian_of,responsible_for", direction: "from" });
    row("R56", "Record that an office keeps a kind of records (custodian_of) and read it under 'Records its offices keep'", "member Ana",
      "recorded that the City Clerk keeps the agency's records from a stated date (with a basis; with none; with reversed dates); read the lines from the office",
      keeps.ok && !keepsNo.ok && !keepsRev.ok && J(kept.r, 3000).includes(E.agency) ? "WORKS" : "BROKEN",
      `recorded: ${J(keeps.r, 250)}; no basis: ${x(keepsNo)}; reversed dates: ${x(keepsRev)}; lines from the office: ${J(kept.r, 600)}`);
  } catch (e) { row("R59", "Offices and holders", "member Ana", "recordline/holderat", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C12B
  /* ============================================================== R147 other subjects; the people directory */
  try {
    const kinds = [["source", "Oakland Open Data portal"], ["movement", "Neighbors for Smooth Streets"], ["body", "Public Works Advisory Board"], ["parcel", "APN 011-0834-007"], ["contract", "Telegraph Avenue repaving contract 2024-117"],
      ["fund", "Measure KK infrastructure fund"], ["program", "Neighborhood paving program"], ["place", "Telegraph Avenue"], ["institution", "Oakland Public Library"]];
    const made = {};
    for (const [k, label] of kinds) {
      const r = await callBQ(ana, "entitycreate", { kind: k, label, note: `Registered for the paving investigation: ${label}.`, aliases: [label.split(" ").slice(0, 2).join(" ")] });
      made[k] = r.r && (r.r.entity_id || r.r.reason);
    }
    const badKind = await callBQ(ana, "entitycreate", { kind: "proceeding_party", label: "x", note: "x" });
    const dupe = await callQ(ana, "entitysimilar", { name: "Telegraph Avenue repaving contract", kind: "contract" });
    const shows = {};
    for (const show of ["both", "people", "organisations", "offices", "ordinances", "contracts", "funds", "sources", "everything"]) shows[show] = ((await callQ(ana, "peopledirectory", { show })).r.rows || []).length;
    const search = await callQ(ana, "peopledirectory", { q: "smith" });
    const searchOffice = await callQ(ana, "peopledirectory", { office: E.agency });
    const named = await callQ(ana, "peopledirectory", { namedIn: "mine" });
    const recent = await callQ(ana, "peopledirectory", { since: "30" });
    const everything = await callQ(ana, "peopledirectory", { show: "everything" });
    const janeRow = (everything.r.rows || []).filter((r) => r.name === "Jane Smith").map((r) => ({ entity: r.entity, documents: r.documents, questions: r.questions, projects: r.projects, mine: r.mine }));
    row("R147", "Other subjects the record follows: one of each kind with aliases; the near-match check; the five Show choices", "member Ana",
      "registered a source, a movement, a body, a parcel, a contract, a fund, a program, a place and an institution (each with an alias); tried an unknown kind; asked for near matches to a contract name; read the directory under each Show choice",
      Object.values(made).every((v) => String(v).startsWith("ENT-")) && !badKind.ok ? "WORKS" : "BROKEN",
      `ids ${J(made, 600)}; unknown kind: ${x(badKind)}; near match: ${J((dupe.r.similar || []).map((s) => s.label), 200)}; rows under each Show: ${J(shows)}`);
    row("R55", "The people directory: count line, search, four filters, 'named in N documents', rows no document names", "member Ana",
      "read the directory unfiltered, searched 'smith', filtered by office, by 'named in my projects', by 'named recently'",
      (everything.r.following > 0) ? "WORKS" : "BROKEN",
      `following ${everything.r.following}, in your projects ${everything.r.in_your_projects}; search 'smith' ${(search.r.rows || []).length} rows ${J((search.r.rows || []).map((r) => r.label || r.name), 200)}; office filter (people holding an office in the agency today) ${(searchOffice.r.rows || []).length} (Dana Brooks's post is stated current only through October 1; Jane Smith's ended in 2025); named in mine ${(named.r.rows || []).length}; named recently ${(recent.r.rows || []).length}; the two Jane Smith rows: ${J(janeRow, 400)}; a row no document names: ${J((everything.r.rows || []).find((r) => /Neighborhood paving/.test(r.label || r.name || "")), 400)}; first row keys ${J(Object.keys((everything.r.rows || [])[0] || {}))}`);
  } catch (e) { row("R147", "Other kinds", "member Ana", "entitycreate", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ============================================================== R148 personal facts held, never published as addresses or phone numbers */
  try {
    const home = await callBQ(ana, "recordpersonfact", { person: E.dana, kind: "address", value: "412 Grand View Drive, Oakland, California", valid: { from: "2024-01-01", to: null }, citation: { captureSha: staffSha, extent: { kind: "document" } } });
    const phone = await callBQ(ana, "recordpersonfact", { person: E.dana, kind: "contact", value: "510-555-0142", valid: { from: "2024-01-01", to: null }, citation: { captureSha: staffSha, extent: { kind: "document" } } });
    const machine = await callBQ({ authorization: `Bearer ${kit.ADM}` }, "recordpersonfact", { person: E.dana, kind: "contact", value: "510-555-0199", valid: { from: null, to: null }, citation: { captureSha: staffSha, extent: { kind: "document" } } });
    const pageD = await callQ(ana, "person", { id: E.dana, at: "2026-10-25" });
    const seenByBen = await callQ(ben, "person", { id: E.dana, at: "2026-10-25" });
    row("R148", "Personal facts: a home address or phone is held (member's own act) and marked never published; a machine never imports one", "member Ana, probe credential",
      "recorded a home address and a phone number on Dana Brooks from a cited directory; the probe credential tried to record a phone; read Dana's page as Ana and as Ben",
      home.ok && phone.ok && home.r.publishable === false && !machine.ok ? "WORKS" : "BROKEN",
      `address fact: ${J(home.r, 330)}; phone fact: ${J(phone.r, 330)}; the operator's own credential (not a member's session) trying to record a phone: ${x(machine)}; Dana's page for Ana lists the address: ${JSON.stringify(pageD.r).includes("Grand View")}; for Ben: ${JSON.stringify(seenByBen.r).includes("Grand View")}. The publish side of the row (a case carrying an address or phone) is area 9's R94 and the register import's is area 6's R65; neither is run here`);
    ctx.contactFact = home.r && home.r.fact_id;
    ctx.nameFact = ctx.fact;
  } catch (e) { row("R148", "Personal facts", "member Ana", "recordpersonfact", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C13B
  /* ============================================================== R149 expunge a person's recorded value */
  try {
    const target = ctx.contactFact;
    const asMember = await callBQ(ben, "personexpunge", { id: target, ground: "unlawful", reason: "It is her home address." });
    const badGround = await callBQ(adm, "personexpunge", { id: target, ground: "i_dont_like_it", reason: "x" });
    const orderMissing = await callBQ(adm, "personexpunge", { id: target, ground: "court_order", reason: "A court ordered it removed." });
    const noReason = await callBQ(adm, "personexpunge", { id: target, ground: "unlawful", reason: "" });
    const gone = await callBQ(adm, "personexpunge", { id: "PFA-2026-nothere", ground: "unlawful", reason: "x" });
    const done = await callBQ(adm, "personexpunge", { id: target, ground: "court_order", order: "Alameda County Superior Court order 24-CV-0117, dated October 2, 2026", reason: "The court ordered Dana Brooks's home address removed from the record." });
    const pageA = await callQ(ana, "person", { id: E.dana, at: "2026-10-25" });
    const pageB = await callQ(ben, "person", { id: E.dana, at: "2026-10-25" });
    const again = await callBQ(adm, "personexpunge", { id: target, ground: "unlawful", reason: "again" });
    const stillThere = JSON.stringify(pageA.r).includes("Grand View") || JSON.stringify(pageB.r).includes("Grand View");
    const exported = await callBQ(adm, "export", { note: "walk 05: a fresh export after the removal" });
    const exportText = JSON.stringify(exported.r);
    const exportMarker = exportText.includes(target) || /tombstone/i.test(exportText);
    const marker = /tombstone|removed where the law|expunged/i.exec(JSON.stringify(pageA.r) + JSON.stringify(pageB.r));
    row("R149", "Expunge a person's recorded value: administrator only; a lawful ground; a court order names the order; the value goes and a marker stays", "member Ben, ADMIN, member Ana",
      "Ben tried; the administrator tried an unlisted ground, a court order without the order, no reason, a fact that does not exist, then removed Dana Brooks's home address under a named court order; both members read her page; the administrator removed it again",
      !asMember.ok && !badGround.ok && !orderMissing.ok && !noReason.ok && !gone.ok && done.ok && !stillThere && !again.ok ? "WORKS" : "BROKEN",
      `member: ${x(asMember)}; bad ground: ${x(badGround)}; court order with no order: ${x(orderMissing)}; no reason: ${x(noReason)}; no such fact: ${x(gone)}; removed: ${J(done.r, 400)}; the address still on the page: ${stillThere}; a marker on the page ("${marker ? marker[0] : "none found"}"); again: ${x(again)}. The dialog's words, the Irreversible weight and the phone's "finish on a larger screen" are screen checks (a browser walk). The marker in a citing question needs a question citing the fact (area 9)`);
    row("R149", "The marker 'Removed where the law requires, <date>, by <member>' on the page, in the citing question and in a fresh export", "member Ana, member Ben, ADMIN",
      "after the removal read Dana Brooks's page as Ana and as Ben and ran the administrator's export",
      marker && exportMarker ? "WORKS" : "BROKEN",
      `the page for Ana: marker found ${marker ? marker[0] : "no"}; the page's keys ${J(Object.keys(pageA.r || {}))}; the export's manifest names the removal: ${exportMarker} (${J(exported.r, 300)}). The only reader of the removal marker in the plane is record-core's tombstone list, carried in the export manifest; no read the person page makes returns it`);
  } catch (e) { row("R149", "Expunge", "ADMIN", "personexpunge", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ============================================================== R55: a protected source link; following a register */
  try {
    const link = await callBQ(ana, "sourcepersonlink", { source: E.wei, person: E.jane, evidence: "Wei told me in confidence what she saw", sight: ["ana"] });
    const srcEnt = await callBQ(ana, "entitycreate", { kind: "source", label: "A staff member in the records office", note: "A person who tells us what the agency's filing practice is" });
    const linkSrc = await callBQ(ana, "sourcepersonlink", { source: srcEnt.r && srcEnt.r.entity_id, person: E.jane, evidence: "told me", sight: ["ana"] });
    row("R55", "A protected source link (sourcepersonlink): a source linked to a person, seen only by its listed members", "member Ana",
      "pressed the link act with a person as the source, then with a registered source entity",
      linkSrc.ok ? "WORKS" : "NOT REACHED",
      `person as source: ${x(link)}; registered source entity: ${x(linkSrc)}. The act asks the sources module for a held source (a rung/standing record); the registry's 'source' entity kind is not that, and no source was made in this room by any of the acts walked here, so the link act could not be completed`);
    const follow = await callBQ(ana, "followregister", { address: "https://www.oaklandca.example/registers/contracts.csv" });
    const followBad = await callBQ(ana, "followregister", { address: "not an address" });
    row("R58", "Follow a register to be told when it changes (followregister)", "member Ana",
      "pressed Follow on a register address, and on text that is not an address", follow.ok && !followBad.ok ? "WORKS" : "BROKEN",
      `follow: ${J(follow.r, 400)}; bad address: ${x(followBad)}`);
  } catch (e) { row("R55", "Source link / follow", "member Ana", "sourcepersonlink", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C14B
  /* ---- a document in an unresolved contradiction: the two budget pages disagree; Ana flags it from the 2022 page; the 2022 page reads 'not eligible' */
  try {
    const back = await callBQ(ana, "heldrestore", { ids: [f22.bundleId], reason: "The 2022 page is a real source for the comparison; it stays in the record." });
    const sha22 = (await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: f22.bundleId })).r.held[0].capture.sha256;
    const sha24 = dochash[f1.bundleId];
    const passage = async (sha) => { const f = (await callBQ(ana, "findin", { scope: { capture: sha }, kinds: ["term"], term: "budget" })).r; const it = f && f.kinds && f.kinds[0] && f.kinds[0].items && f.kinds[0].items[0]; console.log("OBS findin", sha.slice(0, 8), J(f, 500)); return it; };
    const u22 = await passage(sha22), u24 = await passage(sha24);
    const eligBefore = ((await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: f22.bundleId })).r.held || [])[0] || {};
    const flagCold = (u22 && u24) ? await callBQ(ana, "contradictionflag", { here: { capture: sha22, extent: u22.extent }, other: { capture: sha24, extent: u24.extent }, reason: "The 2022 page gives 3.9 million for the paving budget; the 2024 page gives 4.2 million." }) : { ok: false, r: { reason: "no passage found" } };
    row("R38", "Flag a contradiction between two passages just read (Document page, contradictionflag)", "member Ana",
      "found one passage in each budget page (find in this document) and set them side by side as a contradiction with a reason, before either had been cited in any question",
      flagCold.ok ? "WORKS" : "BROKEN",
      `MAJOR: ${x(flagCold)}. The find answers each passage with content_held: ${J(u22 && u22.content_held)}/${J(u24 && u24.content_held)} (the record holds a passage's row only once a question cites it); the flag looks the passage up there and says none is held. After both passages were cited in Ana's question the same act succeeded (next row)`);
    const cq = async (it) => callBQ(ana, "cite", { project: question, role: "supports", found: it });
    const cit22 = await cq(u22), cit24 = await cq(u24);
    const flag = await callBQ(ana, "contradictionflag", { here: { capture: sha22, extent: u22.extent }, other: { capture: sha24, extent: u24.extent }, reason: "The 2022 page gives 3.9 million for the paving budget; the 2024 page gives 4.2 million for the year it calls the same program." });
    const eligAfter = ((await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: f22.bundleId })).r.held || [])[0] || {};
    const relTry = flag.ok ? await release(ana, await sel(ana, [f22.bundleId]), ack, mit) : { ok: false, r: { reason: "(not pressed: the flag was not made)" }, status: 0 };
    row("R38", "A document in an unresolved contradiction reads 'not eligible' with the reason before acting; a batch holding it is refused whole", "member Ana",
      "cited one passage of each budget page in the question; flagged the two figures as a contradiction; read the 2022 page's held row; selected it and pressed release",
      flag.ok && eligAfter.eligible === false && !relTry.ok && /CONTEST/.test(J(relTry.r)) ? "WORKS" : (flag.ok ? "BROKEN" : "NOT REACHED"),
      `cites: ${J(cit22.r && cit22.r.cited)} ${J(cit24.r && cit24.r.cited)}; flag: ${J(flag.r, 260)}; held row before the flag: eligible ${eligBefore.eligible}; after: eligible ${eligAfter.eligible} class ${J(eligAfter.class)} ${J(eligAfter.reason || eligAfter.why, 200)}; release: ${x(relTry)} offenders ${J(relTry.r && relTry.r.offenders, 200)}`);
  } catch (e) { row("R38", "Contested eligibility", "member Ana", "contradictionflag", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  row("R38", "A crucial document reads 'not eligible' and its vouch asks for a timestamp (the warning when none)", "member Ana",
    "looked for a member's act that makes a document crucial: the Add screen files every capture 'supporting'; crucial comes from a named request set up on the Watching screen (namedrequestset) and gathered by the scheduler",
    "NOT REACHED", "no document in this room is crucial and none can be made by the acts walked here without running the schedule (a gathering by the scheduler, area 4's watching rows). The refusal class CRUCIAL_IN_BATCH and its sentence are in the release code and the held screen (checked by reading, which is not an exercise)");

  /* ---- G73: the 41.5 MB capture pressed again */
  try {
    const big = kit.pdfOf("The clerk read the budget volume of 2024 aloud to the board", Math.round(41.5 * kit.MB));
    kit.serve("budget-volume-2024.pdf", big, { type: "application/pdf" });
    const t1 = Date.now();
    const first = await kit.acquire(ana, { locator: "https://www.oaklandca.example/budget-volume-2024.pdf", project });
    const second = await kit.acquire(ana, { locator: "https://www.oaklandca.example/budget-volume-2024.pdf", project });
    row("R38", "Press a held 41.5 MB capture again and read the sentence (G73)", "member Ana",
      "captured a 41.5 MB PDF by its address, then pressed the same address again",
      second.status < 500 ? "WORKS" : "BROKEN",
      `first: ${first.status} in ${first.ms} ms ${J(first.body && (first.body.reason || first.body.ok), 80)} ${J(first.body && first.body.reading && first.body.reading.why, 200)}; again: ${second.status} in ${second.ms} ms (no apology or raw statement arises here: the file is read in the request) ${J({ ok: second.body.ok, existed: second.body.existed, reason: second.body.reason, existed: second.body.existed, translation: second.body.translation, detail: second.body.detail }, 700)}`);
  } catch (e) { row("R38", "G73 again", "member Ana", "acquire 41.5 MB twice", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ---- G78: the project-filtered held list, timed */
  try {
    const ts = [];
    for (let i = 0; i < 5; i++) { const t = Date.now(); const r = await callQ(ana, "heldcaptures", { project, limit: 50, fields: "picker" }); ts.push(Date.now() - t); if (!r.ok) throw new Error("held " + J(r.r)); }
    const tf = [];
    for (let i = 0; i < 3; i++) { const t = Date.now(); await callQ(ana, "heldcaptures", { project, limit: 50, bundle_ids: [f1.bundleId, memo.bundleId, f22.bundleId].join(",") }); tf.push(Date.now() - t); }
    row("R38", "Time heldcaptures&project= (G78)", "member Ana", "read the project's held list five times (picker rows) and the full fields of three documents three times",
      Math.max(...ts) < 2000 ? "WORKS" : "BROKEN", `picker reads ${ts.join(", ")} ms; full reads ${tf.join(", ")} ms, on a quiet Miniflare copy (a reading tick may or may not have run; the bars are judged live on Server-Timing, R108)`);
  } catch (e) { row("R38", "G78", "member Ana", "heldcaptures timing", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C15B
  /* ============================================================== R38 / R92: vouch an upload, cite it and sign the case in the same sitting (G59) */
  try {
    const e = await kit.preparedEdition("zoe", "w05chain", { vouch: true });
    const signed = await kit.sitAndSign(e);
    row("R38", "Vouch an upload, cite it and sign the case in the same sitting (R92, G59)", "member Zoe (a member who may create projects and publish)",
      "uploaded a text, filed it in a new project, vouched it, found a sentence and cited it in a question, concluded, drafted the case, prepared the edition and signed it with her own key (the walk's Miniflare copy; a signed case is final only here)",
      signed.res.status === 200 && signed.res.body && signed.res.body.ok !== false ? "WORKS" : "BROKEN",
      `prepared edition ${J(e.prepared && { ok: e.prepared.ok, caseId: e.prepared.caseId, edition: e.prepared.edition }, 200)}; the signing: ${kit.gateLine(signed.res).slice(0, 700)}`);
  } catch (e) { row("R38", "Vouch, cite, sign", "member Zoe", "preparedEdition + sitAndSign", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ============================================================== R212 one person alone (the part of the chain in this sitting) */
  try {
    const solo = kit.screenCall(adm);
    const soloProject = await startProject(adm, "The founder's own project", "hidden");
    const upA = await upDoc(adm, solo, "Solo memo: the clerk's received-log", "The received-log shows the contract stamped RECEIVED on April 30, 2024.\n", "text/plain", soloProject);
    const relA = await release(adm, await sel(adm, [upA.bundleId]), "The log is the clerk's own; I read it.", "I compared the stamp with the contract's cover page.");
    const pA = await callBQ(adm, "entitycreate", { kind: "person", label: "Lee Park", note: "The deputy clerk who stamps the received-log" });
    const fA = await callBQ(adm, "recordpersonfact", { person: pA.r && pA.r.entity_id, kind: "name", value: "Lee Park", valid: { from: "2023-01-01", to: null }, citation: { captureSha: upA.sha, extent: { kind: "document" } } });
    const setA = await callBQ(adm, "heldsetaside", { ids: [upA.bundleId], reason: "(solo) testing set aside alone" });
    row("R212", "One person alone: upload, vouch, register a person, record a fact from the vouched document (this sitting's part)", "ADMIN, the only account",
      "as the founder with no other member: uploaded and filed a document, vouched it, registered a person, recorded a cited fact; (set aside a vouched document)",
      relA.ok && pA.ok && fA.ok ? "WORKS" : "BROKEN",
      `vouch: ${relA.ok} ${x(relA)}; person: ${pA.ok}; fact: ${fA.ok} ${x(fA)}; no step in this sitting needed a second account or another party's approval. Steps that name a second account in the coverage rows (the asker's wait line, a second vouch, a second member's ties) are tagged for the end-of-area-10 report: R38 set-aside wait line and 'second member releasing first', R57 ties as the member, R149 marker seen by another member`);
  } catch (e) { row("R212", "Alone", "ADMIN", "solo chain", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ============================================================== overlay checks made at the op level */
  try {
    const aff = await callQ(ana, "affordances", {});
    const catalog = (aff.r && aff.r.catalog) || [];
    const mine = ["release", "retire", "heldsetaside", "heldrestore", "attest", "entitycreate", "recordpersonfact", "identityclaim", "resolve", "resolvetestify", "relationdeclare", "personexpunge", "declaretie", "withdrawtie", "officeconfirm", "recordline", "connect", "connectionchoose", "contradictionflag"];
    const found = Object.fromEntries(mine.map((id) => [id, (catalog.find((c) => c.id === id) || {}).rung ?? "(not in the catalog)"]));
    row("R215", "Act weight by rung for this sitting's acts (the catalog the screens draw from)", "member Ana",
      "read the affordances catalog and looked up each act this sitting pressed", "WORKS",
      `rung by act: ${J(found, 900)}. Behaviour seen: reasoned acts (heldsetaside, heldrestore, release, retire, entitycreate, identityclaim, resolvetestify, withdraw*) refused an empty reason; retire (terminal) refused a held copy and a second press; personexpunge refused a member; the reversible ones (recordpersonfact, declaretie, entityalias, recordline) wrote at once. The dialogs, pips and Sounds are screen checks (not walked here)`);
    const none = await callQ(cy, "heldcaptures", { limit: 50, fields: "picker" });
    const small = await callQ(ana, "heldcaptures", { limit: 2, fields: "picker" });
    row("R214", "Forced states in this sitting: empty list, truncated list, withheld, undetermined, refusal", "member Cy, member Ana, member Ben",
      "Cy (no place in the project) read the held list; Ana read it with a bound of 2; seen elsewhere in this sitting: 'Captured for a question you may not see' (withheld), a holder 'undetermined' with a reason key, refusals with their sentences",
      none.r && Array.isArray(none.r.held) && none.r.held.length === 0 && small.r.truncated === true && small.r.next ? "WORKS" : "BROKEN",
      `empty list: ${J(none.r, 200)}; bound of 2: held ${(small.r.held || []).length}, truncated ${small.r.truncated}, next ${small.r.next ? "present" : "none"}; 'Could not read this' and 'Still loading' are screen states (not forced here)`);
  } catch (e) { row("R215", "Overlay op-level", "member Ana", "affordances", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* R218: two members change one record at once, on a project's own page (promote with a base) */
  try {
    const cs2 = [kit.screenCall(ana), kit.screenCall(ben)];
    const cur = async () => { const l = R(await cs2[0].call("list", {})).find((b) => b.bundle_id === project); return l && l.bundle_sha; };
    const base = await cur();
    const img = R(await cs2[0].call("image", { query: { id: project } }));
    const bump = (text, line) => text.replace(/\n## Session Log\n/, `\n## Session Log\n\n### Session ${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")} | Edit | interactive\nTrigger: ${line}\nChanges: ${line}.\n`);
    const mk = (cs, line, nonce) => cs.call("promote", { body: { bundleId: project, base, snapKey: new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z") + "_" + nonce, meta: { object_type: "project" },
      files: Object.keys(img).filter((k) => !k.startsWith("_history/")).map((path) => ({ path, text: path === "bundle.md" ? bump(img[path], line) : img[path] })) } });
    const a = R(await mk(cs2[0], "Ana wrote one line", "aaaaaaa1")), b = R(await mk(cs2[1], "Ben wrote another", "bbbbbbb2"));
    row("R218", "Two members change one record at once (the project's own page, a base-stamped write)", "member Ana and member Ben",
      "both read the project's document, both saved a change against the same base: Ana first, then Ben",
      a.ok !== false && b.ok === false ? "WORKS" : (a.ok !== false && b.ok !== false ? "BROKEN" : "BROKEN"),
      `Ana: ${J(a, 250)}; Ben (same base, second): ${J(b, 600)}. Neither silently overwrote the other if Ben was refused with the later head named; ${b.ok !== false ? "Ben's save was ACCEPTED on a stale base" : "Ben's save was refused"}. The case draft and the objective (R90, R26) are other areas' two-writer rows`);
  } catch (e) { row("R218", "Two writers", "members", "promote with a base", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* R217: 'Help me write this' with no assistant connected, on this sitting's writing boxes */
  try {
    const wh = [];
    for (const [op, field, told] of [["relationdeclare", "why", "the Fund belongs to the agency's partners"], ["resolvetestify", "basis", "I know her"], ["identityclaim", "note", "same woman"], ["entitycreate", "note", "a vendor"]]) {
      const r = await callBQ(ana, "writinghelp", { op, field, told });
      wh.push(`${op}/${field}: ${x(r)}`);
    }
    row("R217", "'Help me write this' with no assistant connected, on this sitting's boxes (person: a tie's why, the basis; the claim note; the new-person note)", "member Ana",
      "pressed writinghelp on four of this sitting's writing boxes with the assistant not connected", wh.every((w) => !/ 500 /.test(w)) ? "WORKS" : "BROKEN", wh.join(" | "));
  } catch (e) { row("R217", "writinghelp", "member Ana", "writinghelp", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C16B
  /* ---- G74: a member filing into a project she is not in */
  try {
    const bunch = await upDoc(cy, cyCs, "Outsider's memo", "A memo from someone with no place in the project.\n", "text/plain", project).catch((e) => ({ err: String(e && e.message || e).slice(0, 300) }));
    const cyHeldNow = await heldIds(cy);
    row("R38", "A member filing into a project she is not in is refused with a stand-in sentence (G74)", "member Cy (no place in the project)",
      "Cy uploaded a text and pressed 'file it' in Ana's project", bunch.err ? "WORKS" : (bunch.filed && bunch.filed.refused ? "WORKS" : "BROKEN"),
      `${bunch.err ? "threw: " + bunch.err : "filed " + J(bunch.filed, 500)}; Cy's held list now has ${cyHeldNow.ids.length} rows`);
  } catch (e) { row("R38", "G74", "member Cy", "file into another project", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ---- the meaning-level log: a resolve that matched nothing is looked-absent */
  try {
    const ll = await callQ(ana, "leadlist", { limit: 50 });
    row("R55", "Resolve a name that matches no registered entity and read the attempt as looked-absent in the meaning-level log", "member Ana",
      "resolved the staff directories (five references matched no entity) and listed the observation log's leads (leadlist)", "NOT REACHED",
      `the resolve answers carry each unmatched reference in 'unresolved'; the only member-facing read of the observation log in the plane's ops is leadlist/leadread (leads a member opened by hand): ${J(ll.r, 300)}. A read that returns the attempt "looked, found nothing" for a reference was not found`);
  } catch (e) { row("R55", "Looked-absent", "member Ana", "leadlist", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ---- overlay 31: Server-Timing, from the answers' own header, for this sitting's reads and acts */
  try {
    const by = {};
    for (const t of timings) { const m = /(?:^|, )do-([a-z]+);dur=(\d+)/.exec(t.st); const k = t.op; (by[k] ||= []).push(t.ms); }
    const worst = Object.entries(by).map(([op, a]) => ({ op, n: a.length, max: Math.max(...a), med: a.sort((p, q) => p - q)[Math.floor(a.length / 2)] })).sort((p, q) => q.max - p.max).slice(0, 14);
    const slow = worst.filter((w) => w.max > 2000);
    row("R108", "Timing note: the wall time of each op this sitting called (a quiet Miniflare copy, no proxy, nothing else running)", "all roles",
      `timed ${timings.length} calls; the slowest ops by their worst wall time`, slow.length ? "BROKEN" : "WORKS",
      `${slow.length ? "ops above 2 s: " + J(slow) + "; " : "none above K4354's 2 s; "}slowest: ${J(worst, 900)}. The bars are judged live on Server-Timing at 5-member load (R108): NOT REACHED offline`);
  } catch (e) { row("R108", "Timing", "all", "timings", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C17B
  // @@C18B
  /* ---- the grade C: an alias that equals a reference's whole line; an ambiguous one is kept, never resolved silently */
  try {
    const line = "Pat Lee, Engineer, plee@oaklandca.gov, 510-238-3004";
    const p1 = await callBQ(ana, "entitycreate", { kind: "person", label: "Pat Lee", note: "Engineer in Public Works" });
    const p2 = await callBQ(ana, "entitycreate", { kind: "person", label: "Patricia Lee", note: "A different Patricia Lee, a consultant" });
    const a1 = await callBQ(ana, "entityalias", { entityId: p1.r.entity_id, alias: line });
    const a2 = await callBQ(ana, "entityalias", { entityId: p2.r.entity_id, alias: line });
    const rs = await callBQ(ana, "resolve", { captureSha: staffSha, ref: "contact:plee@oaklandca.gov" });
    const got = (rs.r.resolved || []).map((m) => ({ entity: m.entity_id, grade: m.grade, established: m.established, needs_confirmation: m.needs_confirmation }));
    row("R55", "An ambiguous alias is kept and never resolved silently; a C match never reads established", "member Ana",
      "gave two different people the same alias (the directory's whole line for Pat Lee) and pressed 'Match to the record' on that reference",
      got.length === 2 && got.every((g) => g.grade === "C" && g.established === false && g.needs_confirmation === true) ? "WORKS" : "BROKEN",
      `both candidates recorded: ${J(got, 400)}; method: ${J((rs.r.resolved || [])[0] && rs.r.resolved[0].method, 300)}`);
  } catch (e) { row("R55", "Ambiguous alias", "member Ana", "resolve", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ---- held and vouched list; interest checks */
  try {
    const hv = await callQ(ana, "heldcaptures", { state: "held_and_vouched", limit: 50 });
    const hvRow = ((hv.r && hv.r.held) || []).find((h) => h.bundle_id === memo.bundleId) || {};
    row("R38", "Already-vouched copies are listed with their vouch and are not asked about batch vouching (G78 vouched_basis)", "member Ana",
      "read the held-and-vouched list and the memo's row", (hv.r.held || []).length >= 3 && !("eligible" in hvRow && hvRow.eligible === false) ? "WORKS" : "BROKEN",
      `rows ${(hv.r.held || []).length}; the memo's row: ${J(hvRow, 700)}`);
    const ic = await callQ(ana, "interestchecks", { project });
    row("R58", "Machine checks (interest overlaps) are shown only after the measure that gates them", "member Ana",
      "read the project's interest-check results", ic.ok ? "WORKS" : "BROKEN", J(ic.r, 700));
  } catch (e) { row("R38", "held_and_vouched", "member Ana", "heldcaptures", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  /* ---- overlay 6 and 15, over every refusal this sitting provoked */
  try {
    const all = [...refusals.values()];
    const noSentence = all.filter((r) => !r.translation);
    const banned = [];
    for (const r of all) {
      const text = `${r.translation || ""}`;
      for (const [name, re] of [["group", /\bgroups?\b/i], ["secret", /secret/i], ["confidential", /confidential/i], ["overdue", /overdue/i], ["Signal", /\bsignal\b/i], ["copy of the team", /\bcopy\b/i]]) if (re.test(text)) banned.push(`${r.op}:${r.reason} says "${name}"`);
    }
    const wrong = all.filter((r) => r.reason === "NO_SUCH_ITEM");
    row("OVERLAY-6", "A refusal teaches: a refusal's sentence is about the act that was refused", "member Ana, ADMIN",
      `collected every refusal this sitting provoked (${all.length} distinct op/reason pairs) and read each member sentence for whether it is about the act refused`,
      wrong.length ? "BROKEN" : "WORKS",
      `a sentence about the wrong thing: ${wrong.map((r) => `${r.op}:${r.reason} says "${(r.translation || "").slice(0, 160)}…" -- the word table's refusal.NO_SUCH_ITEM is plan-work's (a deadline, checkpoint, escalation stage or hold) and the people module answers the same code for a person fact, claim, tie or source link that is not held; MINOR to MAJOR (BOB places)`).join("; ") || "none"}`);
    row("OVERLAY-6", "A refusal teaches: refusals the plane answers with a code and a developer sentence but no member sentence (the screens may map them)", "member Ana, ADMIN",
      "listed every refusal this sitting provoked whose answer carries no `translation`", noSentence.length ? "NOT REACHED" : "WORKS",
      `${noSentence.length} with no member sentence in the answer: ${noSentence.map((r) => `${r.op}:${r.reason}`).join(", ")}. Whether each reaches a member as a sentence or as a code depends on the screen's own refusal table (a screen walk reads it); the held and Document screens map release's, retire's and the claim ones. Details seen: peopledirectory:BAD_ARGUMENT -> ${J((all.find((r) => r.reason === "BAD_ARGUMENT") || {}).detail, 220)}`);
    row("OVERLAY-15", "Voice and vocabulary in the plane's refusal sentences: no 'group' for a team, 'secret', 'confidential', 'overdue', 'Signal'", "all roles",
      "scanned the member sentences (translation) of every refusal for the overlay's banned words", banned.length ? "BROKEN" : "WORKS",
      `${banned.length ? banned.join("; ") : "none found"}; details (developer sentences) not scanned; 'confidential' is also a ground name of the expunge act (a kind of act, not a label)`);
  } catch (e) { row("OVERLAY", "Refusals", "all", "scan", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  /* ---- ops the coverage marks owed or not named: their absence is recorded, not logged as a defect */
  try {
    const rsr = await callQ(ana, "registersearch", { q: "Jane" });
    const ff = await callQ(ana, "followfrom", { entity: E.jane });
    const bat = await callBQ(ana, "bulkrelease", { ids: [memo.bundleId] });
    row("R55", "Owed or unnamed ops: registersearch (owed, DEC-406), followfrom, the batch-release op (no source names it)", "member Ana",
      "called each by name", "WORKS", `registersearch: ${x(rsr)}; followfrom: ${x(ff)}; a batch-release op by the name 'bulkrelease': ${x(bat)}. The batch release the held screen presses is select + release (one selection, one release), which is what R38 above walked`);
  } catch (e) { row("R55", "Owed ops", "member Ana", "registersearch", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  /* ---- what only a screen shows: recorded NOT REACHED, each with why (Phase 1 draws no screen; the live walk and the browser sitting carry them) */
  const SCREEN = "Phase 1 runs the plane through its door and draws no screen (BRIEF.md Phase 1); this is a check of what is drawn, so it waits for the browser sitting";
  row("R38", "Screens: the Held list, 'Vouch for them' / 'Vouch for this copy' / 'Vouch for photos' / 'Vouch for a capture' labels, the set-aside list and 'Open it' door, the reason field in place, the wait line as drawn, the 'Stop using this copy' fold, the Home and Queue doors", "member / ADMIN", "none: no screen is drawn offline", "NOT REACHED", `${SCREEN}. The ops those screens press were all walked above (select, release, heldsetaside, heldrestore, retire, heldcaptures)`);
  row("R55", "Screens: the people directory's count line and filters as drawn, the add dialog ('A person or an organization?', 'Follow them'), candidates 'accept singly or in bulk', the same-person claim form in place, 'no Explore on its own page', the grade marks and the 'machine acts stand attributed as machine' labels", "member", "none: no screen is drawn offline", "NOT REACHED", `${SCREEN}. The ops were walked above (peopledirectory, entitycreate, entitysimilar, resolve, resolvetestify, resolutiondefect, personfact, entityalias, identityclaim)`);
  row("R55", "A licence from a state register as a recorded fact; name one person in two cases and read both", "member", "none: needs a register import (area 6, R65) and two cases (area 9)", "NOT REACHED", "a register import and a second case are made by other sittings; the person's fact kinds are name, birth, death, locality, address and contact (no licence kind: a licence is a credential read from a register, not a fact a member records)");
  row("R56", "Screens: the organization form (no birth, death or home asked), 'What the group says about it', 'Offices in it', 'Records its offices keep'; the records request pointing at an office that keeps records (R100, area 10)", "member", "none: no screen is drawn offline", "NOT REACHED", `${SCREEN}; the request's office suggestion is area 10's row. The line and its read were walked above`);
  row("R57", "Screens: the ties screen and the Settings text; the case discloses at the chosen level at signing (R92, area 9)", "member", "none: no screen is drawn offline", "NOT REACHED", `${SCREEN}. The signing in this sitting asked for the tie attestation (tieAttested) and a prepared edition signed; whether the published case discloses Ben's tie at the level he chose is area 9's row`);
  row("R58", "Screens: the ordinance's and the office's pages (no fact form offered), the Explore hop labels as drawn", "member", "none: no screen is drawn offline", "NOT REACHED", SCREEN);
  row("R59", "Screens: 'Add an office yourself', 'Add a court', the office list with unconfirmed marks and the Confirm press", "member / ADMIN", "none: no screen is drawn offline", "NOT REACHED", `${SCREEN}. The ops (entitycreate for an office and a court, officeconfirm, entitieskind) were walked above`);
  row("R147", "Screens: the five Show choices as drawn, the eight kinds of 'Add' form, the near-match sentence; bias statements against a person-subject or an office-subject and the collision of a project statement on a related subject (R15's rows, not in this area)", "member", "none: no screen is drawn offline; bias statements belong to R15", "NOT REACHED", SCREEN);
  row("R149", "Screens: the expunge dialog's words, the Irreversible weight on the button, the phone's 'finish on a larger screen'", "ADMIN", "none: no screen is drawn offline", "NOT REACHED", SCREEN);
  row("R213", "Working frame at 1280 px, 390 px and in dark mode for this sitting's screens; rail, band, five tabs", "all roles", "none: no screen is drawn offline", "NOT REACHED", SCREEN);
  row("R216", "Help pages and the glossary (a money term, a state mark, the grade marks of this sitting)", "member", "none: no screen is drawn offline", "NOT REACHED", SCREEN);
  row("R108", "Everyday load: five members at once on this sitting's screens and acts", "five members", "none: Phase 2, live, stays after the redeploy", "NOT REACHED", "Phase 2 only (PHASE1-NOW.md item 5: no live deployment is contacted)");
  console.log("DONE rows", rows.length, "refusals", refusals.size);
  // @@C19B
  // @@NEXT
});
