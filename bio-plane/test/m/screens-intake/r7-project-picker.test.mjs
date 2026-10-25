/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G74, a member files into a project only when she is in it or invited to it (BOB's ruling, following
 * K4557). The walker, a member outside the administrator's project, was offered Add on its route, saw the project's id where its name belongs, filed a CSV
 * and found it unreadable on her own Document page. Add has no project chooser of its own: the project is the route's subject (`/app/capture/<tab>/<PROJ-…>`,
 * or a question's project), so "the picker offers only those projects" is that route: for one she may not file into, nothing is looked up, fetched or sent
 * and the screen says so; for one she may, the project is named by its name and never its id. The refusal's sentence is the nearest held row's
 * (`project.notmember`, owed to UX-DESIGN: its own row). Entry by the route and the press. `projectlist` and `image` are scripted at their owners' shapes
 * (project-roster R26, R34: `participation` `joined`, `leaving`, `invited` or null). */
/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G74, a member files into a project only when she is in it or invited to it (BOB's ruling, following
 * K4557). The walker, a member outside the administrator's project, was offered Add on its route, saw the project's id where its name belongs, filed a CSV
 * and found it unreadable on her own Document page. Add has no project chooser of its own: the project is the route's subject (`/app/capture/<tab>/<PROJ-…>`,
 * or a question's project), so "the picker offers only those projects" is that route: for one she may not file into, nothing is looked up, fetched or sent
 * and the screen says so; for one she may, the project is named by its name and never its id. The refusal's sentence is the nearest held row's
 * (`project.notmember`, owed to UX-DESIGN: its own row). Entry by the route and the press.
 * Over the REAL store (fix round 10, K5054): a project is made by the member's real act, the other's project is not hers (she is not in it, or only invited by
 * the owner's real `projectinvite`), and `projectlist` and `image` answer what the project roster and the record answer for her. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, text, fill, press, says, word, hasWord, ok, refused, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.nps.gov/yose/planyourvisit/index.htm";
const PAGE = "<html><head><title>Plan your visit</title></head><body><p>Yosemite.</p></body></html>";
const FILE = new File(["a,b\n1,2\n"], "c1.csv", { type: "text/csv" });
const CAN = ["contribute", "create_projects"];
/* mai is the member who files; rosa owns the projects mai is not in (or is invited to); ada, an administrator who is in none of them, is listed them with no participation */
async function team() {
  const t = await members({ mai: CAN, rosa: CAN });
  t.world.script(ADDRESS, async () => new Response(PAGE, { status: 200, headers: { "content-type": "text/html" } }));
  const joined = await t.world.recipes.project(t.mai, "Yosemite");
  const others = await t.world.recipes.project(t.rosa, "Yosemite valley");
  const invitedTo = await t.world.recipes.project(t.rosa, "Yosemite trails");
  await t.rosa.act("projectinvite", { query: { projectId: invitedTo, handle: "mai" } });
  const ada = await t.world.signIn("ada", { admin: true });
  return { ...t, ada, joined, others, invitedTo };
}
const open = (t, path, as = t.mai, plane = {}) => openWorld(path, { world: t.world, as, plane, screens: [...SCREENS, DOCUMENT_STUB] });
const upload = async (p) => { fill(p, { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." }); await press(p, "captureupload"); };
const capture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
/* the sentence: U463/DEC-425's `refusal.PROMOTE_NOT_A_PARTICIPANT` ({project} by name) where the row exists and the list names the project, else the nearest held row */
/* the key is a code-sourced row of the table (promotion's refusal), which the design's list does not hold; it is named as `capture.mjs` names it */
const PNAP = "refusal." + "PROMOTE_NOT_A_PARTICIPANT";
const refusal = (name) => (name && hasWord(PNAP) ? word(PNAP, { project: name }) : word("project.notmember"));
const sent = (p) => ["heldat", "acquire", "captureupload", "allocid", "promote"].flatMap((op) => p.byOp(op).map(() => op));

test("R22 R35 R62 (G74) Add on a project the member is neither in nor invited to says so, never names it by its id, and an address capture sends nothing", async () => {
  const t = await team();
  /* a member is listed no project she is not in; an administrator is listed it with no participation, so the list names it. The record lets the administrator read
     the project, so the owner's refusal of the read (what a member meets) is the one scripted answer for her */
  for (const [as, name, plane] of [[t.mai, "", {}], [t.ada, "Yosemite valley", { image: refused("NO_SUCH_PROJECT", undefined, 404) }]]) {
    const p = await open(t, `/app/capture/address/${t.others}`, as, plane);
    assert.equal(main(p).querySelectorAll("[data-notmember]").length, 1, "the page says it before anything is pressed: " + name);
    assert.ok(text(p).includes(refusal(name)));
    assert.equal(text(p).includes(t.others), false, "the project's id is never drawn");
    await capture(p);
    assert.deepEqual(sent(p), [], "no look, no fetch, nothing filed");
    assert.ok(text(p).includes(refusal(name)), "the refusal beside the act is the same sentence");
  }
});

test("R22 R35 R62 (G74) the same for a file: its bytes are not sent for a project the member is not in", async () => {
  const t = await team();
  const p = await open(t, `/app/capture/file/${t.others}`);
  await upload(p);
  assert.deepEqual(sent(p), [], "nothing is sent, so nothing is stored under a project she cannot see");
  assert.ok(text(p).includes(refusal("")));
  assert.equal(text(p).includes(t.others), false);
});

test("R22 R35 R62 (G74) controls: a joined member files and the project is named by its name; an invited member who has not joined files too, named by the list's name", async () => {
  const t = await team();
  const joined = await open(t, `/app/capture/file/${t.joined}`);
  assert.equal(main(joined).querySelectorAll("[data-notmember]").length, 0);
  await upload(joined);
  assert.equal(joined.byOp("captureupload").length, 1);
  assert.equal(joined.byOp("promote").length, 1);
  assert.ok(says(joined, "capture.filed.project", { project: "Yosemite" }), "named by its name");
  assert.equal(text(joined).includes(t.joined), false, "never by its id");
  /* invited: the project's own read is refused by the record (the skeleton only), the list names her participation */
  const invited = await open(t, `/app/capture/address/${t.invitedTo}`);
  assert.equal(main(invited).querySelectorAll("[data-notmember]").length, 0, "gathering stays open to an invited member");
  await capture(invited);
  assert.equal(invited.byOp("acquire").length, 1);
  assert.equal(invited.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text.includes(`project: ${t.invitedTo}`), true, "filed under the project");
  assert.ok(says(invited, "capture.filed.project", { project: "Yosemite trails" }), "named by the list's name");
  assert.equal(text(invited).includes(t.invitedTo), false);
});

test("R22 R35 R62 (G74) a member's project whose front matter states no title is filed but never named by its id; a page with no project files nowhere as before", async () => {
  const t = await team();
  /* a project whose front matter states no title cannot be made: the record refuses a project with no name (promote NO_TITLE), so the read of its front matter is the one scripted answer */
  const bare = await open(t, `/app/capture/address/${t.joined}`, t.mai, { image: ok({ "bundle.md": `---\nid: ${t.joined}\n---\n` }) });
  await capture(bare);
  assert.equal(bare.byOp("promote").length, 1);
  assert.equal(text(bare).includes(t.joined), false, "the id is not the name");
  /* another page, so the record does not already hold the first */
  const other = "https://www.nps.gov/yose/learn/news/index.htm";
  t.world.script(other, async () => new Response("<html><head><title>News</title></head><body><p>News.</p></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  const none = await open(t, "/app/capture/address");
  fill(none, { "ci-address": other });
  await press(none, "acquire");
  assert.equal(none.byOp("promote").length, 1, "no subject, no project: nothing is refused");
  assert.equal(main(none).querySelectorAll("[data-notmember]").length, 0);
});
