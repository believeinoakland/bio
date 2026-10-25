/* control-plane R17, R29, R123 (fix round 10, final pass; K5138; item 78 (6); WALK-FINAL-06 R49.5, R49.7, diag2-06.md section 1; monitoring R9, R79, R74; reevaluation R15): the walker's case through the real door.
   A member captures a page by its address, files it in her project and vouches for it, cites its second paragraph in a question, and asks for the page to be watched (`monitorset`); the page changes (the
   second paragraph's counter) and she presses "Check now" (`monitor`): the check files the newer copy ("modified"). The newer copy is READ (a reading job is owed for it, as for every entry into the record,
   R123: `op=reading` finds it), the question's notice for the leg is graded (`versionnotice`: not left unread), and she ADOPTS it (`adoptversion` with her reason answers ok; before the fix it was
   refused BASIS_VERSION_REFUSED / CONTENT_EXTENT_NO_CHAIN because the filed copy was never read). Run against the Miniflare plane (the seam kit); the reading runs on the object's alarm, awaited by reading. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wmonck" });
after(() => kit.mf.dispose());
const R = kit.R;

const page = (n) => kit.te(`The council meets in public session on the first Tuesday of the month.\n\nThe contract counter stands at ${n} filed amendments, as the clerk's register shows.\n\nThe clerk signs the register after each session.`);

test("R17, R29, R123 (monitoring R9, R79; reevaluation R15): a watched page that changed, checked now, is filed and read, its notice graded, and the member adopts it: adoptversion answers ok", { timeout: 900000 }, async () => {
  const own = await kit.ownerOf("wmonck-owner");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "A watched page, item 78 (6)");
  kit.serve("wmonck-register.txt", page(41), { type: "text/plain" });
  const got = await kit.acquire(own.auth, { locator: "https://docs.example.org/wmonck/wmonck-register.txt", project });
  const a = R(got.body);
  assert.ok(a && a.document, "the capture is held: " + JSON.stringify(got.body).slice(0, 500));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: a.document, title: "wmonck-register", locator: a.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const bundle = filed.bundleId;
  /* vouched, as the Document screen's "Confirm" does */
  const sel = R(await cs.call("select", { body: { ids: [bundle] } }));
  const rel = await cs.call("release", { query: { handle: sel.handle, acknowledgment: "I checked this is the register page.", mitigation: "Nothing in it names a private person." } });
  assert.ok(rel.ok !== false && R(rel).ok !== false, "vouched: " + JSON.stringify(rel).slice(0, 400));
  /* a question resting on the counter's paragraph */
  const question = await kit.questionOf(own.auth, project, "How many amendments are filed?");
  const first = kit.sha(page(41));
  const found = R(await cs.call("findin", { body: { scope: { capture: first }, kinds: ["term"], term: "contract counter" } }));
  const item = found.kinds && found.kinds[0] && found.kinds[0].items && found.kinds[0].items[0];
  assert.ok(item, "the counter's paragraph is found: " + JSON.stringify(found).slice(0, 500));
  const cited = R(await cs.call("cite", { body: { project: question, role: "supports", found: item } }));
  assert.deepEqual(cited.cited, [bundle], "the question rests on the page: " + JSON.stringify(cited).slice(0, 300));
  /* watched daily; the page changes; Check now */
  const watch = await kit.post(own.auth, "monitorset", { bundleId: bundle, enabled: true, frequency: "daily" });
  assert.equal(R(watch.body).ok, true, kit.gateLine(watch));
  kit.serve("wmonck-register.txt", page(57), { type: "text/plain" });
  const checked = await kit.post(own.auth, "monitor", { bundleId: bundle });
  assert.equal(checked.status, 200, kit.gateLine(checked));
  const c = R(checked.body);
  assert.equal(c.status, "modified", "the check finds the page changed: " + kit.gateLine(checked));
  const newer = c.capture && c.capture.sha256;
  assert.match(String(newer), /^[0-9a-f]{64}$/, "the newer copy's digest: " + kit.gateLine(checked));
  assert.equal(newer, kit.sha(page(57)), "the newer copy is the changed page");
  /* the newer copy is read (R123/R79): found, no failure */
  const reading = await kit.until(async () => { const r = R(await kit.get(own.auth, { op: "reading", sha256: newer })); return r && r.found === true ? r : null; }, 90000, 3000);
  assert.ok(reading, "the newer copy is read: " + JSON.stringify(R(await kit.get(own.auth, { op: "reading", sha256: newer }))).slice(0, 400) + " owed: " + JSON.stringify(R(await kit.get(own.auth, { op: "owedwork", sha: newer }))).slice(0, 400) + " capture: " + JSON.stringify(c.capture) + " note: " + c.note);
  assert.ok(!reading.failure, "no failure: " + JSON.stringify(reading).slice(0, 600));
  /* the notice for the leg is graded, not left unread */
  const notice = await kit.until(async () => {
    const r = R(await kit.get(own.auth, { op: "versionnotice", target: question }));
    /* graded: a newer copy exists for the leg and its passage is judged affected or unaffected (not undetermined, not unread) */
    const open = r && Array.isArray(r.notices) ? r.notices.find((n) => n && (n.notice || n.id) && n.newer === true && (n.affects === "affected" || n.affects === "unaffected")) : null;
    return open || null;
  }, 120000, 3000);
  const asked = R(await kit.get(own.auth, { op: "versionnotice", target: question }));
  assert.ok(notice, "the notice is graded, not unread: " + JSON.stringify(asked).slice(0, 900));
  assert.doesNotMatch(JSON.stringify(asked), /newer_capture_unread/, "the newer copy is not unread: " + JSON.stringify(asked).slice(0, 900));
  /* she adopts it, with her reason */
  const adopted = await kit.post(own.auth, "adoptversion", { notice: String(notice.notice || notice.id), why: "The page now shows the counter at fifty-seven; the question rests on the current copy." });
  assert.equal(R(adopted.body).ok, true, "adopt answers ok: " + kit.gateLine(adopted));
});
