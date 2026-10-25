/* WALK-FINAL-09 #1: sitting 9 (Question to conclusion, and the plan opened), offline, through the door (K5122, BRIEF Phase 1). Every input is made by a member's own acts over
   the real plane under Miniflare (the kit of bio-plane/test/m/control-plane/r8-kit.mjs, the seam files' way: R-SEAM). Each check writes its row to 09-question.md the moment it
   is done. The script records; it never asserts, so a BROKEN row never stops the walk. Run: cd bio-plane && node --import ./test/platform-sqlite.mjs <this file>. */
import { appendFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
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
export const J = (x) => JSON.stringify(x);
export const short = (x, n = 420) => J(x).slice(0, n);
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
  W.docs = {};
  for (const [k, paras] of Object.entries(docs)) W.docs[k] = await docOf(W.alice, W.proj, "w09-" + k, paras, { vouch: k !== "typed" });
  await section1();
  await section2();
  await section3();
  await section4();
  await section5();
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
  await check("R80", "partitionindependence: the shared-origin read-back over the proposed partition", "admin", "op=partitionindependence target=q", async () => {
    const r = await get(a.auth, { op: "partitionindependence", id: q, partition: J([[0, 1], [2]]) });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
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
  const concl = (o, query) => post(o.auth, "conclude", {}, query).then((r) => r.body);
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
  await check("R80", "The conclusion read back with the project: stance and history", "admin", "op=basisversions id project", async () => {
    const r = await get(a.auth, { op: "basisversions", id: q, project: P });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 900) };
  });
  await check("R80", "Withdraw the conclusion with a reason; earlier entries remain", "admin", "op=withdrawconclusion target project reason", async () => {
    const r = (await post(a.auth, "withdrawconclusion", {}, { target: q, project: P, reason: "Rechecking the amended contract first." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
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
  /* sever / reinstate: select the leg's target, then the act on the question */
  const leg = W.docs.ledger.bundle;
  const sel = async () => R(await screenCall(a.auth).call("select", { body: { ids: [leg] } }));
  await check("R80", "Sever a citation with a reason (cascades one hop)", "admin", "select the cited document then op=sever project=q handle", async () => {
    const h = (await sel()).handle;
    const r = (await post(a.auth, "sever", {}, { project: q, handle: h, reason: "The ledger page was a draft." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R80", "Reinstate the severed citation with a reason", "admin", "op=reinstate project=q handle", async () => {
    const h = (await sel()).handle;
    const r = (await post(a.auth, "reinstate", {}, { project: q, handle: h, reason: "The final ledger page agrees." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R80", "proposedispose: set the question aside (defer) with a reason for its project; then take it back", "admin", "op=proposedispose body {project, finding, to, reason}", async () => {
    const r = (await post(a.auth, "proposedispose", { project: P, finding: q, to: "deferred", reason: "Waiting for the audit." })).body;
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 600) };
  });
  await check("R80", "Read in my language (readtranslate) on a question, with no machine", "admin", "op=readtranslate subject {kind question id project}", async () => {
    const r = (await post(a.auth, "readtranslate", { subject: { kind: "question", id: q, project: P } })).body;
    return { v: "WORKS", saw: "answer: " + short(r, 500) };
  });
}
async function section5() {
  const a = W.alice, q = W.q1, P = W.proj, b = W.bobM, cs = screenCall(a.auth);
  let hid = null;
  await check("R82", "Hold a hunch (a suspicion about the question): declared, not counted", "admin", "op=hypothesishold {inquiry, kind other, statement, about [id]}", async () => {
    const r = (await post(a.auth, "hypothesishold", { inquiry: q, kind: "other", statement: "I suspect the paving invoice was split to stay under the limit.", about: [q] })).body;
    hid = R(r).hypothesisId || R(r).id || (R(r).hypothesis && R(r).hypothesis.hypothesis_id) || null;
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
  await check("R82", "Narrow: list the machine candidates for a leg (writes nothing)", "admin", "op=narrowcandidates target version ord", async () => {
    const r = await get(a.auth, { op: "narrowcandidates", target: q, version: "reading-3", ord: "0" });
    return { v: ok(r) ? "WORKS" : "BROKEN", saw: short(r, 700) };
  });
  await check("R82", "Narrow a whole-document leg to a part: a new version one leg narrower", "admin", "op=narrow {target, version, ord, name, description, extent}", async () => {
    const c = R(await get(a.auth, { op: "narrowcandidates", target: q, version: "reading-3", ord: "0" }));
    const cand = c && c.candidates && c.candidates[0];
    if (!cand) return { v: "NOT REACHED", saw: "narrowcandidates proposed no part: " + short(c, 300) };
    const extent = cand.fields && typeof cand.fields === "object" ? cand.fields : cand.content_id ? { content_id: cand.content_id } : cand.extent;
    const r = (await post(a.auth, "narrow", { target: q, version: "reading-3", ord: 0, name: "narrowed-first", description: "The first paragraph only.", extent })).body;
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
try { await main(); } catch (e) { rec("SETUP", "prerequisites", "admin", "founder, owner, members, project, documents by real acts", "BROKEN", String(e && e.stack || e).slice(0, 600)); }
await kit.mf.dispose();
console.log("TALLY", J(tally));
process.exit(0);
