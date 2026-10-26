/* screens-inquiry fix round 3 (T51), the `contradiction` screen: a member's flag (R105, `contradiction` R61, R25: the candidate she raised carries
 * `flagged_by: {member, at, reason}` and `machine: null`) draws her reason in her words with her name and the day, no machine mark; and C94
 * (members named by handle, never by id: who took a candidate up, who wrote a response). On interface-shell's served page over the real world where an act of the world makes the state (a member's flag, a take-up, a response; K5054) and a scripted plane where none does;
 * every request is compared with its owner's declaration (R104). Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { CONTRADICTION_SCREEN } from "../../../src/screens-inquiry/contradiction.mjs";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { unnamedFounderWorld } from "../store-request/fixtures.mjs";
import { plane, main, says, word, day, storeWorld, WORLD_FOUNDER_HANDLE, P, SHA, DOCUMENT_MD } from "./fixtures.mjs";

const S = "screen.contradiction.";
const CAND = "c0".repeat(32), INQ = "INQ-2026-0020-which-date";
const A_DOC = "INFO-2026-0011", B_DOC = "INFO-2026-0012";
const docMd = (id, title) => DOCUMENT_MD.replace("INFO-2026-0004", id).replace(/title: ".*"/, `title: "${title}"`);
const SIDE_A = { kind: "extent", content_id: "CNT-A", capture_sha: SHA, ref: "pdf-page:2", extent_kind: "pdf-page", text: "The rent adjustment takes effect on November 1, 2026.",
  source: { bundle: A_DOC, ref: "pdf-page:2" }, date: "2024-03-04", doctype: "amendment" };
const SIDE_B = { ...SIDE_A, content_id: "CNT-B", text: "The adjusted rent is due beginning December 1, 2026.", source: { bundle: B_DOC, ref: "pdf-page:0" }, date: "2026-09-12", doctype: "notice" };
const MACHINE = { label: "world", reason: "A lease amendment and a later notice date the same adjustment differently.", run: "RUN-1", proposed_by: "member:x", at: "2026-10-10T09:00:00Z", origin: "machine", machine_work: true };
const cand = (o = {}) => ({ candidate: CAND, key: "K4", why: "Two documents about one lease give different dates.", a: SIDE_A, b: SIDE_B, machine: MACHINE,
  weight: "duty", state: "open", resolution: null, inquiry: null, recommendations: [], reach: { projects: [P], truncated: false },
  default_question: "Which date does the rent adjustment take effect?", ...o });
const FLAGGED = (o = {}) => cand({ machine: null, weight: "lead", flagged_by: { member: "u-7", at: "2026-10-11T09:00:00Z", reason: "The notice and the amendment give two different dates." }, ...o });
const FACTS = { ok: true, candidate: CAND, key: "K4", facts: [] };
const answer = (c) => ok({ ok: true, wrote: false, on: { candidate: CAND }, candidates: c ? [c] : [], empty: c ? null : { level: "none_judged" } });
const IMAGES = { [A_DOC]: { "bundle.md": docMd(A_DOC, "Lease amendment, March 2024") }, [B_DOC]: { "bundle.md": docMd(B_DOC, "Rent notice, September 2026") },
  [INQ]: { "bundle.md": ["---", `id: ${INQ}`, "object_type: inquiry", "title: \"Which date does the rent adjustment take effect?\"", `project: ${P}`, "---", ""].join("\n") } };
const ROSTER = ok({ ok: true, members: [{ member_id: "admin", handle: "sparky", founder: true }, { member_id: "u-7", handle: "rosa" }] });
const SERVED = [...SCREENS.filter((s) => s.id !== "contradiction"), CONTRADICTION_SCREEN];
const open = async (path, c, o = {}) => {
  const p = await boot({ screens: SERVED, path, plane: plane({ images: IMAGES, plane: { contradictioncandidates: answer(c), contradictionfacts: ok(FACTS), contradictionnotices: ok({ ok: true, notices: [] }),
    memberlist: ROSTER, ...(o.plane || {}) } }) });
  await p.settle();
  return p;
};
const at = "/app/contradiction/" + CAND;

/* the real world (store-assembly's store with the real door; the state is made by real acts, K5054): a page as `as` reads it over the world's door, `plane` scripting only the ops it names */
const OWN = { capabilities: ["contribute", "create_projects"] };
async function pageOn(world, as, path, o = {}) {
  const { door, session } = world.boot(as);
  const p = await boot({ screens: SERVED, door, session, path, ...o });
  await p.settle();
  return p;
}
/** Two web pages held in ann's project, and a candidate she raised by her real flag (`contradictionflag`, a passage of each and her reason). Answers the world, ann, the project, the candidate, and the flag's own answer. */
async function flagged({ reason = "The notice and the amendment give two different dates.", world = null, founder = false, unnamed = false } = {}) {
  world = world || (unnamed ? await unnamedFounderWorld() : await storeWorld());
  const ann = unnamed ? world.unnamed : founder ? await world.signIn(WORLD_FOUNDER_HANDLE) : await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const a = await world.recipes.page(ann, "Lease amendment, March 2024", { paragraphs: ["The rent adjustment takes effect on November 1, 2026."], project });
  const b = await world.recipes.page(ann, "Rent notice, September 2026", { paragraphs: ["The adjusted rent is due beginning December 1, 2026."], project });
  const unit = async (h) => (await ann.read("reading", { query: { sha256: h.sha } })).text_units[0].extent;
  const flag = await ann.act("contradictionflag", { body: { here: { capture: a.sha, extent: await unit(a) }, other: { capture: b.sha, extent: await unit(b) }, reason } });
  return { world, ann, project, candidate: flag.candidate, flag, at: "/app/contradiction/" + flag.candidate };
}

