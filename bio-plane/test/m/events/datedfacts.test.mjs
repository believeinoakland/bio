/* events: dated facts at the interface (R1–R5, and R27's datedFactsFor). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MEMBER, MACHINE, OUTSIDER } from "./fixture.mjs";
import { DATED_KINDS } from "../../../src/events/index.mjs";

const doc = { kind: "document" };

test("R1 recordDatedFact refuses in order NO_SHA, CAPTURE_NOT_HELD (absent or out of sight alike), NO_EXTENT, EXTENT_NOT_IN_CAPTURE, UNKNOWN_DATED_KIND, BAD_DATE, NO_METHOD; holds one fact and a repeat answers already", () => {
  const w = world();
  const s = w.capture("r1", { pages: 2 });
  const ok = { captureSha: s, extent: doc, kind: "adopted", value: "2026-02-03", method: "read by a member", by: MEMBER };
  const reason = (x) => w.ev.recordDatedFact(x).reason;
  assert.equal(reason({ ...ok, captureSha: "" }), "NO_SHA");
  assert.equal(reason({ ...ok, captureSha: sha("never held") }), "CAPTURE_NOT_HELD");
  w.project("PROJ-2026-0001-p", "bob");
  const hidden = w.capture("hidden", { bundleId: "INFO-2026-0009-h", project: "PROJ-2026-0001-p" });
  const unseen = w.ev.recordDatedFact({ ...ok, captureSha: hidden, by: OUTSIDER });
  const absent = w.ev.recordDatedFact({ ...ok, captureSha: sha("never held"), by: OUTSIDER });
  assert.equal(unseen.reason, "CAPTURE_NOT_HELD");
  assert.deepEqual(unseen, absent, "a capture out of sight is answered exactly as an absent one");
  assert.equal(reason({ ...ok, extent: null }), "NO_EXTENT");
  assert.equal(reason({ ...ok, extent: { kind: "pdf-page", page: 9 } }), "EXTENT_NOT_IN_CAPTURE");
  assert.equal(reason({ ...ok, extent: { kind: "nonsense" } }), "EXTENT_NOT_IN_CAPTURE");
  const unk = w.ev.recordDatedFact({ ...ok, kind: "birthday" });
  assert.equal(unk.reason, "UNKNOWN_DATED_KIND");
  assert.deepEqual(unk.kinds, [...DATED_KINDS]);
  assert.deepEqual(DATED_KINDS, ["meeting", "adopted", "effective", "signed", "entered", "issued", "published", "received", "hearing", "period_covered", "edited"]);
  for (const bad of ["2026-02-31", "2026-13-01", "soon", 7, null]) assert.equal(reason({ ...ok, value: bad }), "BAD_DATE", String(bad));
  assert.equal(reason({ ...ok, method: " " }), "NO_METHOD");
  /* the order: an unknown kind with a bad date answers the kind first, a bad date with no method the date */
  assert.equal(reason({ ...ok, kind: "x", value: "2026-02-31", method: "" }), "UNKNOWN_DATED_KIND");
  assert.equal(reason({ ...ok, value: "2026-02-31", method: "" }), "BAD_DATE");
  assert.equal(w.rows(`SELECT * FROM dated_facts`).length, 0, "no refusal writes");
  const a = w.ev.recordDatedFact(ok);
  assert.equal(a.ok, true);
  for (const k of ["dated_fact_id", "capture_sha", "extent", "kind", "value", "method", "grade", "by", "at"]) assert.ok(k in a.dated_fact, k);
  assert.deepEqual([a.dated_fact.kind, a.dated_fact.value, a.dated_fact.precision, a.dated_fact.by], ["adopted", "2026-02-03", "day", MEMBER]);
  const b = w.ev.recordDatedFact(ok);
  assert.equal(b.already, true);
  assert.equal(b.dated_fact.dated_fact_id, a.dated_fact.dated_fact_id);
  assert.equal(w.rows(`SELECT * FROM dated_facts`).length, 1, "a repeat writes nothing");
  /* a day precision value is a day, never a midnight: its zone is the profile's */
  assert.equal(a.dated_fact.zone, "America/Halifax");
  const minute = w.ev.recordDatedFact({ ...ok, value: "2026-02-03T19:00" });
  assert.equal(minute.dated_fact.precision, "minute");
  assert.notEqual(minute.dated_fact.dated_fact_id, a.dated_fact.dated_fact_id, "another value is another fact");
});

test("R2 a dated fact's grade is its capture's own, never the caller's; a machine-read date carries its method and is never above its source", () => {
  const w = world();
  const direct = w.capture("direct");
  const unrouted = w.capture("unrouted", { fetched: false });
  const a = w.ev.recordDatedFact({ captureSha: direct, extent: doc, kind: "signed", value: "2026-01-02", method: "m", grade: "A", by: MEMBER });
  assert.equal(a.dated_fact.grade, w.prov.captureGrade(direct).grade);
  assert.equal(a.dated_fact.grade, "B", "a direct capture earns the ceiling, and the caller's A is not read");
  const b = w.ev.recordDatedFact({ captureSha: unrouted, extent: doc, kind: "signed", value: "2026-01-02", method: "OCR", by: MACHINE });
  assert.equal(b.dated_fact.grade, w.prov.captureGrade(unrouted).grade ?? null);
  assert.equal(b.dated_fact.method, "OCR");
});

