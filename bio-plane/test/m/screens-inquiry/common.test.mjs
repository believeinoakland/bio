/* screens-inquiry R5 (with interface-shell R5, R8–R13, R16, R21 on this module's screens): every screen in every state
 * of every read draws only words it lists, each read in one of the four states, grades as marks; the module's own words
 * are well formed; each screen draws exactly its registry acts, each an op `OPS` holds. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-inquiry/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { harness, okd, answer, failed, loading, emptyd } from "./kit.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
const SHA = "a".repeat(64);
const P = "PROJ-2026-0007", Q = "INQ-2026-0001-q", D = "INFO-2026-0004";

/* one full fixture per screen: the reads' answers and the stub plane behind its later reads */
const FIX = {
  project: { subject: P, data: {
    project: okd({ "bundle.md": `---\nid: ${P}\ntitle: "Pothole repairs"\nreferences:\n  - target: ${Q}\n    rel: cites\n    status: active\n---\n` }),
    stage: okd({ stage: "investigating", questions: { read: 1, with_legs: 1, concluded: 0 } }),
    participants: okd({ participants: [{ handle: "rosa", state: "joined", owner: true }] }),
    bar: okd({ bar: { declared: true, capture: "B", connection: "B" } }),
    questions: okd({ bundles: [{ bundle_id: Q, title: "A question?" }] }),
    account: okd({ on: true, serving: "member" }), directory: okd({ projects: [] }) },
    plane: { inquirystrength: () => answer({ capture: { state: "graded", grade: "B" }, connection: { state: "undetermined", detail: "no link" } }) } },
  question: { subject: Q, data: {
    inquiry: okd({ "bundle.md": `---\nid: ${Q}\nproject: ${P}\ncreated: 2026-10-03T00:00:00Z\n---\n\n## Question\n\nA question?\n` }),
    strength: okd({ capture: { state: "graded", grade: "A" }, connection: { state: "graded", grade: "C" }, testimony: { state: "graded", grade: "D" } }),
    basis: okd({ current: "v", versions: [{ name: "v", legs: [{ target: D, role: "supports", grade: "B" }, { target: D, role: "cuts_against", grade: "D", scale: "testimony" }] }] }),
    hunches: okd({ hypotheses: [{ statement: "A hunch.", held_by: "dev" }] }),
    waits: okd({ waits: [{ document: D, setter: "ben", reason: "wrong year", date: "2026-10-06T00:00:00Z" }] }) },
    plane: { image: () => answer({ "bundle.md": "---\ntitle: \"Pothole repairs\"\n---\n" }), strengthbarof: () => answer({ bar: { declared: true, capture: "B", connection: "B" } }) } },
  document: { subject: D, data: {
    capture: okd({ "bundle.md": `---\nid: ${D}\ntitle: "A policy"\ncontent_hash: sha256:${SHA}\nsource:\n  locator: https://example.org/a\n  retrieved: 2026-10-02T00:00:00Z\n---\n` }),
    backlinks: okd({ backlinks: [{ from: Q, from_type: "inquiry", from_title: "A question?" }] }),
    questions: okd({ bundles: [{ bundle_id: Q, title: "A question?" }] }) },
    plane: { reading: () => answer({ found: true, reading: { passages: [{ text: "A passage.", extent: { kind: "pdf-page", page: 1 } }], people: [{ id: "E1", name: "A. Name" }] }, unread_pages: [4] }),
             gradenote: () => answer({ note: { grade: "B", says: "fetched" } }),
             versionchain: () => answer({ versions: [{ capture_sha: SHA, at: "2026-10-02T00:00:00Z" }, { capture_sha: "b".repeat(64), at: "2026-10-05T00:00:00Z" }], at_index: 0 }) } },
  assistant: { subject: Q, data: {
    own: okd({ reference: { kind: "key" } }), signin: okd({ connected: false }), groupkey: okd({ held: true, on: true }),
    usage: okd({ today: { used: "$0.10", limit: "$2.00" } }), pack: okd({ pack: { version: "p@1" } }) },
    ui: { run: { id: "RUN-1", status: "running", untested: { kind: "untested" } }, cred: { tokenId: "dock-1", token: "aik-x" } },
    plane: { airun: () => answer({ session: { status: "running", ticks: 2, untested: { kind: "untested" } } }),
             airunlog: () => answer({ entries: [{ says: "Found a link." }] }) } },
};
/* the reads each screen draws in one of the four states (the rest feed what is drawn: titles, choices, the serving account) */
const DRAWN = { project: ["stage", "bar", "questions", "account", "participants"], question: ["strength", "waits", "basis", "hunches"],
                document: ["backlinks"], assistant: [] };
