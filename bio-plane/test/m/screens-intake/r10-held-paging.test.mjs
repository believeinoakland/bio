/* screens-intake fix round 10, cause R33 (G6; walks E1c, E1d; R4; DEC-97 clause 1): the Held list was cut at 50 with a "more" sentence and no way on, and its release
 * ticked every project's rows. It is now per member and per project: it opens on the viewer's own captures ("mine", `member` sent) with a filter to everyone's, and pages by the
 * answer's `next` (`after`). The served `held` page over the REAL plane (`realplane.mjs`) with SIXTY documents held: each uploaded and filed as the screen files an upload. */
import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { open, main, text, idle, press, btn, word, hasWord } from "./page.mjs";
import { realPlane } from "./realplane.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const plane = realPlane("r10held");
after(() => plane.dispose());
const N = 60;
/* the design's rows for the filter and the doors are owed (K4269); the nearest held rows stand in until they are held */
const said = (key, held) => word(hasWord(key) ? key : held);

let world;
const held = () => world ||= (async () => {
  const auth = await plane.founder();
  const kit = { now: () => Date.now(), digest: async (t) => createHash("sha256").update(t).digest("hex"),
    call: async (op, { query = {}, body } = {}) => (await plane.door(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
      headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() };
  const ids = [];
  for (let i = 0; i < N; i++) {
    const bytes = Buffer.from(`Held capture number ${i}, a line the plane reads.\n`);
    const up = await (await plane.door(`/api/?op=captureupload&statement=r10&name=${encodeURIComponent(`held-${String(i).padStart(2, "0")}.txt`)}&type=text%2Fplain`, { method: "POST", headers: auth, body: bytes })).json();
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 200));
    const made = await CAPTURE_SCREEN.parts.promoteDocument(kit, { doc: up.result.document, title: `held-${String(i).padStart(2, "0")}`, locator: up.result.document.locator, project: "" });
    assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 200));
    ids.push(made.bundleId);
  }
  const me = (await (await plane.door("/api/?op=whoami", { headers: auth })).json()).result;
  return { auth, ids, me };
})();

/* the page over the real plane; the first page's answer is kept so the test can name its `next` */
async function heldPage(path = "/app/held") {
  const { auth, me } = await held();
  const seen = [];
  const via = plane.viaDoor(auth, { heldcaptures: (json) => { seen.push(json); return json; } });
  const p = await open(path, { plane: via, me });
  await idle(p, 3000);
  return { p, seen, me };
}
const rows = (p) => main(p).querySelectorAll('[id^="pick-held-"]').map((e) => e.id.replace("pick-held-", ""));
const pageReads = (p) => p.byOp("heldcaptures").filter((r) => !r.query.bundle_ids && !r.query.state);
const moreLine = (p) => main(p).querySelector("[data-more]");

test("R4 (cause 33; the real plane) sixty held: the first page names fifty of the viewer's own, the sentence that more are waiting comes with its door, and the door reads from the answer's `next`", async () => {
  const { p, seen, me } = await heldPage();
  assert.equal(pageReads(p).length, 1);
  assert.equal(pageReads(p)[0].query.member, me.member, "mine: the viewer's own captures, sent as `member`");
  assert.equal(pageReads(p)[0].query.limit, "50");
  const first = rows(p);
  assert.equal(first.length, 50, "the page names fifty");
  const answer = seen.find((a) => a.result && Array.isArray(a.result.held) && a.result.held.length === 50);
  assert.ok(answer && answer.result.truncated === true && typeof answer.result.next === "string" && answer.result.next, "the plane says there are more and where: " + JSON.stringify(answer && answer.result.next));
  assert.ok(moreLine(p), "the sentence that more are waiting");
  const door = btn(p, "heldcaptures", `[data-after]`);
  assert.ok(door, "and its door to the next page");
  assert.ok(text(p).includes(said("screen.held.next", "document.read.next")));
  await press(p, "heldcaptures", { sel: `[data-after]` });
  await idle(p, 3000);
  const after = pageReads(p).filter((r) => r.query.after);
  assert.ok(after.length >= 1 && after.every((r) => r.query.after === answer.result.next), "the door sends `after` equal to the answer's `next`");
  assert.ok(after.every((r) => r.query.member === me.member), "and stays on the viewer's own");
  const second = rows(p);
  assert.equal(second.length, 10, "page two shows the other ten (rows 51 to 60)");
  assert.equal(new Set([...first, ...second]).size, N, "all sixty, none twice");
  assert.equal(moreLine(p), null, "no sentence that more are waiting on the last page");
  assert.ok(btn(p, "heldcaptures", `[data-back]`), "a way back");
});

test("R4 (cause 33; the real plane) 'Everyone's' is a filter between the viewer's own and the team's: the page is read again with no `member`, from the first page", async () => {
  const { p, me } = await heldPage();
  const choice = p.doc.getElementById("ch-who");
  assert.ok(choice, "the filter is drawn");
  assert.equal(choice.value || "mine", "mine", "it opens on mine");
  choice.value = "all";
  await p.fire(choice, "change");
  await idle(p, 3000);
  const reads = pageReads(p);
  const last = reads[reads.length - 1];
  assert.equal(last.query.member, undefined, "everyone's: no `member`");
  assert.equal(last.query.after, undefined, "and from the first page");
  assert.equal(rows(p).length, 50);
  assert.ok(text(p).includes(said("screen.held.who.all", "ai.whose.group")));
  const again = p.doc.getElementById("ch-who");
  assert.equal(again.value, "all", "the choice stays where the member put it");
  again.value = "mine";
  await p.fire(again, "change");
  await idle(p, 3000);
  const back = pageReads(p);
  assert.equal(back[back.length - 1].query.member, me.member);
});

test("R4 (cause 33; the real plane) a project's page carries the project with the filter, and a list that fits one page draws no sentence and no door", async () => {
  const { p, me } = await heldPage("/app/held/PROJ-2026-0001-pothole-repairs-at");
  const r = pageReads(p)[0];
  assert.equal(r.query.project, "PROJ-2026-0001-pothole-repairs-at");
  assert.equal(r.query.member, me.member);
  assert.equal(moreLine(p), null);
  assert.equal(btn(p, "heldcaptures", "[data-after]"), null);
});
