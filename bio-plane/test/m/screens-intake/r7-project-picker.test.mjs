/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G74, a member files into a project only when she is in it or invited to it (BOB's ruling, following
 * K4557). The walker, a member outside the administrator's project, was offered Add on its route, saw the project's id where its name belongs, filed a CSV
 * and found it unreadable on her own Document page. Add has no project chooser of its own: the project is the route's subject (`/app/capture/<tab>/<PROJ-…>`,
 * or a question's project), so "the picker offers only those projects" is that route: for one she may not file into, nothing is looked up, fetched or sent
 * and the screen says so; for one she may, the project is named by its name and never its id. The refusal's sentence is the nearest held row's
 * (`project.notmember`, owed to UX-DESIGN: its own row). Entry by the route and the press. `projectlist` and `image` are scripted at their owners' shapes
 * (project-roster R26, R34: `participation` `joined`, `leaving`, `invited` or null). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, text, fill, press, says, word, hasWord, ok, refused, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const PROJ = "PROJ-2026-0007";
const ADDRESS = "https://www.nps.gov/yose/planyourvisit/index.htm";
const SHA = "d".repeat(64);
const MD = `---\ntitle: "Yosemite"\n---\n\n## Summary\n`;
const DOC = { capture: { sha256: SHA, bytes: 900, encoding: "utf-8" }, file: "snapshots/a.htm", title: null };
const FILE = new File(["a,b\n1,2\n"], "c1.csv", { type: "text/csv" });
const UP = ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 }, document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } } });
const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } });
const row = (more = {}) => ({ id: PROJ, name: "Yosemite", participation: "joined", mine: { in: true, owner: false }, ...more });
/* the viewer's reads: the project's front matter (refused to a non-member) and her project list */
const plane = ({ image, projects }) => ({ projectlist: ok({ projects, truncated: false, next: null }), image: image ? ok({ "bundle.md": MD }) : refused("NO_SUCH_PROJECT", undefined, 404),
  allocid: ok({ ok: true, id: "INFO-2026-0150" }), promote: (r) => ok({ ok: true, bundleId: r.body.bundleId }), heldat: NOT_HELD,
  opencaptures: ok({ ok: true, truncated: false, captures: [] }), heldcaptures: ok({ ok: true, held: [] }),
  acquire: ok({ ok: true, existed: false, document: DOC }), captureupload: UP });
const open = (path, p) => openPage(path, { plane: plane(p), screens: [...SCREENS, DOCUMENT_STUB] });
const upload = async (p) => { fill(p, { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." }); await press(p, "captureupload"); };
const capture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
/* the sentence: U463/DEC-425's `refusal.PROMOTE_NOT_A_PARTICIPANT` ({project} by name) where the row exists and the list names the project, else the nearest held row */
/* the key is a code-sourced row of the table (promotion's refusal), which the design's list does not hold; it is named as `capture.mjs` names it */
const PNAP = "refusal." + "PROMOTE_NOT_A_PARTICIPANT";
const refusal = (name) => (name && hasWord(PNAP) ? word(PNAP, { project: name }) : word("project.notmember"));
const sent = (p) => ["heldat", "acquire", "captureupload", "allocid", "promote"].flatMap((op) => p.byOp(op).map(() => op));

test("R22 R35 R62 (G74) Add on a project the member is neither in nor invited to says so, never names it by its id, and an address capture sends nothing", async () => {
  for (const [projects, name] of [[[], ""], [[row({ participation: null, mine: { in: false, owner: false } })], "Yosemite"]]) {
    const p = await open(`/app/capture/address/${PROJ}`, { image: false, projects });
    assert.equal(main(p).querySelectorAll("[data-notmember]").length, 1, "the page says it before anything is pressed");
    assert.ok(text(p).includes(refusal(name)));
    assert.equal(text(p).includes(PROJ), false, "the project's id is never drawn");
    await capture(p);
    assert.deepEqual(sent(p), [], "no look, no fetch, nothing filed");
    assert.ok(text(p).includes(refusal(name)), "the refusal beside the act is the same sentence");
  }
});

test("R22 R35 R62 (G74) the same for a file: its bytes are not sent for a project the member is not in", async () => {
  const p = await open(`/app/capture/file/${PROJ}`, { image: false, projects: [] });
  await upload(p);
  assert.deepEqual(sent(p), [], "nothing is sent, so nothing is stored under a project she cannot see");
  assert.ok(text(p).includes(refusal("")));
  assert.equal(text(p).includes(PROJ), false);
});

test("R22 R35 R62 (G74) controls: a joined member files and the project is named by its name; an invited member who has not joined files too, named by the list's name", async () => {
  const joined = await open(`/app/capture/file/${PROJ}`, { image: true, projects: [row()] });
  assert.equal(main(joined).querySelectorAll("[data-notmember]").length, 0);
  await upload(joined);
  assert.equal(joined.byOp("captureupload").length, 1);
  assert.equal(joined.byOp("promote").length, 1);
  assert.ok(says(joined, "capture.filed.project", { project: "Yosemite" }), "named by its name");
  assert.equal(text(joined).includes(PROJ), false, "never by its id");
  /* invited: the project's own read is refused (the skeleton only), the list names her participation */
  const invited = await open(`/app/capture/address/${PROJ}`, { image: false, projects: [row({ participation: "invited", mine: { in: false, owner: false } })] });
  assert.equal(main(invited).querySelectorAll("[data-notmember]").length, 0, "gathering stays open to an invited member");
  await capture(invited);
  assert.equal(invited.byOp("acquire").length, 1);
  assert.equal(invited.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text.includes(`project: ${PROJ}`), true, "filed under the project");
  assert.ok(says(invited, "capture.filed.project", { project: "Yosemite" }), "named by the list's name");
  assert.equal(text(invited).includes(PROJ), false);
});

test("R22 R35 R62 (G74) a member's project whose front matter states no title is filed but never named by its id; a page with no project files nowhere as before", async () => {
  const bare = await openPage(`/app/capture/address/${PROJ}`, { plane: { ...plane({ image: true, projects: [row()] }), image: ok({ "bundle.md": `---\nid: ${PROJ}\n---\n` }) }, screens: [...SCREENS, DOCUMENT_STUB] });
  await capture(bare);
  assert.equal(bare.byOp("promote").length, 1);
  assert.equal(text(bare).includes(PROJ), false, "the id is not the name");
  const none = await open("/app/capture/address", { image: false, projects: [] });
  await capture(none);
  assert.equal(none.byOp("promote").length, 1, "no subject, no project: nothing is refused");
  assert.equal(main(none).querySelectorAll("[data-notmember]").length, 0);
});
