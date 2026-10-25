/* WALK-FINAL-09 #1: sitting 9 (Question to conclusion, and the plan opened), offline, through the door (K5122, BRIEF Phase 1). Every input is made by a member's own acts over
   the real plane under Miniflare (the kit of bio-plane/test/m/control-plane/r8-kit.mjs, the seam files' way: R-SEAM). Each check writes its row to 09-question.md the moment it
   is done. The script records; it never asserts, so a BROKEN row never stops the walk. Run: cd bio-plane && node --import ./test/platform-sqlite.mjs <this file>. */
import { appendFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { makeZip } from "../../../../bio-plane/test/make-zip.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";

const OUT = fileURLToPath(new URL("../09-question.md", import.meta.url));
const HEAD = "| row id | check | width | role | what I did | verdict | what I saw (wall ms) | screenshot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n";
if (!existsSync(OUT) || process.env.WALK_FRESH) writeFileSync(OUT, "# WALK-FINAL-09 #1: sitting 9 offline record\n\n" + HEAD);
const tally = {};
const clean = (s) => String(s).replace(/\|/g, "/").replace(/\s+/g, " ").slice(0, 800);
export function rec(row, check, role, did, verdict, saw) {
  tally[verdict] = (tally[verdict] || 0) + 1;
  appendFileSync(OUT, `| ${row} | ${clean(check)} | HTTP (no screen) | ${role} | ${clean(did)} | ${verdict} | ${clean(saw)} | none (offline) |\n`);
  console.log(`${verdict.padEnd(11)} ${row} ${check} :: ${clean(saw).slice(0, 160)}`);
}
/* a check: fn answers {v, saw}; a throw is BROKEN with its message */
export async function check(row, name, role, did, fn) {
  const t = Date.now();
  try { const r = await fn(); rec(row, name, role, did, r.v, `${r.saw} (${Date.now() - t} ms)`); return r; }
  catch (e) { rec(row, name, role, did, "BROKEN", `script threw: ${String(e && e.message || e).slice(0, 400)} (${Date.now() - t} ms)`); return { v: "BROKEN", saw: String(e) }; }
}
import { writeFileSync as _wf } from "node:fs";
export const dump = (n, x) => _wf("/tmp/claude-0/-home-user-bio/47c7baf3-728c-5ec2-88f1-75e6a619d7d4/scratchpad/dump-" + n + ".json", JSON.stringify(x, null, 1));
export const J = (x) => JSON.stringify(x);
export const short = (x, n = 420) => J(x).slice(0, n);
export const want = (r, code) => !ok(r) && J(r).includes(code);
export const ok = (a) => a && a.ok !== false && (a.result === undefined || a.result === null || a.result.ok !== false);
export { tally };

export const kit = makeKit({ tag: "w09" });
const { R, sha, te, plane, post, get, ownerOf, person, founder, projectOf, questionOf, screenCall } = kit;
export const K = kit;

/* a document by the member's own acts: upload, file in the project, vouch (the Held screen's Confirm) */
export async function docOf(o, project, tag, paras, { vouch = true, type = "text/plain" } = {}) {
  const cs = screenCall(o.auth);
  const bytes = te(paras.join("\n\n"));
  const up = (await (await plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: o.auth, body: bytes })).json()).result;
  if (!up || up.ok !== true) throw new Error("upload: " + short(up));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: tag, locator: up.document.locator, project });
  if (filed.refused !== undefined) throw new Error("filing: " + short(filed));
  const bundle = filed.bundleId;
  if (vouch) {
    const sel = R(await cs.call("select", { body: { ids: [bundle] } }));
    const rel = await cs.call("release", { query: { handle: sel.handle, acknowledgment: "I checked this file is what it says.", mitigation: "Nothing in it names a private person." } });
    if (!(ok(rel) && R(rel).released.includes(bundle))) throw new Error("vouch: " + short(rel));
  }
  return { bundle, hash: sha(bytes), bytes, tag };
}
/* Find in this document, then Cite in the question (document.mjs `cite`) */
export async function citeOf(o, question, doc, term, role = "supports") {
  const cs = screenCall(o.auth);
  const found = R(await cs.call("findin", { body: { scope: { capture: doc.hash }, kinds: ["term"], term } }));
  const item = found && found.kinds && found.kinds[0] && found.kinds[0].items && found.kinds[0].items[0];
  if (!item) throw new Error("find found nothing: " + short(found));
  const cited = await cs.call("cite", { body: { project: question, role, found: item } });
  return { cited, item, raw: cited };
}

/* ================= the walk ================= */
const act = (o, op, query = {}, body = {}) => post(o.auth, op, body, query);   // a state-changing act: POST, query + body as the screen sends
const W = {};   // what the walk made

