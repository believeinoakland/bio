/* monitoring: DEC-149's voice (T34-87). A member-facing string calls the group's Civicsmith "your group's Civicsmith"
   or needs no name, never "this instance", "this copy", "this plane" or "the plane". Each changed string is named here
   and read at the module's interface: the two check rows (C-48.8, C-48.9) as the catalogue holds them and as a tick
   answers them, the unrecognised Drive shape's detail, the Session Log line a Drive tick writes, an unscheduled
   per-meeting address's reason, and the landing's detail when it could not complete. Model- and operator-facing text
   (the due slate's framing, an operator's storage binding, a contract code's basis) is not member-facing and stays. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, DAEMON, NOW_MS, infoMd } from "./fixture.mjs";
import { DRIVE_TICK_CHECKS, MONITORING_CHECKS } from "../../../src/monitoring/index.mjs";

const OLD_NAMES = /\b(this|the|our|its|your)\s+(?:(?:civicsmith|group's)\s+)?(instance|copy|plane)\b/i;
const IS_THE_SHELL = "The check of that Google Drive document did not run: the export address answered with a web page "
  + "rather than a document, which is what Drive does when a file stops being shared with anyone who has the link. "
  + "Nothing was compared and nothing about the record changed — what is known is that your group's Civicsmith could "
  + "not see the document today.";
const BYTES_ARE_THE_SHELL = "The check of that Google Drive document did not run: the export address said it was sending a "
  + "document and sent a web page instead. Your group's Civicsmith reads the bytes rather than the label, so the "
  + "application page was recognised and not compared against the captured document — comparing it would report a "
  + "change on every visit that nobody made.";
const DOC = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcd/edit";
const EXPORT = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcd/export?format=odt";
const tick = (w, id) => w.m.monitor({ bundleId: id, viewer: DAEMON, actorClass: "machine", actor: DAEMON });

test("R4 R42 DEC-149: C-48.8's and C-48.9's translations say your group's Civicsmith, as the catalogue holds them and as a Drive tick refused on the declared type and on the bytes answers them", async () => {
  assert.deepEqual([DRIVE_TICK_CHECKS.DRIVE_TICK_EXPORT_IS_THE_SHELL.check, DRIVE_TICK_CHECKS.DRIVE_TICK_EXPORT_IS_THE_SHELL.translation],
                   ["C-48.8", IS_THE_SHELL]);
  assert.deepEqual([DRIVE_TICK_CHECKS.DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL.check, DRIVE_TICK_CHECKS.DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL.translation],
                   ["C-48.9", BYTES_ARE_THE_SHELL]);
  const w = world();
  const id = "INFO-2026-0901-voice";
  w.monitored(id, DOC, "odt", { row: { locator: EXPORT } });
  w.net.routes[EXPORT] = serve("<html>sign in</html>", "text/html; charset=utf-8");
  const page = await tick(w, id);
  assert.deepEqual([page.body.reason, page.body.check, page.body.translation], ["DRIVE_TICK_EXPORT_IS_THE_SHELL", "C-48.8", IS_THE_SHELL]);
  w.net.routes[EXPORT] = serve("<!DOCTYPE html><html><body>app</body></html>", "application/vnd.oasis.opendocument.text");
  const bytes = await tick(w, id);
  assert.deepEqual([bytes.body.reason, bytes.body.check, bytes.body.translation],
                   ["DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL", "C-48.9", BYTES_ARE_THE_SHELL]);
});

test("R1 DEC-149: a Drive address of an unrecognised shape is refused with a detail whose own sentence says your group's Civicsmith cannot read it (the reading before it is capture-sources' readDriveAddress's)", async () => {
  const w = world();
  const id = "INFO-2026-0902-shape";
  w.promote(id, infoMd(id, "https://docs.google.com/zzz/abc"));
  const r = await tick(w, id);
  assert.equal(r.body.reason, "DRIVE_SHAPE_UNRECOGNISED");
  const own = " A shape your group's Civicsmith cannot read is a shape it cannot promise to be watching.";
  assert.ok(r.body.detail.endsWith(own), r.body.detail);
  assert.doesNotMatch(own, OLD_NAMES);
});

test("R8 DEC-149: the Session Log line of a Drive tick names the export it fetched and what it was composed from, with no name for the group's Civicsmith", async () => {
  const w = world();
  const id = "INFO-2026-0903-log";
  w.monitored(id, DOC, "odt-bytes", { row: { locator: EXPORT } });
  w.net.routes[EXPORT] = serve("odt-bytes", "application/vnd.oasis.opendocument.text");
  const r = await tick(w, id);
  assert.equal(r.body.ok, true);
  const line = w.text(id).split("\n").find((l) => l.startsWith("Monitor tick: "));
  assert.equal(line, "Monitor tick: the source still serves the captured bytes (compared raw)"
    + ` — fetched ${EXPORT}, the OpenDocument export composed from the Drive document in ${DOC}`);
  assert.doesNotMatch(line, OLD_NAMES);
});

test("R16 R32 DEC-149: an address checked per meeting is unscheduled with the reason that its meeting schedule is not one your group's Civicsmith holds, in the plan and in the read", () => {
  const w = world();
  const id = "INFO-2026-0904-meeting";
  w.monitored(id, "https://records.example.org/meetings", "m1", { freq: "per_meeting" });
  const want = "cadence is a meeting schedule your group's Civicsmith does not hold";
  assert.equal(w.m.schedule(NOW_MS).unscheduled.find((r) => r.bundle === id).reason, want);
  const item = w.m.monitoring({ viewer: DAEMON, now: NOW_MS }).items.find((r) => r.bundle === id);
  assert.deepEqual([item.state, item.reason], ["unscheduled", want]);
});

test("R28 R65 DEC-149: a landing that could not complete says so with no name for the group's Civicsmith, and never throws", () => {
  const w = world();
  const r = w.m.sweepHost().land({ id: "GATH-2026-0905-x", bundle: "INFO-2026-0905-none", locators: [] },
                                 { locator: "https://records.example.org/x", doc: null }, "2026-09-28T12:00:00Z");
  assert.deepEqual(r, { ok: false, reason: null, detail: "the landing did not complete, and why was not recorded" });
});

test("R42 DEC-149: no translation in this module's table calls the group's Civicsmith this instance, this copy, this plane or the plane", () => {
  for (const [code, row] of Object.entries(MONITORING_CHECKS)) assert.doesNotMatch(row.translation, OLD_NAMES, code);
});
