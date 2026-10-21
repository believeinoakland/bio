/* review T51 (fix round 2): a finding is answered in its own words and never the session log (C46, R41), and the owner
   replies to a reader's comment on a draft the owner may read (C52, R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET } from "./fixture.mjs";
import { projectViewer } from "../../../src/membership/index.mjs";

const Q = "INQ-2026-0001-q", N = "INQ-2026-0002-n", L = "INQ-2026-0003-l", W = "INQ-2026-0004-w", E = "INQ-2026-0005-e";
const LOG = "## Session Log\n\n### Session 2026-10-21T05:37:33Z | Rested this question on 1 record (supports) | admin\n"
  + "Trigger: a part of INFO-2026-0045-a-web-page found by search in capture 118eae97\nChanges: basis legs added.\n"
  + "Reason: Setting aside the scope limit so the conclusion can be recorded\n";
const BODY = "## Question\n\nWhat does the Act require?\n\n## What It Rests On\n\n- one record\n\n## Conclusion\n\n"
  + "## What Would Falsify This\n\n";
const world = () => {
  const w = standard();
  /* the conclusion op=conclude wrote: in the front matter, the body's `## Conclusion` left empty */
  w.bundle(Q, "inquiry", `---\nid: ${Q}\nobject_type: inquiry\nconclusion: "The Act requires a reply in 20 days."\nfalsifier: "A court order saying otherwise."\n---\n\n${BODY}${LOG}`);
  /* no front-matter words: a section text, then the log */
  w.bundle(N, "inquiry", `---\nid: ${N}\nobject_type: inquiry\ntitle: "No words"\n---\n\n## Question\n\nIs it open?\n\n${LOG}`);
  /* the walk's own shape: headings with every section empty, front matter without words */
  w.bundle(E, "inquiry", `---\nid: ${E}\nobject_type: inquiry\n---\n\n${BODY}`);
  /* a file with no front matter and no log */
  w.bundle(L, "inquiry", "plain words, no front matter\n");
  return w;
};
const findings = (w, targets, viewer = "ann") => {
  const d = w.r.act({ act: "draft", author: "ed", project: P, targets });
  return { d, member: w.r.copy({ draft: d.draftId, viewer: V(viewer) }).findings,
           outside: (() => { w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "Reader", secretSha: SECRET(1) });
                             return w.r.copy({ secretSha: SECRET(1), bySecret: true }).findings; })() };
};
const noLog = (s) => !/Session Log|### Session|Reason:|Trigger:|118eae97/.test(String(s));

test("R41: a finding whose front matter holds the conclusion answers that conclusion as its statement, and its text never carries the session log, at both doors (C46)", () => {
  const w = world();
  const { member, outside } = findings(w, [Q]);
  for (const [door, f] of [["member", member[0]], ["recipient", outside[0]]]) {
    assert.equal(f.statement, "The Act requires a reply in 20 days.", door);
    assert.ok(noLog(f.text), `${door}: no session log in text: ${f.text}`);
    assert.ok(noLog(f.statement), door);
    assert.ok(f.text.includes("What does the Act require?"), `${door}: the section text stays`);
    assert.equal(f.falsifier, "A court order saying otherwise.", door);
  }
});

test("R41: a finding with no front-matter words answers its Conclusion section's text without the log; one with no headings answers its words unchanged (control, C46)", () => {
  const w = world();
  w.bundle(W, "inquiry", `---\nid: ${W}\ntitle: "Section words"\n---\n\n## Question\n\nIs it open?\n\n## Conclusion\n\nIt is open to all.\n\n## What Would Falsify This\n\nA statute closing it.\n\n${LOG}`);
  const { member, outside } = findings(w, [W, L]);
  for (const fs of [member, outside]) {
    assert.equal(fs[0].statement, "It is open to all.");
    assert.equal(fs[0].falsifier, "A statute closing it.");
    assert.equal(fs[0].concluded, true);
    assert.ok(noLog(fs[0].text) && noLog(fs[0].statement));
    assert.deepEqual([fs[1].text, fs[1].statement], ["plain words, no front matter\n", "plain words, no front matter\n"]);
    assert.equal(fs[1].concluded, true);
  }
});