test("R3 R4 dated facts are held by a member's act or the after-read hook for an opted-in class only; the set starts empty and changes only by an administrator's recorded act", async () => {
  const w = world();
  assert.deepEqual(w.ev.readOptIn().captureClasses, [], "empty by default");
  /* a reading of a class outside the set gets nothing (no sweep of every reading) */
  w.capture("minutes-1", { contentType: "meeting_minutes", facts: { date: "2026-04-14", adopted: "2026-04-20" } });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(w.rows(`SELECT * FROM dated_facts`).length, 0);
  assert.equal(w.ev.setReadOptIn({ captureClasses: ["meeting_minutes"], by: MEMBER }).reason, "NOT_AN_ADMIN");
  assert.equal(w.ev.setReadOptIn({ captureClasses: ["meeting_minutes"], by: MACHINE }).reason, "NOT_AN_ADMIN");
  const set = w.ev.setReadOptIn({ captureClasses: ["meeting_minutes"], by: "member:root" });
  assert.equal(set.ok, true);
  assert.deepEqual(w.ev.readOptIn().history.map((h) => h.by), ["member:root"], "the change is recorded with who");
  const s = w.capture("minutes-2", { contentType: "meeting_minutes", facts: { date: "2026-04-14", adopted: "2026-04-20", status: "x", convened: "not a date" } });
  await new Promise((r) => setTimeout(r, 0));
  const held = w.ev.datedFactsFor({ captureSha: s, viewer: MEMBER }).dated_facts;
  assert.deepEqual(held.map((f) => [f.kind, f.value]).sort(), [["adopted", "2026-04-20"], ["meeting", "2026-04-14"]]);
  for (const f of held) {
    assert.match(f.method, /reader meeting_minutes v1: the field/);
    assert.equal(f.by, "class:daemon");
  }
  /* another class is still outside the set */
  w.capture("report", { contentType: "staff_report", facts: { date: "2026-04-01" } });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(w.rows(`SELECT * FROM dated_facts WHERE capture_sha=?`, sha("report")).length, 0);
  /* the hook is registered once, through reading-pipeline */
  assert.equal(w.hooks.onRead("events", () => {}, { captureClasses: ["x"] }).reason, "LISTENER_DECLARED");
});

test("R5 edit acts: an office capture's created and modified values held on request as issued and edited dated facts, the method naming the field, as the file's statement about itself", () => {
  const w = world();
  const s = w.capture("memo.docx", { contentType: "office", extra: { metadata: { author: "A. Clerk", lastModifiedBy: "B. Editor",
    created: "2026-05-01T09:30:00Z", modified: "2026-05-03T16:00:00Z", source: "docProps/core.xml" } } });
  const plain = w.capture("page.html");
  assert.equal(w.ev.recordEditActs({ captureSha: plain, by: MEMBER }).reason, "NO_OFFICE_METADATA");
  assert.equal(w.ev.recordEditActs({ captureSha: sha("absent"), by: MEMBER }).reason, "CAPTURE_NOT_HELD");
  assert.equal(w.ev.recordEditActs({ by: MEMBER }).reason, "NO_SHA");
  const r = w.ev.recordEditActs({ captureSha: s, by: MEMBER });
  assert.equal(r.ok, true);
  const by = Object.fromEntries(r.dated_facts.map((f) => [f.kind, f]));
  assert.deepEqual(Object.keys(by).sort(), ["edited", "issued"]);
  assert.equal(by.issued.value, "2026-05-01T09:30:00");
  assert.equal(by.issued.zone, "UTC");
  assert.match(by.issued.method, /the file's created value; author as the file writes it: A\. Clerk/);
  assert.match(by.edited.method, /the file's modified value; last modified by as the file writes it: B\. Editor/);
  for (const f of r.dated_facts) {
    assert.match(f.method, /never a finding/);
    assert.equal(f.extent.kind, "envelope");
  }
  assert.equal(w.ev.recordEditActs({ captureSha: s, by: MEMBER }).dated_facts.length, 2);
  assert.equal(w.rows(`SELECT * FROM dated_facts`).length, 2, "on request again, nothing new");
  assert.equal(w.rows(`SELECT * FROM events`).length, 0, "an edit act is a dated fact, never an event by itself");
});

test("R27 datedFactsFor refuses NO_SHA and answers a capture's dated facts in extent order, to a viewer who may see the capture", () => {
  const w = world();
  const s = w.capture("r27", { pages: 3 });
  for (const [page, v] of [[2, "2026-01-03"], [0, "2026-01-01"], [1, "2026-01-02"]])
    w.ev.recordDatedFact({ captureSha: s, extent: { kind: "pdf-page", page }, kind: "issued", value: v, method: "m", by: MEMBER });
  assert.equal(w.ev.datedFactsFor({ viewer: MEMBER }).reason, "NO_SHA");
  const got = w.ev.datedFactsFor({ captureSha: s, viewer: MEMBER }).dated_facts;
  assert.deepEqual(got.map((f) => f.value), ["2026-01-01", "2026-01-02", "2026-01-03"]);
  assert.equal(w.ev.datedFactsFor({ captureSha: s }).count, 0, "an absent viewer sees nothing");
});
