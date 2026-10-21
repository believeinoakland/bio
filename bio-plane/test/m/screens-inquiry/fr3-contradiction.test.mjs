/* screens-inquiry fix round 3 (T51), the `contradiction` screen: a member's flag (R105, `contradiction` R61, R25: the candidate she raised carries
 * `flagged_by: {member, at, reason}` and `machine: null`) draws her reason in her words with her name and the day, no machine mark; and C94
 * (members named by handle, never by id: who took a candidate up, who wrote a response). On interface-shell's served page over a scripted plane;
 * every request is compared with its owner's declaration (R104). Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { CONTRADICTION_SCREEN } from "../../../src/screens-inquiry/contradiction.mjs";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { plane, main, says, word, day, P, SHA, DOCUMENT_MD } from "./fixtures.mjs";

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
    contradictionresponses: ok({ ok: true, responses: [] }), memberlist: ROSTER, ...(o.plane || {}) } }) });
  await p.settle();
  return p;
};
const at = "/app/contradiction/" + CAND;

test("R105 a candidate a member flagged draws her reason in her words, her name and the day, and no machine mark; control: a machine candidate draws its reason as before and no flagged-by line", async () => {
  const p = await open(at, FLAGGED());
  const why = main(p).querySelector("[data-flagged-by]");
  assert.ok(why, "the flag is drawn");
  assert.ok(why.textContent.includes("The notice and the amendment give two different dates."), "her reason, in her words");
  assert.ok(why.textContent.includes("rosa") && why.textContent.includes(day("2026-10-11")), "who, and when");
  assert.doesNotMatch(why.textContent, /\bu-7\b/, "never her id");
  assert.equal(main(p).querySelector(".cs-machinework"), null, "no machine mark");
  assert.equal(main(p).querySelector('[data-origin="machine"]'), null);
  assert.ok(!main(p).textContent.includes(MACHINE.reason));
  /* control: a machine candidate */
  const m = await open(at, cand());
  assert.ok(m.doc.getElementById("cs-main").textContent.includes(MACHINE.reason), "the machine's reason as before");
  assert.ok(main(m).querySelector(".cs-machinework"), "marked machine work");
  assert.equal(main(m).querySelector("[data-flagged-by]"), null, "and no flagged-by line");
  /* a flag whose member has no handle known is the plain word, and one with no reason draws no line */
  const quiet = await open(at, FLAGGED(), { plane: { memberlist: ok({ ok: true, members: [] }) } });
  assert.ok(main(quiet).querySelector("[data-flagged-by]").textContent.includes(word("shell.card.member")), "a member with no handle known: the fallback word");
  const bare = await open(at, FLAGGED({ flagged_by: { member: "u-7", at: "2026-10-11T09:00:00Z", reason: "" } }));
  assert.equal(main(bare).querySelector("[data-flagged-by]"), null, "no reason, no line");
});

test("R105 R40 C94 who took a candidate up, and who wrote a response, is drawn by handle, never by id: the founder's id, another member's; control: an id no roster holds is the plain word", async () => {
  const taken = async (member, roster) => open(at, cand({ state: "taken_up", inquiry: INQ, taken_up: { member, at: "2026-10-12T09:00:00Z", words: "Which date applies?" } }), roster ? { plane: { memberlist: roster } } : {});
  for (const [id, handle] of [["admin", "sparky"], ["u-7", "rosa"]]) {
    const p = await taken(id);
    const line = main(p).querySelector('[data-taken-up="1"]');
    assert.ok(line.textContent.includes(handle) && says(line, S + "member.took.this.up.as.a", { member: handle, question: "Which date does the rent adjustment take effect?", date: day("2026-10-12") }), id + ": by " + handle);
    assert.doesNotMatch(line.textContent, /\bu-7\b|\badmin\b/);
  }
  const unknown = await taken("u-99");
  assert.ok(main(unknown).querySelector('[data-taken-up="1"]').textContent.includes(word("shell.card.member")), "an unknown id: the plain word");
  const quiet = await taken("admin", ok({ ok: true, members: [] }));
  assert.ok(main(quiet).querySelector('[data-taken-up="1"]').textContent.includes(word("member.founder.unnamed")), "the founder with no handle known: unnamed");
  /* the response her project wrote */
  const n = { candidate: CAND, project: P, weight: "duty", state: "open", side: SIDE_A, named: [], says: "x", opted_in: { member: "u-7", at: "2026-10-15T09:00:00Z", words: null },
    asked_by_another: false, revealed: true, responses: [], responses_truncated: false, parties: [{ id: "PROJ-2026-0042", name: "Elsewhere" }] };
  const r = await open(`/app/contradiction/${CAND}/${P}`, null, { plane: { contradictionnotices: ok({ ok: true, project: P, notices: [n], truncated: false }),
    contradictionresponses: ok({ ok: true, candidate: CAND, project: P, revealed: true, responses: [{ response: "R1", own: true, author: "member:u-7", text: "Our notice came from a letter.", at: "2026-10-17T09:00:00Z" }] }) } });
  assert.ok(main(r).querySelector('[data-response="R1"]').textContent.includes("rosa"), "her response by her handle");
  assert.doesNotMatch(main(r).textContent, /\bu-7\b/);
});