test("R105 a candidate a member flagged draws her reason in her words, her name and the day, and no machine mark; control: a machine candidate draws its reason as before and no flagged-by line", async () => {
  const REASON = "The notice and the amendment give two different dates.";
  const w = await flagged({ reason: REASON });
  const MACHINE_REASON = "one document says the fee rose, the other that it fell";
  const p = await pageOn(w.world, w.ann, w.at);
  const why = main(p).querySelector("[data-flagged-by]");
  assert.ok(why, "the flag is drawn");
  assert.ok(why.textContent.includes(REASON), "her reason, in her words");
  assert.ok(why.textContent.includes(word("screen.contradiction.flagged.by", { member: "ann", date: day(w.flag.flagged_by.at) })), "who and when, by the key (R127, U437)");
  assert.doesNotMatch(why.textContent, /member:/, "never her id");
  assert.equal(main(p).querySelector(".cs-machinework"), null, "no machine mark");
  assert.equal(main(p).querySelector('[data-origin="machine"]'), null);
  assert.ok(!main(p).textContent.includes(MACHINE_REASON));
  /* control: a machine candidate (the assistant's proposal over a team with a Claude account, by real acts) */
  const world = await storeWorld({ ai: true });
  const admin = await world.signIn(WORLD_FOUNDER_HANDLE);
  const made = await world.recipes.contradiction(admin, { reason: MACHINE_REASON });
  const m = await pageOn(world, admin, "/app/contradiction/" + made.candidate);
  assert.ok(m.doc.getElementById("cs-main").textContent.includes(MACHINE_REASON), "the machine's reason as before");
  assert.ok(main(m).querySelector(".cs-machinework"), "marked machine work");
  assert.equal(main(m).querySelector("[data-flagged-by]"), null, "and no flagged-by line");
  /* a flag by the founder who chose no handle draws her unnamed (a world claimed with none); a member the roster holds no handle for is a state no act makes (the roster lists every member
     it holds, member-roster/index.mjs:1132) and is not tested; a flag with no reason, which the owner refuses, is still scripted over a scripted candidate */
  const u = await flagged({ unnamed: true });
  const quiet = await pageOn(u.world, u.ann, u.at);
  assert.ok(main(quiet).querySelector("[data-flagged-by]").textContent.includes(word("member.founder.unnamed")), "the founder with no handle: unnamed");
  const bare = await open(at, FLAGGED({ flagged_by: { member: "u-7", at: "2026-10-11T09:00:00Z", reason: "" } }));
  assert.equal(main(bare).querySelector("[data-flagged-by]"), null, "no reason, no line");
});

test("R105 R40 C94 who took a candidate up, and who wrote a response, is drawn by handle, never by id: the founder's id, another member's; control: an id no roster holds is the plain word", async () => {
  /* the real state: the candidate a member flagged (ann, or the founder), taken up by her through the act the page makes */
  const takenBy = async (who) => {
    const w = await flagged({ founder: who === "founder" });
    await w.ann.act("contradictiontakeup", { body: { candidate: w.candidate, question: "Which date applies?", frame: "a" } });
    const held = (await w.ann.read("contradictioncandidates", { query: { candidate: w.candidate } })).candidates[0];
    return { ...w, taker: w.ann, held, page: await pageOn(w.world, w.ann, w.at) };
  };
  for (const who of ["founder", "member"]) {
    const t = await takenBy(who);
    const handle = who === "founder" ? WORLD_FOUNDER_HANDLE : t.taker.handle;
    const line = main(t.page).querySelector('[data-taken-up="1"]');
    assert.ok(line.textContent.includes(handle) && says(line, S + "member.took.this.up.as.a", { member: handle, question: "Which date applies?", date: day(t.held.taken_up.at) }), who + ": by " + handle);
    assert.doesNotMatch(line.textContent, new RegExp("member:"));
  }
  /* still scripted (over a scripted candidate): an id no roster holds, and a roster that names no one (needed: a member the roster holds no handle for) */
  const taken = async (member, roster) => open(at, cand({ state: "taken_up", inquiry: INQ, taken_up: { member, at: "2026-10-12T09:00:00Z", words: "Which date applies?" } }), roster ? { plane: { memberlist: roster } } : {});
  const unknown = await taken("u-99");
  assert.ok(main(unknown).querySelector('[data-taken-up="1"]').textContent.includes(word("shell.card.member")), "an unknown id: the plain word");
  const quiet = await taken("admin", ok({ ok: true, members: [] }));
  assert.ok(main(quiet).querySelector('[data-taken-up="1"]').textContent.includes(word("member.founder.unnamed")), "the founder with no handle known: unnamed");
  /* the response her project wrote (the conflict between two projects, each asked to resolve it, and the first responded: real acts) */
  const world = await storeWorld({ ai: true });
  const admin = await world.signIn(WORLD_FOUNDER_HANDLE);
  const c = await world.recipes.conflict(admin, { through: "responded" });
  const author = c.members[0];
  const r = await pageOn(world, author, `/app/contradiction/${c.candidate}/${c.projects[0]}`);
  assert.ok(main(r).querySelector("[data-response]").textContent.includes(author.handle), "her response by her handle");
  assert.doesNotMatch(main(r).textContent, /member:/);
});
