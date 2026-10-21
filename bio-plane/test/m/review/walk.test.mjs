/* review T51 (fix round 2): a finding is answered in its own words and never the session log (C46, R41), and the owner
   replies to a reader's comment on a draft the owner may read (C52, R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET } from "./fixture.mjs";
import { projectViewer } from "../../../src/membership/index.mjs";

const Q = "INQ-2026-0001-q", N = "INQ-2026-0002-n", L = "INQ-2026-0003-l";
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

test("R41: a finding with no front-matter words answers its section text without the log; one with no log and no front matter answers its words unchanged (control, C46)", () => {
  const w = world();
  const { member, outside } = findings(w, [N, L]);
  for (const fs of [member, outside]) {
    assert.ok(noLog(fs[0].text) && noLog(fs[0].statement));
    assert.ok(fs[0].statement.includes("Is it open?"));
    assert.equal(fs[0].statement, fs[0].text);
    assert.equal(fs[0].falsifier, null);
    assert.deepEqual([fs[1].text, fs[1].statement], ["plain words, no front matter\n", "plain words, no front matter\n"]);
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
