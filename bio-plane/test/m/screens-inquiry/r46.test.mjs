/* screens-inquiry R46 (R085-20; K3501 (F6c); amends R40): an author recorded as the founder's credential (`admin`) is drawn by the
 * founder's handle when the members the screen reads name one, and by the unnamed word only when they name none. On the
 * served page over a scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, boot } from "../interface-shell/harness.mjs";
import { unnamedFounderWorld } from "../store-request/fixtures.mjs";
import { open, main, word, day, inquiryMd, INQUIRY_REFS, SCREENS, P, Q } from "./fixtures.mjs";

const at = "/app/question/" + Q;
/* the opener: the first promotion's author is the founder's credential */
const hist = JSON.stringify({ target: Q, base: null, created: "2026-10-03T10:00:00Z", author: "admin" });
const images = { [Q]: { "bundle.md": inquiryMd(P, INQUIRY_REFS), "_history/promotion_a.json": hist } };
/* the members the project screen reads: the founder's row carries her handle (or none), and a member */
const parts = (handle) => ok({ ok: true, projectId: P, participants: [{ founder: true, handle, state: "joined", owner: 1 },
  { handle: "mai", state: "joined", owner: 0 }] });

test("R46 the founder's credential as the opener is drawn by her handle the members name; the unnamed word only when none does", async () => {
  const p = await open(at, { images, plane: { projectparticipants: parts("sparky") } });
  const sub = main(p).querySelector(".mk-sub");
  assert.ok(sub.textContent.includes(word("screen.question.opened", { name: "sparky", date: day("2026-10-03"), project: "" }).trim()), "the founder by her handle");
  assert.doesNotMatch(main(p).textContent, /\badmin\b/, "never the credential");
  /* control: with no handle held, the unnamed founder: a founder who chose none (`unnamedFounderWorld`) opens a question, and a member who joined reads its page */
  const world = await unnamedFounderWorld();
  const mai = await world.signIn("mai", { capabilities: ["contribute"] });
  const project = await world.recipes.project(world.unnamed, "Unnamed founder's potholes");
  await world.unnamed.act("projectinvite", { query: { projectId: project, handle: "mai" }, body: {} });
  await mai.act("projectjoin", { query: { projectId: project }, body: {} });
  const opened = (await world.recipes.question(world.unnamed, project, { title: "Seven days", text: "Is it so?", draw: true })).id;
  const { door, session } = world.boot(mai);
  const none = await boot({ screens: SCREENS, door, session, path: "/app/question/" + opened });
  await none.settle();
  const text = main(none).querySelector(".mk-sub").textContent;
  assert.ok(text.includes(word("member.founder.unnamed").trim()), "the unnamed founder when none is named: " + text);
  assert.doesNotMatch(main(none).textContent, /\badmin\b/, "never the credential");
});
