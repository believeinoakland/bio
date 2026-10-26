/* screens-inquiry fix round 6 (T51), the project screen: G12a (the project's documents are read as picker rows, never the full row whose examination of every
 * capture with no recorded format cost a page seconds) and G12c (the strength of the project's questions is ONE read for each 50, strength's batch, never one
 * read for each question). On interface-shell's served page over a scripted plane; every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, boot } from "../interface-shell/harness.mjs";
import { inquiryMd } from "../inquiry/fixture.mjs";
import { open, main, section, says, word, day, storeWorld, SCREENS, P, Q, Q2 } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/project/" + P;

/* a picker row as capture's `heldcaptures` answers it with `fields=picker` (title, id, source with the capture's day, standing; `format` since fix round 6) */
const pick = (id, title, o = {}) => ({ bundle_id: id, title, project: P, source: { address: "https://example.org/" + id, via: "https", retrieved: o.retrieved || "2026-09-14T09:00:00Z" },
  collected_since: "2026-09-14T09:00:00Z", capture: { sha256: "a".repeat(64) }, actor: "member:dev", whole: true, standing: "collected", ...(o.format ? { format: o.format } : {}) });

test("R128 G12a every read of the project's documents asks for picker rows, page after page, and the rows are drawn from them: title, kind from `format`, the capture's day", async () => {
  const first = { ok: true, held: [pick("INFO-2026-0031", "A page", { format: "html" }), pick("INFO-2026-0032", "A sheet", { format: "xlsx", retrieved: "2026-10-02T09:00:00Z" })], truncated: true, next: "CUR1" };
  const second = { ok: true, held: [pick("INFO-2026-0033", "No format stated")], truncated: false, next: null };
  const p = await open(at, { plane: { heldcaptures: (r) => ok(r.query.after === "CUR1" ? second : first) } });
  const asked = p.byOp("heldcaptures");
  assert.ok(asked.length >= 2, "both pages are read");
  assert.deepEqual(asked.map((r) => r.query.fields), asked.map(() => "picker"), "every read of the project's documents is a picker read, none a full row");
  const s = section(p, "screen.project.docs.head");
  const rows = s.querySelectorAll(".cs-row");
  assert.deepEqual(rows.map((r) => r.querySelector("a.cs-ref").textContent), ["A page", "A sheet", "No format stated"]);
  assert.ok(rows[0].textContent.includes(word("screen.project.docs.kind.web")) && rows[0].textContent.includes(word("screen.project.docs.captured") + " " + day("2026-09-14")), "kind and day");
  assert.ok(rows[1].textContent.includes(word("screen.project.docs.kind.sheet")) && rows[1].textContent.includes(day("2026-10-02")));
  assert.ok(["web", "sheet", "photo"].every((k) => !rows[2].textContent.includes(word("screen.project.docs.kind." + k))), "no format stated, no kind drawn");
});

/** A world where `ann` started a project and drew `n` questions on it by real acts: every odd one rests on a held document (so it grades), the others rest on nothing. */
async function questionsWorld(n) {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const doc = (await world.recipes.hold(ann, "Passage", "The Director shall repair each reported pothole.", project)).bundle;
  const ids = [];
  for (let i = 0; i < n; i++) {
    const id = (await ann.read("allocid", { query: { prefix: "INQ", year: "2026" } })).id;
    const legs = i % 2 ? [{ target: doc, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture" }] : [];
    await ann.act("promote", { body: { bundleId: id, base: null, snapKey: "20261001T000000_aaaa", meta: { object_type: "inquiry", title: "Question " + i, current_state: "open",
      created: "2026-09-27T00:00:00Z", last_updated: "2026-09-27T00:00:00Z" }, files: [{ path: "bundle.md", text: inquiryMd(id, { question: "Question " + i, legs, extra: ["project: " + project] }) }], register: [] } });
    await ann.act("drawquestion", { query: { project, inquiry: id, note: "" } });
    ids.push(id);
  }
  return { world, ann, project, ids };
}
const pageAs = async (world, me, path) => {
  const { door, session } = world.boot(me);
  const p = await boot({ screens: SCREENS, door, session, path });
  await p.settle();
  return p;
};

test("R1 R9 G12c a project with five questions asks for their strength once (inquirystrength with their five ids), draws each question's own pair, and sends no read for one id", async () => {
  const { world, ann, project, ids } = await questionsWorld(5);
  const p = await pageAs(world, ann, "/app/project/" + project);
  const reads = p.byOp("inquirystrength");
  assert.equal(reads.length, 1, "one strength read for five questions");
  assert.deepEqual(String(reads[0].query.ids).split(","), ids, "naming all five");
  assert.equal(reads[0].query.id, undefined, "and not one");
  const rows = section(p, "screen.project.questions.head").querySelectorAll(".cs-row");
  assert.equal(rows.length, 5);
  let gradedRows = 0;
  for (const [i, r] of rows.entries()) {
    const own = await ann.read("inquirystrength", { query: { id: ids[i] } });
    const marks = r.querySelectorAll(".cs-strength .cs-grade, .cs-strength [data-grade]").map((m) => m.textContent).join("");
    for (const axis of ["capture", "connection"]) {
      if (own[axis].state !== "graded") continue;
      gradedRows++;
      assert.ok(marks.includes(own[axis].grade), "question " + i + " draws its own " + axis + " grade, as strength answered it: " + marks);
    }
    if (own.capture.state !== "graded" && own.connection.state !== "graded") assert.equal(marks, "", "question " + i + " rests on nothing and draws no grade: " + marks);
  }
  assert.ok(gradedRows >= 2, "control: the questions that rest on a document are graded");
});

test("R1 R9 G12c more than fifty questions are asked for fifty at a time, every one drawn with its own answer and none failed", async () => {
  const { world, ann, project, ids } = await questionsWorld(120);
  const p = await pageAs(world, ann, "/app/project/" + project);
  const reads = p.byOp("inquirystrength");
  assert.deepEqual(reads.map((r) => String(r.query.ids).split(",").length).sort((a, b) => a - b), [20, 50, 50], "three reads for 120 questions");
  assert.deepEqual(reads.flatMap((r) => String(r.query.ids).split(",")).sort(), [...ids].sort(), "naming each question once");
  const rows = section(p, "screen.project.questions.head").querySelectorAll(".cs-row");
  assert.equal(rows.length, 120);
  assert.deepEqual(rows.filter((r) => r.querySelector('[data-state="failed"]')).length, 0, "none is drawn failed");
  /* a question the batch refuses (`NO_SUCH_BUNDLE`) or leaves out is drawn failed alone; neither state is reached by an act: the project's list holds only what the viewer may see, and the batch
     answers every id it is given (strength/index.mjs:745-760), so those cases are not tested */
});

test("R79 G12c the project's dashboard asks for the questions' strength once too", async () => {
  const { world, ann, project } = await questionsWorld(5);
  await ann.act("projectbarset", { query: { project }, body: { capture: "B", connection: "B", expected: { capture: null, connection: null }, reason: "the bar for the walk" } });
  const p = await pageAs(world, ann, "/app/dash-project/" + project);
  assert.equal(p.byOp("inquirystrength").length, 1);
});

test("R79 G12a the project's dashboard reads its documents and the member's own held photos as picker rows too", async () => {
  const { world, ann, project } = await questionsWorld(0);
  const p = await pageAs(world, ann, "/app/dash-project/" + project);
  const asked = p.byOp("heldcaptures");
  assert.ok(asked.length >= 2, "both lists are read");
  assert.deepEqual(asked.map((r) => r.query.fields), asked.map(() => "picker"), "every one a picker read");
});
