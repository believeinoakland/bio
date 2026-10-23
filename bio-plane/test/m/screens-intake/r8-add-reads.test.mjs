/* screens-intake T51 fix round 8 (SCREENS-INTAKE #22): G111, R29: Add opened for a question does not read every project's questions before it settles. The settle reads the
 * routed question's own project (at most one `projectquestions`); the other projects are read afterwards, once each, and the chooser then labels each question by its
 * project as before. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, ok, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const PROJECTS = Array.from({ length: 37 }, (_, i) => ({ id: `PROJ-2026-${String(i + 1).padStart(4, "0")}`, name: `Project ${i + 1}` }));
const qid = (i) => `INQ-2026-${String(i + 1).padStart(4, "0")}-q${i + 1}`;
const ROUTED = qid(0);
const HITS = Array.from({ length: 200 }, (_, i) => ({ bundle_id: qid(i), title: `Question ${i + 1}` }));
/* question i is in project (i mod 37) */
const itemsOf = (project) => { const k = PROJECTS.findIndex((x) => x.id === project); return HITS.filter((_, i) => i % 37 === k).map((h) => ({ inquiry: h.bundle_id, title: h.title })); };
const md = (title, extra = []) => ["---", `title: ${JSON.stringify(title)}`, ...extra, "---", "", "## Summary", ""].join("\n");
const plane = { search: ok({ hits: HITS, truncated: false }), projectlist: ok({ projects: PROJECTS }), projectquestions: (r) => ok({ ok: true, items: itemsOf(r.query.project) }),
  image: (r) => ok(r.query.id === ROUTED ? { "bundle.md": md("Question 1", [`project: ${PROJECTS[0].id}`]) } : { "bundle.md": md("Project 1") }),
  opencaptures: ok({ ok: true, truncated: false, captures: [] }), heldcaptures: ok({ ok: true, held: [], truncated: false }), capturerequests: ok({ ok: true, requests: [] }) };
const options = (p) => Array.from(main(p).querySelectorAll("#ci-for option")).map((o) => o.textContent);
const reads = (p) => p.byOp("projectquestions").map((r) => r.query.project);

test("R29 (G111) Add opened for a question reads only the routed question's project by the time it settles", async () => {
  const p = await openPage(`/app/capture/address/${ROUTED}`, { plane, screens: [...SCREENS, DOCUMENT_STUB] });
  await p.settle();
  assert.ok(reads(p).length <= 1, `projectquestions reads at settle: ${reads(p).length}`);
  assert.deepEqual(reads(p), [PROJECTS[0].id]);
  assert.ok(options(p).some((t) => t.includes("Question 1") && t.includes("Project 1")), "the routed question is told by its project at once");
});

test("R29 (G111) control: afterwards each other project is read once and every question is labelled by its project as before", async () => {
  const p = await openPage(`/app/capture/address/${ROUTED}`, { plane, screens: [...SCREENS, DOCUMENT_STUB] });
  await p.settle();
  await p.clock.tick(2000);
  for (let i = 0; i < 12; i++) await p.settle(20);
  const got = reads(p);
  assert.equal(got.length, 37, "one read per project");
  assert.equal(new Set(got).size, 37, "none twice");
  const o = options(p);
  assert.equal(o.length, 200);
  for (const i of [0, 1, 36, 37, 150, 199]) assert.ok(o.includes(`Question ${i + 1} · Project ${(i % 37) + 1}`), `question ${i + 1}: ${o[i]}`);
  await p.clock.tick(60000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(reads(p).length, 37, "a later redraw reads nothing again");
});

test("R29 (G111) control: a screen opened for no question reads no project's questions", async () => {
  const p = await openPage("/app/capture/address", { plane, screens: [...SCREENS, DOCUMENT_STUB] });
  await p.clock.tick(5000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(reads(p).length, 0);
});