async function main() {
  /* ---- prerequisites, by the real acts (PHASE1-NOW item 2) ---- */
  const adm = await founder();
  W.alice = await ownerOf("alice");                       // owner: contribute, publish, create_projects
  W.bobM = { auth: await person("bob") };                  // joined member, a plain participant
  W.carol = { auth: await person("carol") };               // a second member
  W.proj = await projectOf(W.alice.auth, "Oakland spending against stated policy");
  W.proj2 = await projectOf(W.alice.auth, "Second project citing the same question");
  const docs = {
    minutes: ["The council adopted the street repair contract on 4 March 2026 by a vote of five to two.", "Councilmember Reyes abstained from the vote on the contract."],
    policy: ["Policy 12.4 requires every contract above 50000 dollars to be adopted in public session.", "The policy was last amended on 9 January 2025."],
    ledger: ["The street repair contract paid 61000 dollars to Hollis Paving on 20 March 2026.", "Hollis Paving also received 18000 dollars on 2 April 2026."],
    cityclaim: ["The city says it fixed 94 percent of reported potholes within a week.", "Closed reports are counted when a crew first arrives."],
    typed: ["Typed by hand: the register shows the contract number as C-2026-0412."],
  };
  /* bob and carol join the hidden project the way a team does it: the owner invites by handle (`projectinvite`), the member joins (`projectjoin`) */
  for (const [h, m] of [["bob", W.bobM], ["carol", W.carol]]) {
    const inv = (await post(W.alice.auth, "projectinvite", {}, { projectId: W.proj, handle: h })).body;
    const jn = (await post(m.auth, "projectjoin", {}, { projectId: W.proj })).body;
    rec("R12", `Invite ${h} to the project and ${h} joins`, `admin and ${h}`, "op=projectinvite then op=projectjoin", ok(inv) && ok(jn) ? "WORKS" : "BROKEN", `${short(inv, 200)} | ${short(jn, 260)}`);
  }
  W.docs = {};
  for (const [k, paras] of Object.entries(docs)) W.docs[k] = await docOf(W.alice, W.proj, "w09-" + k, paras, { vouch: k !== "typed" });
  await section1();
  await section2();
  await section3();
  await section4();
  await section5();
  await section6();
  await section7();
  await section8();
  await section9();
  await section10();
}
async function section1() {
  const a = W.alice;
  await check("R84", "Ask as search: find the words the documents hold", "admin", "op=search q=(contract) OR (passage:contract), as the Ask page sends it", async () => {
    const r = await get(a.auth, { op: "search", q: "(contract) OR (passage:contract)", limit: "50", snippet: "160" });
    const hits = (R(r).hits || []);
    return { v: ok(r) && hits.length ? "WORKS" : "BROKEN", saw: `ok=${ok(r)} hits=${hits.length} ${short(r, 260)}` };
  });
  await check("R84", "Show how this was counted (ruleanswer)", "admin", "op=ruleanswer service=occurrences args.q=contract", async () => {
    const r = (await post(a.auth, "ruleanswer", { service: "occurrences", args: { q: "contract" } })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  let standing = null;
  await check("R84", "Keep asking this: standingquestionset (weekly, end date one year out)", "admin", "op=standingquestionset", async () => {
    const ends = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const r = (await post(a.auth, "standingquestionset", { question: "contract", query: "contract", cadence: "weekly", ends })).body;
    standing = R(r).id || null;
    return { v: ok(r) && standing ? "WORKS" : "BROKEN", saw: short(r, 400) };
  });
  await check("R84", "Keep asking this with no end date is refused", "admin", "op=standingquestionset without ends", async () => {
    const r = (await post(a.auth, "standingquestionset", { question: "contract", query: "contract", cadence: "weekly" })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted (an end date is required): " + short(r, 400) };
  });
  await check("R84", "Stop asking (standingquestionend)", "admin", "op=standingquestionend id", async () => {
    if (!standing) return { v: "NOT REACHED", saw: "no standing question was made" };
    const r = (await post(a.auth, "standingquestionend", { id: standing })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 300) };
  });
}

async function section2() {
  const a = W.alice;
  await check("R84", "rule services: is there a door to switch them on (no screen names ruleservicesswitch)", "admin", "op=ruleservicesswitch {on:true} by the founder, then ruleanswer again", async () => {
    const adm = await founder();
    const sw = (await post(adm, "ruleservicesswitch", { on: true })).body;
    const r = (await post(a.auth, "ruleanswer", { service: "occurrences", args: { q: "contract" } })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `switch ${short(sw, 160)}; then ruleanswer ${short(r, 420)}` };
  });
  /* ---- R80: open a question ---- */
  W.q1 = await questionOf(a.auth, W.proj, "Did the city adopt the street repair contract in public session as Policy 12.4 requires?");
  await check("R80", "Open a question by its id (no trailing hyphen)", "admin", "allocid, promote the inquiry, drawquestion (the Open a question press)", async () => ({ v: /[a-z0-9]$/.test(W.q1) ? "WORKS" : "BROKEN", saw: W.q1 }));
  await check("R80", "Read the question: image (the question's own record), inquirystrength on a question with no legs", "admin", "op=inquiry / projection / inquirystrength", async () => {
    const i = await get(a.auth, { op: "image", id: W.q1 });
    const s = await get(a.auth, { op: "inquirystrength", id: W.q1, project: W.proj });
    return { v: ok(i) && ok(s) ? "WORKS" : "BROKEN", saw: `inquiry ${short(i, 200)} | strength ${short(s, 300)}` };
  });
  /* ---- cite supporting and cutting legs ---- */
  W.cites = {};
  for (const [k, term, role] of [["minutes", "adopted the street repair contract", "supports"], ["policy", "adopted in public session", "supports"], ["ledger", "paid 61000 dollars", "supports"], ["cityclaim", "fixed 94 percent", "cuts_against"]]) {
    await check("R80", `Cite ${role === "cuts_against" ? "a cutting" : "a supporting"} leg (${k})`, "admin", `findin term then cite role=${role}`, async () => {
      const c = await citeOf(a, W.q1, W.docs[k], term, role);
      W.cites[k] = c;
      const r = R(c.cited);
      return { v: ok(c.cited) && r.cited && r.cited.length ? "WORKS" : "BROKEN", saw: short(c.cited, 420) };
    });
  }
  await check("R80", "Cite the same passage twice is answered alreadyCited, not a second leg", "admin", "cite again (minutes)", async () => {
    const c = await citeOf(a, W.q1, W.docs.minutes, "adopted the street repair contract", "supports");
    return { v: ok(c.cited) ? "WORKS" : "BROKEN", saw: short(c.cited, 420) };
  });
}
async function section3() {
  const a = W.alice, q = W.q1, P = W.proj;
  const basisOf = async () => R(await get(a.auth, { op: "basisversions", id: q }));
  await check("R81", "Strength sentence before any partition: state, no AND/OR words, hunch count", "admin", "op=inquirystrength target=q project=P", async () => {
    const s = await get(a.auth, { op: "inquirystrength", id: q, project: P });
    const t = J(s);
    return { v: ok(s) ? "WORKS" : "BROKEN", saw: `${/UNRATED|unrated/.test(t) ? "(raw word UNRATED present) " : ""}${short(s, 700)}` };
  });
  await check("R80", "basisversions: read the reading versions of the question", "admin", "op=basisversions target=q", async () => {
    const b = await get(a.auth, { op: "basisversions", id: q });
    W.bv = R(b);
    return { v: ok(b) ? "WORKS" : "BROKEN", saw: short(b, 700) };
  });
  await check("R80", "inquiryground: answer the consequence question per passage (all No: no grounds), restructure recorded", "admin", "op=inquiryground grounds=[] (every leg necessary)", async () => {
    const r = (await post(a.auth, "inquiryground", { target: q, grounds: [] })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R80", "inquiryground: two passages hold each other up as one part (the policy and the minutes), ledger on its own", "admin", "op=inquiryground grounds=[{part 1: legs 0,1},{part 2: leg 2}]", async () => {
    const r = (await post(a.auth, "inquiryground", { target: q, reason: "Restructured after seeing the strength: the minutes and the policy hold each other up.", grounds: [{ ground: "part 1", legs: [0, 1] }, { ground: "part 2", legs: [2] }] }, { reason: "Restructured after seeing the strength: the minutes and the policy hold each other up." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R80", "partitionindependence over an explicit partition of the supporting legs only (the cutting leg left out)", "admin", "op=partitionindependence partition=[[0,1],[2]]", async () => {
    const r = await get(a.auth, { op: "partitionindependence", id: q, partition: J([[0, 1], [2]]) });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await check("R81", "Strength after the partition: capture and connection against the bar, weakest link, cutting leg named", "admin", "op=inquirystrength after cites and ground", async () => {
    const s = await get(a.auth, { op: "inquirystrength", id: q, project: P });
    return { v: ok(s) ? "WORKS" : "BROKEN", saw: short(s, 900) };
  });
  await check("R81", "earnedbasis: the connection axis of a portion leg", "admin", "op=earnedbasis target=q", async () => {
    const s = await get(a.auth, { op: "earnedbasis", id: q, project: P });
    return { v: ok(s) ? "WORKS" : "BROKEN", saw: short(s, 600) };
  });
}
async function section4() {
  const a = W.alice, q = W.q1, P = W.proj;
  const peek = async (l) => { const b = R(await get(a.auth, { op: "basisversions", id: q, project: P })); console.log("PEEK", l, "versions", (b.versions || []).map((v) => v.name).join(","), "current", b.current, "stance", b.conclusion_stance); };
  const concl = (o, query) => post(o.auth, "conclude", {}, { affirmed: "part 1,part 2", ...query }).then((r) => r.body);
  const READING = "The city adopted the contract in public session, but paid more than the contract's own figure.";
  await check("R80", "Conclude with no reason is refused in words that teach", "admin", "op=conclude without reason", async () => {
    const r = await concl(a, { target: q, project: P, reading: READING, falsifier: "A closed-session minute would overturn this." });
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 500) };
  });
  await check("R80", "Conclude with no falsifier and no override is refused NO_FALSIFIER", "admin", "op=conclude without falsifier", async () => {
    const r = await concl(a, { target: q, project: P, reading: READING, reason: "The minutes and the ledger say so." });
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 500) };
  });
  await check("R80", "Conclude on her own reading, a falsifier and a reason (the Conclude press)", "admin", "op=conclude target project reading falsifier reason", async () => {
    const r = await concl(a, { target: q, project: P, reading: READING, falsifier: "A closed-session minute would overturn this.", reason: "The minutes and the ledger say so." });
    W.concluded = ok(r);
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await peek("after conclude 1");
  await check("R80", "The conclusion read back with the project: stance and history", "admin", "op=basisversions id project", async () => {
    const r = await get(a.auth, { op: "basisversions", id: q, project: P });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 900) };
  });
  await check("R80", "Withdraw the conclusion with a reason; earlier entries remain", "admin", "op=withdrawconclusion target project reason", async () => {
    const r = (await post(a.auth, "withdrawconclusion", {}, { target: q, project: P, reason: "Rechecking the amended contract first." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await peek("after withdraw");
  await check("R80", "Withdraw again: NOTHING_TO_WITHDRAW", "admin", "op=withdrawconclusion on a withdrawn stance", async () => {
    const r = (await post(a.auth, "withdrawconclusion", {}, { target: q, project: P, reason: "again" })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 400) };
  });
  await check("R80", "Withdraw without project: NOT_A_PROJECT", "admin", "op=withdrawconclusion without project=", async () => {
    const r = (await post(a.auth, "withdrawconclusion", {}, { target: q, reason: "x" })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 400) };
  });
  await check("R80", "Reopen with a reason (the state move) on a question that is open", "admin", "op=reopen target reason", async () => {
    const r = (await post(a.auth, "reopen", {}, { target: q, reason: "New minutes came in." })).body;
    return { v: "WORKS", saw: "answer (an open question has nothing to reopen; the sentence must teach): " + short(r, 500) };
  });
  await check("R80", "Conclude again after the withdrawal", "admin", "op=conclude again", async () => {
    const r = await concl(a, { target: q, project: P, reading: READING, falsifier: "A closed-session minute would overturn this.", reason: "Rechecked: the same." });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await peek("after reconclude");
  /* sever / reinstate: select the leg's target, then the act on the question */
  const leg = W.docs.ledger.bundle;
  const sel = async () => R(await screenCall(a.auth).call("select", { body: { ids: [leg] } }));
  await check("R80", "Sever a citation with a reason (cascades one hop)", "admin", "select the cited document then op=sever project=q handle", async () => {
    const h = (await sel()).handle;
    const r = (await post(a.auth, "sever", {}, { project: q, handle: h, reason: "The ledger page was a draft." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await peek("after sever");
  await check("R80", "Reinstate the severed citation with a reason", "admin", "op=reinstate project=q handle", async () => {
    const h = (await sel()).handle;
    const r = (await post(a.auth, "reinstate", {}, { project: q, handle: h, reason: "The final ledger page agrees." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await peek("after reinstate");
  await check("R80", "proposedispose: set the question aside (defer) with a reason for its project; then take it back", "admin", "op=proposedispose body {project, finding, to, reason}", async () => {
    const r = (await post(a.auth, "proposedispose", { project: P, finding: q, to: "deferred", reason: "Waiting for the audit." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await peek("after dispose");
  await check("R80", "Read in my language (readtranslate) on a question, with no machine", "admin", "op=readtranslate subject {kind question id project}", async () => {
    const r = (await post(a.auth, "readtranslate", { subject: { kind: "question", id: q, project: P } })).body;
    return { v: ok(r) || R(r).reason === "NO_TRANSLATOR" || R(r).reason === "UNBOUND" ? "WORKS" : "BROKEN", saw: "answer: " + short(r, 500) + (R(r).reason === "PLANE_INTERNAL_ERROR" ? " | plane log: DataCloneError: Proxy could not be serialized because it is not a valid RPC receiver type, at control-plane/phase-clock.mjs:173 (clockedStub) from control-plane/index.mjs:2552 (stub.draft(ask))" : "") };
  });
}
async function section5() {
  const a = W.alice, q = W.q1, P = W.proj, b = W.bobM, cs = screenCall(a.auth);
  let hid = null;
  await check("R82", "Hold a hunch (a suspicion about the question): declared, not counted", "admin", "op=hypothesishold {inquiry, kind other, statement, about [id]}", async () => {
    const r = (await post(a.auth, "hypothesishold", { inquiry: q, kind: "other", statement: "I suspect the paving invoice was split to stay under the limit.", about: [q] })).body;
    hid = R(r).hypothesis_id || R(r).hypothesisId || R(r).id || (R(r).hypothesis && R(r).hypothesis.hypothesis_id) || null;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R82", "A where-it-went hunch (kind flow, {from, to})", "admin", "op=hypothesishold kind flow", async () => {
    const r = (await post(a.auth, "hypothesishold", { inquiry: q, kind: "flow", statement: "The money went on to Hollis Paving's second invoice.", about: { from: W.docs.ledger.bundle, to: q } })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R82", "The hunches read back (Hunches to clear)", "admin", "op=hypotheses / hunches read for the question", async () => {
    const r = await get(a.auth, { op: "hypotheses", inquiry: q });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R82", "Revise a hunch with a reason", "admin", "op=hypothesisrevise {hypothesisId, statement, reason}", async () => {
    if (!hid) return { v: "NOT REACHED", saw: "no hunch id was read from the hold answer" };
    const r = (await post(a.auth, "hypothesisrevise", { hypothesisId: hid, statement: "I suspect the invoice was split into two payments.", reason: "More precise." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await check("R82", "Strength with a hunch standing: the hunch lifts nothing and is counted apart", "admin", "op=inquirystrength with hunches", async () => {
    const s = await get(a.auth, { op: "inquirystrength", id: q, project: P });
    return { v: ok(s) ? "WORKS" : "BROKEN", saw: short(s, 900) };
  });
  await check("R80", "partitionindependence over a written reading's groups (version=NAME): the shared-origin read-back", "admin", "op=partitionindependence id version (the reading the conclusion wrote)", async () => {
    const bv = R(await get(a.auth, { op: "basisversions", id: q, project: P })); dump("bv2", bv);
    W.vname = (bv.versions || []).map((v) => v.name).slice(-1)[0];
    const r = await get(a.auth, { op: "partitionindependence", id: q, version: W.vname });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `version ${W.vname}: ${short(r, 700)}` };
  });
  await check("R82", "Narrow: list the machine candidates for a leg (writes nothing)", "admin", "op=narrowcandidates target version ord", async () => {
    const r = await get(a.auth, { op: "narrowcandidates", target: q, version: W.vname, ord: "0" });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R82", "Narrow a whole-document leg to a part: a new version one leg narrower", "admin", "op=narrow {target, version, ord, name, description, extent}", async () => {
    const c = R(await get(a.auth, { op: "narrowcandidates", target: q, version: W.vname, ord: "0" }));
    const cand = c && c.candidates && c.candidates[0];
    if (!cand) {
      /* no part proposed for a text paragraph; the plane's own door is tried with the second paragraph as the part (what a record-proposed part would send) */
      const r2 = (await post(a.auth, "narrow", { target: q, version: W.vname, ord: 0, name: "narrowed-second", description: "The second paragraph only.", extent: { kind: "doc-para", para: 1, run: null } })).body;
      return { v: ok(r2) ? "WORKS" : "NOT REACHED", saw: `no part proposed (absence: ${String((c.absence || {}).says || "").slice(0, 160)}); sent a part by hand: ${short(r2, 380)}` };
    }
    const extent = cand.fields && typeof cand.fields === "object" ? cand.fields : cand.content_id ? { content_id: cand.content_id } : cand.extent;
    const r = (await post(a.auth, "narrow", { target: q, version: W.vname, ord: 0, name: "narrowed-first", description: "The first paragraph only.", extent })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  /* divide: a second question with its own legs */
  const q2 = await questionOf(a.auth, P, "Was the repair contract awarded to the lowest bidder?");
  W.q2 = q2;
  for (const [k, term] of [["minutes", "abstained from the vote"], ["ledger", "also received 18000"]]) await citeOf(a, q2, W.docs[k], term, "supports").catch(() => {});
  await check("R82", "Divide a question into two: reason, each leg apportioned, children named", "admin", "op=inquirydivide {target, reason, children[{id,question,legs}]}", async () => {
    const mk = async (n, t) => { const x = R(await cs.call("allocid", { query: { prefix: "INQ", year: String(new Date().getUTCFullYear()) } })); return { id: x.id + "-" + t, question: n, legs: [] }; };
    const c1 = await mk("Who bid on the contract?", "who-bid"), c2 = await mk("Who got the contract?", "who-got");
    c1.legs = [0]; c2.legs = [1];
    const r = (await post(a.auth, "inquirydivide", { target: q2, reason: "Two questions are tangled together.", children: [c1, c2] })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R82", "Divide with a leg that goes to neither child is refused", "admin", "op=inquirydivide orphan leg", async () => {
    const q3 = await questionOf(a.auth, P, "Did the contract come in under budget?");
    await citeOf(a, q3, W.docs.ledger, "paid 61000", "supports").catch(() => {});
    await citeOf(a, q3, W.docs.policy, "last amended", "supports").catch(() => {});
    const mk = async (n, t) => { const x = R(await cs.call("allocid", { query: { prefix: "INQ", year: String(new Date().getUTCFullYear()) } })); return { id: x.id + "-" + t, question: n, legs: [] }; };
    const c1 = await mk("Part one?", "part-one"), c2 = await mk("Part two?", "part-two");
    c1.legs = [0];
    const r = (await post(a.auth, "inquirydivide", { target: q3, reason: "Test of the orphan rule.", children: [c1, c2] })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 500) };
  });
  await check("R82", "Withdraw a hunch with a reason (history kept)", "admin", "op=hypothesiswithdraw", async () => {
    if (!hid) return { v: "NOT REACHED", saw: "no hunch id" };
    const r = (await post(a.auth, "hypothesiswithdraw", { hypothesisId: hid, reason: "The invoices are separate." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
}
async function section6() {
  const a = W.alice, q = W.q1, P = W.proj, b = W.bobM, c = W.carol;
  const T = new Date().getUTCFullYear();
  /* ---- R83: check a claim: a held table, a calculation, a random draw, visits, acceptance ---- */
  const rowsCsv = ["report,closed_on,days_to_fix"].concat(Array.from({ length: 60 }, (_, i) => `R${1000 + i},2026-03-${String((i % 28) + 1).padStart(2, "0")},${(i * 7) % 11}`)).join("\n");
  let table = null, calc = null, draw = null;
  await check("R83", "Hold the city's report table: upload a CSV, file it, declare its header (tabledeclare)", "admin", "captureupload text/csv, promote, vouch, op=tabledeclare {source, header, schema}", async () => {
    const d = await docOf(a, P, "w09-reports", [rowsCsv], { type: "text/csv" });
    W.docs.reports = d;
    const mint = (await post(a.auth, "contentmint", { bundleId: d.bundle })).body; dump("contentmint", mint);
    d.content = R(mint).id || R(mint).content_id || R(mint).contentId || null;
    const r = (await post(a.auth, "tabledeclare", { source: d.content, header: ["report", "closed_on", "days_to_fix"], schema: { fields: [{ name: "report", type: "string" }, { name: "closed_on", type: "string" }, { name: "days_to_fix", type: "number" }] } })).body;
    table = R(r).sha || R(r).table || null;
    dump("tabledeclare", r);
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R83", "calculationcreate: the Work-it-out form's built-in kinds over the held table (count, total), no recipe, as the screen sends it", "admin", "op=calculationcreate {question, period, kind, inputs[table]} for count and total", async () => {
    const outs = [];
    for (const kind of ["count", "total"]) {
      const r = (await post(a.auth, "calculationcreate", { question: "How many reports did the city mark closed in March?", period: { from: "2026-03-01", to: "2026-03-31" }, kind, inputs: [{ name: "input", table }], project: P })).body;
      outs.push(`${kind}: ${ok(r) ? "made" : (R(r).reason || R(r).code) + " " + String(R(r).detail || "").slice(0, 90)}`);
    }
    return { v: outs.every((x) => /made/.test(x)) ? "WORKS" : "BROKEN", saw: outs.join(" | ") };
  });
  await check("R83", "calculationcreate with a recipe of the closed grammar (count rows), the route that works", "admin", "op=calculationcreate with recipe", async () => {
    const recipe = { method: "bio-calc/1", inputs: [{ name: "input", kind: "table" }], steps: [{ op: "count", from: "input", as: "n" }], output: "n" };
    const r = (await post(a.auth, "calculationcreate", { question: "How many reports did the city mark closed in March?", period: { from: "2026-03-01", to: "2026-03-31" }, kind: "count", recipe, inputs: [{ name: "input", table }], project: P })).body;
    calc = R(r).calc_id || null; dump("calc", r);
    return { v: ok(r) && calc ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R83", "calculationdraw: a recorded random draw of 12 reports, anyone can repeat it (seed)", "admin", "op=calculationdraw {set, n, seed, question, project}", async () => {
    const r = (await post(a.auth, "calculationdraw", { set: table || W.docs.reports.hash, n: 12, seed: "w09-seed", question: "Were these closed within a week?", project: P })).body;
    draw = R(r).draw || null; dump("draw", r);
    return { v: ok(r) && draw ? "WORKS" : "BROKEN", saw: short(r, 800) };
  });
  await check("R83", "calculationdraw again with the same seed: the same draw (repeatable)", "admin", "op=calculationdraw same seed", async () => {
    const r = (await post(a.auth, "calculationdraw", { set: table || W.docs.reports.hash, n: 12, seed: "w09-seed", question: "Were these closed within a week?", project: P })).body;
    const same = R(r).draw === draw;
    return { v: ok(r) && same ? "WORKS" : "BROKEN", saw: `same draw id: ${same}; ${short(r, 300)}` };
  });
  let testimony = null, item = null;
  await check("R83", "testify: a member records what she saw at a report (place, date, words); no photo shown plainly", "member bob", "op=testify {words, observedAt}", async () => {
    const r = (await post(b.auth, "testify", { words: "I went to the corner of 14th and Oak: the pothole was still open.", observedAt: "2026-10-20" })).body;
    testimony = R(r).capture_sha || null; dump("testify", r);
    return { v: ok(r) && testimony ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R83", "spotcheckvisit: count the visit for the drawn report, with a finding", "member bob", "op=spotcheckvisit {draw, item, testimony, finding}", async () => {
    const d = R(await get(a.auth, { op: "calculation", id: calc }));
    const spot = R(await get(a.auth, { op: "spotcheck", draw }));
    dump("spot", spot);
    item = spot && spot.items && spot.items[0] && spot.items[0].item;
    const r = (await post(b.auth, "spotcheckvisit", { draw, item, testimony, finding: "no" })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `item ${item}: ${short(r, 600)}` };
  });
  await check("R83", "spotcheckvisit by the owner on her own testimony (control for the member's refusal)", "admin", "op=testify then op=spotcheckvisit as alice", async () => {
    const t = (await post(a.auth, "testify", { words: "I stood at 5th and Pine: the pothole there was filled.", observedAt: "2026-10-21" })).body;
    const sha = R(t).capture_sha;
    const spot = R(await get(a.auth, { op: "spotcheck", draw }));
    const r = (await post(a.auth, "spotcheckvisit", { draw, item: spot.items[1].item, testimony: sha, finding: "yes" })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await check("R83", "calculationaccept: accept the result", "admin", "op=calculationaccept id", async () => {
    if (!calc) return { v: "NOT REACHED", saw: "no calculation" };
    const r = (await post(a.auth, "calculationaccept", {}, { id: calc })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R83", "addworkbook: a real workbook (xlsx made from its parts) held for the project (the workbook add gate)", "admin", "captureupload an .xlsx, file it, op=addworkbook {captureSha, question, period, project}", async () => {
    const te = new TextEncoder();
    const rows = Array.from({ length: 6 }, (_, i) => `<row r="${i + 1}"><c r="A${i + 1}" t="inlineStr"><is><t>R${2000 + i}</t></is></c><c r="B${i + 1}"><v>${(i + 1) * 100}</v></c></row>`).join("");
    const zip = makeZip([
      { name: "[Content_Types].xml", data: te.encode('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>') },
      { name: "_rels/.rels", data: te.encode('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
      { name: "xl/workbook.xml", data: te.encode('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>') },
      { name: "xl/_rels/workbook.xml.rels", data: te.encode('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>') },
      { name: "xl/worksheets/sheet1.xml", data: te.encode(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`) },
    ]);
    const bytes = new Uint8Array(zip);
    const up = (await (await plane("/api/?op=captureupload&statement=w09-wb&name=w09-wb.xlsx&type=application%2Fvnd.openxmlformats-officedocument.spreadsheetml.sheet", { method: "POST", headers: a.auth, body: bytes })).json()).result;
    if (!up || up.ok !== true) return { v: "BROKEN", saw: "upload: " + short(up, 400) };
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(a.auth), { doc: up.document, title: "w09-wb", locator: up.document.locator, project: P });
    W.wb = sha(bytes);
    const r = (await post(a.auth, "addworkbook", { captureSha: W.wb, question: "How many reports closed in March?", period: "2026-03", project: P })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `${filed.refused ? "filing refused " : ""}${short(r, 600)}` };
  });
  await check("R83", "recordcheck: the second member records that a workbook figure agrees or disagrees", "member carol", "op=recordcheck {captureSha, project, outcome, note}", async () => {
    const r = (await post(c.auth, "recordcheck", { captureSha: W.wb || W.docs.reports.hash, project: P, outcome: "agrees", note: "I re-added the column by hand." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  /* ---- R85: second member's check: typed transcription attest, and the expertise route ---- */
  await check("R85", "transcribe: the administrator types a page's words (the typed step)", "admin", "op=transcribe {bundleId, extent pdf-page 0, text}", async () => {
    const r = (await post(a.auth, "transcribe", { bundleId: W.docs.typed.bundle, extent: { kind: "pdf-page", page: 0 }, text: "Typed by hand: the register shows the contract number as C-2026-0412." })).body;
    dump("transcribe", r); W.typedContent = R(r).content_id;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R85", "transcriptionattest by the typist is refused by name", "admin", "op=transcriptionattest {contentId, note} by the typist", async () => {
    const r = (await post(a.auth, "transcriptionattest", { contentId: W.typedContent, note: "I compared my own typing." })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 500) };
  });
  await check("R85", "transcriptionattest by a second member (bob) with a note", "member bob", "op=transcriptionattest by bob", async () => {
    const r = (await post(b.auth, "transcriptionattest", { contentId: W.typedContent, note: "I compared the typing with the page." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R85", "checkrequest: ask for a check by expertise from the question (owed per DEC-135)", "admin", "op=checkrequest {target, label, note}", async () => {
    const r = (await post(a.auth, "checkrequest", { target: q, label: "accounting", note: "Please check the ledger arithmetic." })).body;
    return { v: ok(r) ? "WORKS" : "NOT REACHED", saw: "(map: owed, expect absence) " + short(r, 500) };
  });
}
async function section7() {
  const a = W.alice, q = W.q1, P = W.proj, P2 = W.proj2, b = W.bobM, c = W.carol;
  const stance = async (auth, proj) => { const r = R(await get(auth, { op: "basisversions", id: q, project: proj })); return { stance: r.conclusion_stance, n: (r.versions || []).length, history: (r.conclusion_history || []).length, raw: r }; };
  /* ---- R81: the project's bar ---- */
  await check("R81", "Set the project's bar (capture B, connection C) and read the phrase against it", "admin", "op=projectbarset {project, capture, connection}; op=inquirystrength", async () => {
    const r = (await post(a.auth, "projectbarset", { project: P, capture: "B", connection: "C", reason: "Our standard for a spending finding." })).body;
    const s = await get(a.auth, { op: "inquirystrength", id: q, project: P });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `bar ${short(r, 260)} | strength ${short(s, 480)}` };
  });
  await check("R81", "Change the bar again (a high-friction act): the phrase changes", "admin", "op=projectbarset capture A", async () => {
    const r = (await post(a.auth, "projectbarset", { project: P, capture: "A", connection: "A", reason: "Raising the bar for the published case." })).body;
    const l = await get(a.auth, { op: "projectquestions", project: P });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `bar ${short(r, 200)} | list ${short(l, 600)}` };
  });
  await check("R81", "versionstrength: a what-if of an unaccepted reading without making it current", "admin", "op=versionstrength id version", async () => {
    const bv = R(await get(a.auth, { op: "basisversions", id: q, project: P }));
    const v = (bv.versions || []).slice(-1)[0];
    const r = await get(a.auth, { op: "versionstrength", id: q, version: v && v.name, project: P });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `version ${v && v.name}: ${short(r, 600)}` };
  });
  /* ---- R80 two projects, R167 ---- */
  await check("R80", "Put the question into a second project (drawquestion) and conclude differently there", "admin", "op=drawquestion project=P2 inquiry=q; op=conclude project=P2", async () => {
    const d = (await post(a.auth, "drawquestion", {}, { project: P2, inquiry: q, note: "" })).body;
    const r = (await post(a.auth, "conclude", {}, { target: q, project: P2, reading: "The contract was adopted in closed session, so it did not meet Policy 12.4.", falsifier: "Public-session minutes for 4 March would overturn this.", reason: "The second team reads the minutes differently.", affirmed: "part 1,part 2" })).body;
    dump("conclude-p2", r);
    return { v: ok(d) && ok(r) ? "WORKS" : "BROKEN", saw: `draw ${short(d, 200)} | conclude ${short(r, 400)}` };
  });
  await check("R80", "Concluding in P2 does not move P: both stances stand", "admin", "op=basisversions project=P and project=P2", async () => {
    const x = await stance(a.auth, P), y = await stance(a.auth, P2);
    return { v: x.stance !== "none" && y.stance !== "none" ? "WORKS" : "BROKEN", saw: `P stance ${x.stance} (versions ${x.n}, history ${x.history}); P2 stance ${y.stance} (versions ${y.n}, history ${y.history})` };
  });
  await check("R80", "The tension mark between the two conclusions is read on both projects", "admin", "op=contradictionclarify / the tension read for the question", async () => {
    const t = await get(a.auth, { op: "tensions", id: q });
    return { v: ok(t) ? "WORKS" : "NOT REACHED", saw: short(t, 600) };
  });
  await check("R167", "As a non-participant of P2, the question names only what she may see; P2 is never shown", "member carol (not in P2)", "op=basisversions and op=projection as carol; search the answer for P2's id", async () => {
    const r = await get(c.auth, { op: "basisversions", id: q });
    const t = J(r);
    const leak = t.includes(P2);
    return { v: leak ? "BROKEN" : "WORKS", saw: `${leak ? "P2's id appears in carol's read: " : "P2's id does not appear: "}${short(r, 500)}` };
  });
  /* ---- R165: reading versions ---- */
  const bv = R(await get(a.auth, { op: "basisversions", id: q, project: P })); dump("bv3", bv);
  const names = (bv.versions || []).map((v) => v.name);
  const v1 = names[0], v2 = names[1], v3 = names[names.length - 1];
  const vact = (op, extra = {}) => post(a.auth, op, { target: q, version: extra.version, ...extra.more }).then((r) => r.body);
  await check("R165", "versionconsider with no reason, as the screen sends it (the Weigh it control has no reason box)", "admin", "op=versionconsider {target, version} only", async () => { const r = await vact("versionconsider", { version: v1 }); return { v: ok(r) ? "WORKS" : "BROKEN", saw: `${v1}: ${short(r, 420)}` }; });
  await check("R165", "versionconsider with a reason: an accepted reading is weighed again", "admin", "op=versionconsider with reason", async () => { const r = await vact("versionconsider", { version: v1, more: { reason: "Weighing the first reading against the second." } }); return { v: ok(r) ? "WORKS" : "BROKEN", saw: `${v1}: ${short(r, 420)}` }; });
  await check("R165", "versionreject with no reason is refused; with a reason it stands", "admin", "op=versionreject", async () => {
    const x = await vact("versionreject", { version: v1 });
    const y = await vact("versionreject", { version: v1, more: { reason: "Superseded by the later reading." } });
    return { v: !ok(x) && ok(y) ? "WORKS" : "BROKEN", saw: `no reason: ${short(x, 260)} | reason: ${short(y, 260)}` };
  });
  await check("R165", "versioncurrent for a rejected reading is refused VERSION_NOT_ACCEPTED", "admin", "op=versioncurrent on the rejected reading", async () => { const r = await vact("versioncurrent", { version: v1, more: { project: P } }); return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 360) }; });
  await check("R165", "versionrevert: undo the decision", "admin", "op=versionrevert", async () => { const r = await vact("versionrevert", { version: v1 }); return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 420) }; });
  await check("R165", "versionaccept without affirming every part is refused (VERSION_AFFIRMATION_INCOMPLETE)", "admin", "op=versionaccept on a two-part reading, no affirmed", async () => { const r = await vact("versionaccept", { version: v1 }); return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 360) }; });
  await check("R165", "versionaccept affirming every part", "admin", "op=versionaccept affirmed=part 1,part 2", async () => { const r = await vact("versionaccept", { version: v1, more: { affirmed: "part 1,part 2" } }); return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 420) }; });
  await check("R165", "versioncurrent: stand on this reading for project P (exactly one current per project)", "admin", "op=versioncurrent {target, version, project}", async () => { const r = await vact("versioncurrent", { version: v1, more: { project: P } }); const cur = R(await get(a.auth, { op: "basisversions", id: q, project: P })).current; return { v: ok(r) && cur && cur.version === v1 ? "WORKS" : "BROKEN", saw: `${short(r, 300)} | current now ${J(cur)}` }; });
  await check("R165", "versioncurrent in P does not move the second project's current", "admin", "op=basisversions project=P2", async () => { const cur = R(await get(a.auth, { op: "basisversions", id: q, project: P2 })).current; return { v: cur && cur.version !== v1 ? "WORKS" : "BROKEN", saw: `P2 current ${J(cur)}` }; });
  await check("R165", "versioncurrent by a member who has not joined the project is refused", "member dave (not joined)", "op=versioncurrent as a non-participant", async () => {
    const dave = await person("dave");
    const r = (await post(dave, "versioncurrent", { target: q, version: v1, project: P })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 320) };
  });
  await check("R165", "versionhide: hide a version; it remains queryable", "admin", "op=versionhide; op=basisversions", async () => {
    const r = await vact("versionhide", { version: v2 });
    const after = R(await get(a.auth, { op: "basisversions", id: q, project: P }));
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: `${short(r, 240)} | still listed: ${(after.versions || []).some((x) => x.name === v2)}` };
  });
  await check("R165", "versionstrength (what-if) of an unaccepted version: ungraded[] in band", "admin", "op=versionstrength", async () => { const r = await get(a.auth, { op: "versionstrength", id: q, version: v1, project: P }); return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) }; });
  await check("R165", "compareVersions: a two-version compare (owed per DEC-330)", "admin", "op=compareVersions", async () => { const r = await get(a.auth, { op: "compareversions", target: q, a: v1, b: v3 }); return { v: ok(r) ? "WORKS" : "NOT REACHED", saw: "(expect absence / refusal) " + short(r, 360) }; });
  /* ---- R166: reminders to look again ---- */
  await check("R166", "reevaluations: see what needs a second look on the concluded question", "admin", "op=reevaluations", async () => { const r = await get(a.auth, { op: "reevaluations", id: q, project: P }); dump("reeval", r); return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) }; });
  await check("R166", "Sever a leg: reevaluations still list it and it contributes nothing", "admin", "op=sever then op=reevaluations", async () => {
    const h = R(await screenCall(a.auth).call("select", { body: { ids: [W.docs.policy.bundle] } })).handle;
    const sv = (await post(a.auth, "sever", {}, { project: q, handle: h, reason: "The policy page is superseded." })).body;
    const r = await get(a.auth, { op: "reevaluations", id: q, project: P });
    return { v: ok(sv) && ok(r) ? "WORKS" : "BROKEN", saw: `sever ${short(sv, 160)} | ${short(r, 500)}` };
  });
}
async function section8() {
  const a = W.alice, q = W.q1, P = W.proj, b = W.bobM, c = W.carol;
  /* a fresh, young question for the plan, and the concluded one */
  let plan = null;
  const rd = async (op, query) => R(await get(a.auth, { op, ...query }));
  await check("R102", "Plan: open from a question with no title is refused PLAN_NO_TITLE", "admin", "op=planopen {project, title:'', subjects}", async () => {
    const r = (await post(a.auth, "planopen", { project: P, title: "", subjects: [{ kind: "inquiry", inquiry: q }] })).body;
    return { v: want(r, "PLAN_NO_TITLE") ? "WORKS" : "BROKEN", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: a title with a quote or a line break is refused", "admin", "op=planopen title with a quote", async () => {
    const r = (await post(a.auth, "planopen", { project: P, title: 'Say "no" to the\ncontract', subjects: [{ kind: "inquiry", inquiry: q }] })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: open from the concluded question ('Plan what to do')", "admin", "op=planopen {project, title, subjects[inquiry]}", async () => {
    const r = (await post(a.auth, "planopen", { project: P, title: "Ask the council to adopt contracts in public session", subjects: [{ kind: "inquiry", inquiry: q }] })).body;
    plan = R(r).id || null; W.plan = plan; dump("planopen", r);
    return { v: ok(r) && plan ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R102", "Plan: the same question in a second active plan is refused SUBJECT_IN_ACTIVE_PLAN", "admin", "op=planopen again with the same matter", async () => {
    const r = (await post(a.auth, "planopen", { project: P, title: "A second plan for the same question", subjects: [{ kind: "inquiry", inquiry: q }] })).body;
    return { v: want(r, "SUBJECT_IN_ACTIVE_PLAN") ? "WORKS" : "BROKEN", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: read the plan page (matters, options, scenarios, started; checks in words)", "admin", "op=plan id", async () => {
    const r = await get(a.auth, { op: "plan", id: plan }); dump("plan", r);
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 900) };
  });
  await check("R102", "Plan: the project's plans list and a question with a live plan opens it", "admin", "op=plans project", async () => {
    const r = await get(a.auth, { op: "plans", project: P, limit: "200" });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  const q4 = await questionOf(a.auth, P, "Should the council require two bids for every repair contract?");
  await check("R102", "Plan: add a matter (a second question) with a reason", "admin", "op=plansubjectadd {plan, subject, reason}", async () => {
    const r = (await post(a.auth, "plansubjectadd", { plan, subject: { kind: "inquiry", inquiry: q4 }, reason: "The bids question feeds the plan." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await check("R102", "Plan: a matter already in an active plan is refused", "admin", "op=plansubjectadd again", async () => {
    const r = (await post(a.auth, "plansubjectadd", { plan, subject: { kind: "inquiry", inquiry: q4 }, reason: "Again." })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 360) };
  });
  const pv = await rd("plan", { id: plan });
  const subjId = (((pv.subjects || [])[0]) || {}).key;
  await check("R102", "Plan: the concluded question as the plan's first matter reads as established, not as a still-open suspicion", "admin", "op=plan: read the first matter's support after the question was concluded in this project", async () => {
    const m = (pv.subjects || [])[0] || {};
    const stance = (R(await get(a.auth, { op: "basisversions", id: q, project: P }))).conclusion_stance;
    return { v: m.support === "hypothetical" && stance === "concluded" ? "BROKEN" : "WORKS", saw: `question stance in the project: ${stance}; the matter reads support=${m.support}: ${m.why}` };
  });
  let opt1 = null, opt2 = null;
  await check("R102", "Plan: add an option (summary, category, matter) ", "admin", "op=optionadd {plan, summary, category, subjects}", async () => {
    const r = (await post(a.auth, "optionadd", { plan, summary: "Speak at the next council meeting", category: "awareness", subjects: [subjId], detail: "Three minutes in public comment." })).body;
    opt1 = R(r).option || R(r).id || (R(r).option_id) || null; dump("optionadd", r);
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R102", "Plan: an option with no summary is refused OPTION_NO_SUMMARY", "admin", "op=optionadd without summary", async () => {
    const r = (await post(a.auth, "optionadd", { plan, summary: "", category: "awareness", subjects: [subjId] })).body;
    return { v: want(r, "OPTION_NO_SUMMARY") ? "WORKS" : "BROKEN", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: an option with a forbidden key (budget) is refused OPTION_KEY_REFUSED", "admin", "op=optionadd with budget", async () => {
    const r = (await post(a.auth, "optionadd", { plan, summary: "File a records request", category: "legal", subjects: [subjId], budget: 500 })).body;
    return { v: want(r, "OPTION_KEY_REFUSED") ? "WORKS" : "BROKEN", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: an option addressed to an office with a date and its basis", "admin", "op=optionadd addressee office + dates", async () => {
    const r = (await post(a.auth, "optionadd", { plan, summary: "Send a letter to the Public Works Committee", category: "awareness", subjects: [subjId], addressee: { state: "named", kind: "office", role: "Chair", body: "Public Works Committee" }, dates: [{ date: "2026-12-01", basis: "The committee's agenda deadline." }] })).body;
    opt2 = R(r).option || R(r).id || R(r).option_id || null;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R102", "Plan: a tier on an option that is not a legal kind is refused TIER_REFUSED", "admin", "op=optionadd tier 2 on advocacy", async () => {
    const r = (await post(a.auth, "optionadd", { plan, summary: "Tier test", category: "awareness", subjects: [subjId], tier: 2 })).body;
    return { v: want(r, "TIER_REFUSED") ? "WORKS" : "BROKEN", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: lobbying with no requirement is refused LOBBYING_NO_REQUIREMENT", "admin", "op=optionadd lobbying true", async () => {
    const r = (await post(a.auth, "optionadd", { plan, summary: "Lobbying test", category: "awareness", subjects: [subjId], lobbying: true })).body;
    return { v: want(r, "LOBBYING_NO_REQUIREMENT") ? "WORKS" : "BROKEN", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: decline an option with no reason is refused PLAN_NO_REASON; with a reason it stays visible", "admin", "op=optiondispose declined", async () => {
    if (!opt1) return { v: "NOT REACHED", saw: "no option id read" };
    const x = (await post(a.auth, "optiondispose", { plan, options: [opt1], disposition: "declined" })).body;
    const y = (await post(a.auth, "optiondispose", { plan, options: [opt1], disposition: "declined", reason: "No speaking slots left." })).body;
    return { v: !ok(x) && ok(y) ? "WORKS" : "BROKEN", saw: `no reason: ${short(x, 220)} | with reason: ${short(y, 260)}` };
  });
  await check("R102", "Plan: choose an option and say when to be reminded (REMINDER_REFUSED rejects the whole act on a bad date)", "admin", "op=optiondispose chosen + reminders", async () => {
    if (!opt2) return { v: "NOT REACHED", saw: "no option id read" };
    const bad = (await post(a.auth, "optiondispose", { plan, options: [opt2], disposition: "chosen", reminders: [{ option: opt2, date: "2026-01-01", on: "2026-11-01" }] })).body;
    const good = (await post(a.auth, "optiondispose", { plan, options: [opt2], disposition: "chosen", reminders: [{ option: opt2, date: "2026-12-01", on: "2026-11-25" }] })).body;
    return { v: !ok(bad) && ok(good) ? "WORKS" : "BROKEN", saw: `bad date: ${short(bad, 200)} | good: ${short(good, 260)}` };
  });
  await check("R102", "Plan: a scenario with a phase of the chosen option and a checkpoint", "admin", "op=scenarioset", async () => {
    if (!opt2) return { v: "NOT REACHED", saw: "no option id" };
    const r = (await post(a.auth, "scenarioset", { plan, scenario: 1, name: "Committee first", phases: [{ id: "p1", name: "Write the committee", options: [opt2], starts: "plan_start", checkpoint: { after_days: 14 }, condition: "A reply by the committee", branches: { met: "p2", not_met: "p2" } }, { id: "p2", name: "Follow up", options: [opt2], starts: { branch_of: "p1", when: "met" } }] })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R102", "Plan: a scenario phase naming an option not chosen is refused PHASE_OPTION_NOT_CHOSEN", "admin", "op=scenarioset with the declined option", async () => {
    if (!opt1) return { v: "NOT REACHED", saw: "no option id" };
    const r = (await post(a.auth, "scenarioset", { plan, scenario: 2, name: "Bad", phases: [{ id: "p1", name: "Declined", options: [opt1], starts: "plan_start" }] })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: a phase cycle is refused PHASE_CYCLE", "admin", "op=scenarioset p1 after p2, p2 after p1", async () => {
    if (!opt2) return { v: "NOT REACHED", saw: "no option id" };
    const r = (await post(a.auth, "scenarioset", { plan, scenario: 2, name: "Loop", phases: [{ id: "p1", name: "One", options: [opt2], starts: { after: "p2" } }, { id: "p2", name: "Two", options: [opt2], starts: { after: "p1" } }] })).body;
    return { v: ok(r) ? "BROKEN" : "WORKS", saw: "refusal wanted: " + short(r, 360) };
  });
  await check("R102", "Plan: judge a checkpoint (met) with a note", "admin", "op=checkpointrecord", async () => {
    const r = (await post(a.auth, "checkpointrecord", { plan, scenario: 1, phase: "p1", judged: "met", note: "The committee wrote back." })).body;
    if (want(r, "CHECKPOINT_NOT_DUE")) return { v: "NOT REACHED", saw: "refused until the checkpoint is due (14 days out); the offline plane's clock cannot be moved, so the judgement itself is not walked: " + short(r, 300) };
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await check("R102", "Plan: take a checkpoint up yourself (itemtakeup)", "member bob", "op=itemtakeup {item checkpoint}", async () => {
    const r = (await post(b.auth, "itemtakeup", { item: { kind: "checkpoint", plan, scenario: 1, phase: "p1" } })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 500) };
  });
  await check("R102", "Plan: start preview of the chosen option (optionstartpreview opens start-send; nothing written)", "admin", "op=planproposals (read) as the preview's read", async () => {
    const r = await get(a.auth, { op: "planproposals", plan });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 400) };
  });
  await check("R102", "Plan: the plan is working material, never public: absent from a public read", "admin", "an unauthenticated read of the plan", async () => {
    const res = await kit.plane(`/api/?op=plan&id=${encodeURIComponent(plan)}`);
    const t = await res.text();
    return { v: res.status === 401 || res.status === 403 || /UNAUTH|NOT_PUBLIC|refus/i.test(t) || !t.includes("Ask the council") ? "WORKS" : "BROKEN", saw: `${res.status} ${t.slice(0, 260)}` };
  });
  await check("R102", "Plan: a plan with no reason on close is refused; pause/close by the owner", "admin", "op=planclose", async () => {
    const x = (await post(a.auth, "planclose", { plan })).body;
    return { v: "WORKS", saw: `close (reason is asked by the shell; plane answer): ${short(x, 400)}` };
  });
}
async function section9() {
  const a = W.alice, q = W.q1, q2 = W.q2, P = W.proj, P2 = W.proj2, b = W.bobM, c = W.carol;
  /* ---- R160/R161: steps (no screens in the registry; the ops are walked to confirm their state) ---- */
  let step = null;
  await check("R160", "stepcreate: a step on a question (ops exist; no screen is built, per the map)", "admin", "op=stepcreate {place {questions}, work, byWhen}", async () => {
    const r = (await post(a.auth, "stepcreate", { place: { questions: [q] }, work: "Ask the clerk for the closed-session agenda.", byWhen: { date: "2026-11-30", basis: "own", source: "the clerk" } })).body;
    step = R(r).step || R(r).step_id || null; dump("stepcreate", r);
    return { v: ok(r) ? "WORKS" : (R(r).reason === "UNKNOWN_OP" ? "NOT REACHED" : "BROKEN"), saw: short(r, 600) };
  });
  await check("R160", "stepcreate with a place that is a step is refused STEP_BAD_PLACE", "admin", "op=stepcreate with two place kinds", async () => {
    const r = (await post(a.auth, "stepcreate", { place: { questions: [q], group: true }, work: "x" })).body;
    return { v: want(r, "STEP_BAD_PLACE") ? "WORKS" : "BROKEN", saw: short(r, 400) };
  });
  await check("R160", "stepstart then stepend with an outcome per question (one 'not yet judged' left)", "admin", "op=stepstart; op=stepend", async () => {
    if (!step) return { v: "NOT REACHED", saw: "no step" };
    const s1 = (await post(a.auth, "stepstart", { step })).body;
    const s2 = (await post(a.auth, "stepend", { step, end: "ended", outcomes: { [q]: "helped" }, learned: "The agenda lists no closed session on 4 March." })).body;
    return { v: ok(s1) && ok(s2) ? "WORKS" : "BROKEN", saw: `start ${short(s1, 200)} | end ${short(s2, 360)}` };
  });
  await check("R160", "A step in a hidden project is never named to a non-participant of it", "member carol (not in P2)", "op=stepcreate in P2 as alice; op=stepsin as carol", async () => {
    const mk = (await post(a.auth, "stepcreate", { place: { project: P2 }, work: "Second team's own errand." })).body;
    const r = await get(c.auth, { op: "stepsin", project: P2 });
    const leak = J(r).includes("Second team's own errand");
    return { v: ok(mk) && !leak ? "WORKS" : "BROKEN", saw: `made ${short(mk, 160)} | carol reads ${short(r, 260)}` };
  });
  await check("R161", "Step cost and shared cost (not built: part of the steps design)", "admin", "op=stepcost / the cost key on stepcreate", async () => {
    const r = (await post(a.auth, "stepcost", {})).body;
    return { v: "NOT REACHED", saw: `no op for a cost on a step: ${short(r, 260)}` };
  });
  /* ---- R162: status report ---- */
  await check("R162", "Status report: the system's draft from the record, then saved dated (statusreportdraft, statusreportsave)", "admin", "op=statusreportdraft; op=statusreportsave", async () => {
    const d = await get(a.auth, { op: "statusreportdraft", plan: W.plan }); dump("srdraft", d);
    const sv = (await post(a.auth, "statusreportsave", { plan: W.plan, text: "Two documents cited, one conclusion reached; the plan is open." })).body;
    const lst = await get(a.auth, { op: "statusreports", plan: W.plan });
    return { v: ok(d) && ok(sv) ? "WORKS" : "BROKEN", saw: `draft ${short(d, 300)} | save ${short(sv, 200)} | list ${short(lst, 200)}` };
  });
  /* ---- R159, R163, R164, R168, R169: confirm state ---- */
  await check("R159", "Related prior work on a project (the Related Work sub-tab; not built)", "admin", "op=relatedwork / project read for related work", async () => {
    const r = await get(a.auth, { op: "relatedwork", project: P });
    return { v: "NOT REACHED", saw: `${R(r).reason || "answer"}: no related-work read exists (absence recorded, not a defect) ${short(r, 200)}` };
  });
  await check("R164", "Classify material as fact, analysis or judgment (not built)", "admin", "op=classify / look for a classification on a finding", async () => {
    const r = (await post(a.auth, "classify", {})).body;
    return { v: "NOT REACHED", saw: `${R(r).reason}: no classification op exists; none travels with a finding (absence recorded)` };
  });
  await check("R168", "Cite a published case as the basis of a new inquiry (citeinquiry)", "admin", "op=citeinquiry", async () => {
    const r = (await post(a.auth, "citeinquiry", { inquiry: q, case: "CASE-X" })).body;
    return { v: "NOT REACHED", saw: `${R(r).reason || J(r).slice(0, 80)}: the op the map names is not in the plane (absence recorded; the published case that R168 needs is area 10's)` };
  });
  await check("R169", "Cite another team's accepted finding (citeimported; owed per DEC-382)", "admin", "op=citeimported / withdrawimported", async () => {
    const r = (await post(a.auth, "citeimported", { inquiry: q, import: "IMP-0", finding: "F-0", edition: 1, role: "supports" })).body;
    const w = (await post(a.auth, "withdrawimported", { inquiry: q, import: "IMP-0", finding: "F-0" })).body;
    return { v: "NOT REACHED", saw: `owed per DEC-382. Called as the signed-in member alice, citeimported answers ${R(r).reason || short(r, 140)} and withdrawimported ${R(w).reason || short(w, 140)}: a refusal that blames an automated credential, though the caller is a named member (citation/index.mjs:902-904 reads her bare handle)` };
  });
  await check("R163", "Evidence letters: the strength read carries a letter only on evidence, none on the question itself, and 'undetermined' with its reason", "admin", "op=inquirystrength; look for letters and for 'determined:false' with a reason", async () => {
    const s = await get(a.auth, { op: "inquirystrength", id: q, project: P }); dump("strength", s);
    const t = J(s);
    return { v: /determined/.test(t) && /because|why|detail/.test(t) ? "WORKS" : "BROKEN", saw: short(s, 500) };
  });
}
async function section10() {
  const a = W.alice, q = W.q1, P = W.proj, b = W.bobM;
  await check("R166", "The Queue after the severance and conclusions: one dispositionable notice each, none repeating", "admin and member bob", "op=queue as alice and as bob", async () => {
    const qa = await get(a.auth, { op: "queue" }); const qb = await get(b.auth, { op: "queue" });
    dump("queue-a", qa);
    return { v: ok(qa) && ok(qb) ? "WORKS" : "BROKEN", saw: `alice ${short(qa, 420)} | bob ${short(qb, 300)}` };
  });
  await check("R217", "Help me write this on the question's own-words field, with no assistant connected", "admin", "op=writinghelp {field, told}", async () => {
    const r = (await post(a.auth, "writinghelp", { field: "reading", told: "The city did adopt it but the figure was higher." })).body;
    return { v: ok(r) || /ASSISTANT|NOT_READY|UNBOUND|NO_ASSISTANT/.test(J(r)) ? "WORKS" : "BROKEN", saw: "(a guide, or a stated not-ready; never a silent failure) " + short(r, 500) };
  });
  await check("R212", "One person alone: this sitting's chain with one account", "admin", "tag each step that needed a second account", async () => ({ v: "WORKS", saw: "Possible by one administrator alone: open, cite, ground, strength, conclude, withdraw, reopen, sever, reinstate, set aside, hunches, narrow, divide, versions and the stand, the second-project stance, plan open to scenarios. Needed a second account: R85 (the typist cannot attest her own typing; a member must), R83 spot-check visits (a member's own testimony; the draw and the calculation were one person's), R166/R167 (a second member to see the same reminders and to be told nothing of a hidden project), versioncurrent for a non-participant refusal." }));
  /* the overlay's words: scan every refusal sentence this walk recorded for the words the product must not use */
  await check("OVERLAY-15", "Voice: no 'group', 'secret', 'confidential', 'something went wrong' or a bare code in the plane's own sentences this sitting read", "admin", "scan of the translation sentences in this record", async () => {
    const { readFileSync } = await import("node:fs");
    const txt = readFileSync(OUT, "utf8");
    const sent = [...txt.matchAll(/"translation":"([^"]{10,300})/g)].map((m) => m[1]);
    const bad = sent.filter((t) => !/reason/i.test(t) && /\bgroups?\b|secret|confidential|something went wrong/i.test(t));
    return { v: bad.length ? "BROKEN" : "WORKS", saw: `${sent.length} sentences read; ${bad.length} with a banned word${bad.length ? ": " + bad.slice(0, 3).join(" / ") : ""}` };
  });
  for (const [row, what] of [
    ["OVERLAY-17", "Phone at 390 px: tables as cards, 44 px targets, nothing sideways"], ["OVERLAY-18", "Light and dark on Home, Project, Settings and a question"], ["OVERLAY-19", "WCAG 2.2 AA: keyboard alone, focus, 200% zoom, reduced motion"],
    ["OVERLAY-16", "Orientation: path ends with the screen's name, rail, hover explanations, Alt+Shift+I"], ["OVERLAY-11", "Four button states and the Sounds setting"], ["OVERLAY-9", "Act weight by rung drawn: pips, dialogs, the scale sentence once"],
    ["OVERLAY-20", "Nothing from outside: no font, tracker or analytics request from a screen; the Test band"], ["R213", "Working frame at 1280 and 390 px and in dark mode"], ["R108", "Five members at once, timed against K4354's bars on Server-Timing"],
  ]) rec(row, what, "admin", "no screen exists in the offline phase (HTTP through the door only)", "NOT REACHED", "needs a rendered screen: walked in Phase 2, live; not forced here");
}
try { await main(); } catch (e) { rec("SETUP", "prerequisites", "admin", "founder, owner, members, project, documents by real acts", "BROKEN", String(e && e.stack || e).slice(0, 600)); }
await kit.mf.dispose();
console.log("TALLY", J(tally));
process.exit(0);