test("R41: a finding whose conclusion is empty is told as not concluded yet, never as the file's headings, at both doors (C46, fix round 3)", () => {
  const w = world();
  const { member, outside } = findings(w, [N, E, Q]);
  for (const [door, fs] of [["member", member], ["recipient", outside]]) {
    for (const f of fs.slice(0, 2)) {
      assert.equal(f.statement, null, `${door}: ${f.target}: no statement, not the headings`);
      assert.equal(f.falsifier, null, door);
      assert.equal(f.concluded, false, door);
      assert.equal(typeof f.not_concluded, "string", door);
      assert.ok(f.not_concluded.trim() && !/^#|\n## /.test(f.not_concluded), `${door}: a plain state, not a heading`);
      assert.ok(noLog(f.text), door);
    }
    /* control: a finding that has words is concluded and carries no not_concluded state */
    assert.deepEqual([fs[2].concluded, fs[2].not_concluded], [true, null], door);
  }
});

test("R41: no finding the reader copy draws, at either door, carries a ## heading in its statement or falsifier (C46, fix round 3)", () => {
  const w = world();
  const { member, outside } = findings(w, [Q, N, E, L]);
  for (const f of [...member, ...outside]) for (const s of [f.statement, f.falsifier]) assert.ok(!/(^|\n)## /.test(String(s ?? "")), String(s));
});

test("R12: a present finding answers its title, so a screen draws the question's title where it would draw the id (C46, fix round 3)", () => {
  const w = world();
  w.st.sql.exec(`UPDATE bundles SET title=? WHERE bundle_id=?`, "Does the Act require a reply?", Q);
  const { member, outside } = findings(w, [Q, "INQ-2026-9999-gone"]);
  for (const fs of [member, outside]) {
    assert.equal(fs[0].title, "Does the Act require a reply?");
    assert.equal(fs[1].present, false);
    assert.equal(fs[1].title ?? null, null, "a finding the editor cannot read names no title");
  }
});

test("R18: the owner replies to a comment on each of two drafts, whichever way the door spells the owner; a stranger is refused NO_REVIEW_COPY (C52)", () => {
  const w = standard();
  /* the founder signs in as the bare handle `admin` and owns a project of their own; a second owner is an enrolled member */
  w.project("PROJ-2026-0003-f", { owners: ["admin"] });
  const drafts = [];
  for (const [project, owner] of [[P, "ann"], ["PROJ-2026-0003-f", "admin"]]) {
    for (let i = 0; i < 2; i++) {
      const d = w.r.act({ act: "draft", author: owner, project, scope: `s${i}` });
      assert.ok(d.ok, JSON.stringify(d));
      drafts.push({ d, owner, project });
    }
  }
  for (const { d, owner } of drafts) {
    const spellings = owner === "admin" ? ["admin", V("admin")] : [V(owner), projectViewer(V(owner), P)];
    for (const viewer of spellings) {
      const r = w.r.comment({ draft: d.draftId, viewer, text: `reply by ${viewer}` });
      assert.equal(r.ok, true, `${viewer} on ${d.draftId}: ${JSON.stringify(r)}`);
      assert.equal(r.comment.author_kind, "member");
      assert.equal(r.comment.author, owner, "attributed to the member, not the viewer's spelling");
    }
    const listed = w.r.copy({ draft: d.draftId, viewer: owner === "admin" ? "admin" : V(owner) }).comments;
    assert.deepEqual(listed.map((c) => c.author), [owner, owner]);
  }
  /* controls: a stranger, a machine viewer and the other owner's draft are the dead answer, byte-identical */
  const dead = JSON.stringify(w.r.comment({ draft: "DRAFT-2026-9999", viewer: V("ann"), text: "x" }));
  for (const [viewer, d] of [[V("out"), drafts[0].d], [V("quinn"), drafts[0].d], [V("ann"), drafts[2].d], ["class:admin", drafts[0].d],
                             ["", drafts[0].d], [null, drafts[0].d]]) {
    const r = w.r.comment({ draft: d.draftId, viewer, text: "x" });
    assert.equal(r.code, "NO_REVIEW_COPY", String(viewer));
    assert.equal(JSON.stringify(r), dead);
  }
  assert.equal(w.count("review_comments"), 8, "nothing was written by a refusal");
});