const STATES = { loading, empty: emptyd, failed: () => failed("SOME_REFUSAL"), refused: () => failed("NO_SUCH_PROJECT") };

for (const s of SCREENS) {
  test(`R5 ${s.id}: every read in every state draws only listed words, each drawn read in its own state (interface-shell R5, R10)`, async () => {
    const f = FIX[s.id];
    const reads = Object.keys(s.reads({ subject: f.subject, ui: {} }));
    const runs = [{ ...f.data }];
    for (const r of reads) for (const [, mk] of Object.entries(STATES)) runs.push({ ...f.data, [r]: mk() });
    for (const data of runs) {
      const h = harness(s, { subject: f.subject, data, plane: f.plane, ui: JSON.parse(JSON.stringify(f.ui || {})) });
      h.render();
      await h.settle();
      assert.deepEqual([...h.unlisted], [], `${s.id}: a key drawn that the screen does not list`);
      for (const r of DRAWN[s.id]) {
        const st = data[r].state;
        const want = st === "ok" ? null : st;
        if (want) assert.ok(h.html.includes(`data-state="${want}"`), `${s.id}.${r} ${st} drawn as ${want}`);
      }
      if (Object.values(data).some((v) => v.state === "failed")) assert.ok(!/data-state="empty"[^>]*>[^<]*<span data-key="state.failed"/.test(h.html));
    }
  });

  test(`R5 ${s.id}: every grade is drawn as one mark, the scale's name and the letter, through the kit`, async () => {
    const f = FIX[s.id];
    const h = harness(s, { subject: f.subject, data: f.data, plane: f.plane, ui: JSON.parse(JSON.stringify(f.ui || {})) });
    h.render();
    const html = await h.settle();
    const grades = [...html.matchAll(/data-grade="(\w+)" data-letter="([A-D])"><span data-key="mark\.scale\.(\w+)\.name">/g)];
    if (s.id !== "assistant") assert.ok(grades.length > 0, `${s.id} draws its grades`);
    for (const g of grades) assert.equal(g[1], g[3]);
    assert.ok(!/class="cs-grade"/.test(html), "no grade drawn by hand");
    /* R16: every record item named is a reference */
    if (s.id === "question") assert.match(html, /data-ref="document" data-id="INFO-2026-0004"/);
    if (s.id === "project") assert.match(html, /data-ref="question" data-id="INQ-2026-0001-q"/);
    if (s.id === "document") assert.match(html, /data-ref="question" data-id="INQ-2026-0001-q"/);
  });
}

test("R5 each screen draws exactly its registry acts, labelled by act.<op>.label.<screen>, each an op OPS holds (interface-shell R21)", () => {
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    assert.deepEqual(s.acts.map((a) => a.op).sort(), reg.acts.map((a) => a.op).sort(), s.id);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, `act.${a.op}.label.${s.id}`);
      assert.ok(s.words.some((w) => (typeof w === "string" ? w : w[0]) === a.label), `${a.label} listed`);
    }
  }
  assert.deepEqual(SCREENS.map((s) => s.id), ["project", "question", "document", "assistant"]);
});

test("R5 the module's own words: frozen [key, en, protected] rows, unique, each listed by a screen, none shadowing WORD_ROWS but the shell's named ones", () => {
  const shellNamed = new Set(["act.pagetranscribe.does", "ai.refused.limit.unjudged"]);
  const shared = new Set(WORD_ROWS.map((r) => r[0]));
  const keys = new Set();
  const listed = new Set(SCREENS.flatMap((s) => s.words.filter((w) => typeof w !== "string").map((w) => w[0])));
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[0] === "string" && typeof r[1] === "string" && typeof r[2] === "boolean", String(r[0]));
    assert.ok(!keys.has(r[0]), `${r[0]} once`);
    keys.add(r[0]);
    assert.ok(!shared.has(r[0]) || shellNamed.has(r[0]), `${r[0]} shadows WORD_ROWS`);
    assert.ok(listed.has(r[0]), `${r[0]} is drawn by some screen`);
    assert.ok(!/(^|[^'’])\bCivicsmith\b(?!'s tests)/.test(r[1].replace(/your group's Civicsmith/g, "")), `${r[0]} names Civicsmith bare`);
    assert.ok(!/\b(Oakland|Alameda)\b/.test(r[1]), `${r[0]} names no place`);
  }
  for (const s of SCREENS) for (const w of s.words) if (typeof w === "string") assert.ok(shared.has(w), `${s.id}: ${w} in WORD_ROWS`);
  assert.ok(Object.isFrozen(SCREEN_WORDS));
});
