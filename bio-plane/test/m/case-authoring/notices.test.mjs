/* case-authoring (T23; DEC-111, K1031, K1119): the project reference a case carries (R41), and what the pre-flight's
   first step says of it (R42). network-notices' `noticeReferenceOf` (its R19) is the fixture's stand-in (`w.notices`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED } from "./fixture.mjs";
import { NOTICE_SEALS_SENTENCE } from "../../../src/case-authoring/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const NOTICE = "WON-2026-0412";

function setup() {
  const w = world();
  w.member("alice"); w.member("bo");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  return { w, P };
}
const docText = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;
const head = (text) => text.slice(0, text.indexOf("\n---\n", 4));

test("R41: publishCase writes working_on as noticeReferenceOf(project) answers it, directly after case_project, asked of the publishing project", () => {
  for (const ref of [NOTICE, "WON-2026-0412-team-notice"]) {
    const { w, P } = setup();
    const asked = [];
    const real = w.ca.networkNotices.noticeReferenceOf;
    w.ca.networkNotices.noticeReferenceOf = (p) => { asked.push(p); return real(p); };
    w.notices.set(P, ref);
    const r = w.publish(P, "alice", [Q]);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    const text = docText(w, r);
    assert.equal(parseFrontmatter(text).data.working_on, ref);
    const lines = head(text).split("\n");
    assert.equal(lines[lines.indexOf(`case_project: ${P}`) + 1], `working_on: ${ref}`);
    assert.equal(lines.filter((l) => l.startsWith("working_on:")).length, 1, "one line");
    assert.ok(asked.length >= 1 && asked.every((p) => p === P), "asked of the publishing project only");
    /* the answer's document is the stored one */
    assert.equal(r.caseDocument.bytes, new TextEncoder().encode(text).length);
  }
});

test("R41: no working_on when noticeReferenceOf answers null, and none for an answer that is not a notice id (never a malformed reference); the document is otherwise byte-identical", () => {
  const texts = [];
  for (const ref of [null, undefined, "", "won-2026-0412", "WON-2026-41", "WON-2026-0412\ncase_id: X", 7, { id: NOTICE },
                     NOTICE]) {
    const { w, P } = setup();
    if (ref !== undefined) w.notices.set(P, ref);
    const r = w.publish(P, "alice", [Q]);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    const text = docText(w, r);
    const has = Object.prototype.hasOwnProperty.call(parseFrontmatter(text).data, "working_on");
    assert.equal(has, ref === NOTICE, `ref ${JSON.stringify(ref)}`);
    assert.equal(text.includes("working_on"), ref === NOTICE);
    /* the case id and the project id are minted per world: compare the rest */
    texts.push(text.replaceAll(r.caseId, "CASE").replaceAll(P, "PROJ").replace(`working_on: ${NOTICE}\n`, ""));
  }
  assert.equal(new Set(texts).size, 1, "only the one line differs");
});

test("R42: the pre-flight's \"what becomes permanent\" step says, when the project has a notice, that publishing opens its sealed weeks — and says nothing of it without one; it writes nothing", () => {
  const { w, P } = setup();
  const args = { ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice" };
  const without = w.ca.publishPreflight(args);
  assert.equal(without.steps[0].name, "what becomes permanent");
  assert.equal(without.steps[0].says.includes(NOTICE_SEALS_SENTENCE), false);
  assert.equal(without.steps[0].working_on, null);
  w.notices.set(P, NOTICE);
  const before = w.snapshot();
  const withNotice = w.ca.publishPreflight(args);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.ok(withNotice.steps[0].says.endsWith(` ${NOTICE_SEALS_SENTENCE}`));
  assert.match(NOTICE_SEALS_SENTENCE, /sealed weeks/);
  assert.equal(withNotice.steps[0].working_on, NOTICE);
  /* stated even when op=publish refuses first, as long as the act's authority lets the project through */
  const refusing = w.ca.publishPreflight({ ...args, statement: "" });
  assert.equal(refusing.first.reason, "NO_STATEMENT");
  assert.ok(refusing.steps[0].says.includes(NOTICE_SEALS_SENTENCE));
  /* negative control: a caller the authority fences refuse learns nothing of the project's notice, whether it cannot
     see the project or sees it and does not own it */
  const unseen = w.ca.publishPreflight({ ...args, viewer: V("bo"), author: "bo" });
  assert.equal(unseen.first.reason, "NO_SUCH_PROJECT");
  assert.deepEqual([unseen.steps[0].says.includes(NOTICE_SEALS_SENTENCE), unseen.steps[0].working_on], [false, null]);
  w.join(P, "bo");
  const outsider = w.ca.publishPreflight({ ...args, viewer: V("bo"), author: "bo" });
  assert.equal(outsider.first.reason, "NOT_THE_PROJECT_OWNER");
  assert.deepEqual([outsider.steps[0].says.includes(NOTICE_SEALS_SENTENCE), outsider.steps[0].working_on], [false, null]);
});
