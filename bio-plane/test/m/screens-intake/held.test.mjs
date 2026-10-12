/* screens-intake R4: the `held` screen (DEC-97), its read and four acts, at its interface over the stand-in kit. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { pageScreen, kit, viewOf, press, ok, plain } from "./kit.mjs";

const S = pageScreen(SCREENS.find((s) => s.id === "held"));
const draw = (view, opts) => S.render(kit(S, view, opts).cs, view);
const ROWS = [
  { bundle_id: "INFO-2026-0001-photo", title: "Photo · Seminary Ave", project: "Pothole repairs", age_days: 2, eligible: true,
    source: { address: "upload:aa" }, captured_for: { questions: [], withheld: null } },
  { bundle_id: "INFO-2026-0002-budget", title: "City budget", project: null, age_days: 1, eligible: true,
    captured_for: { questions: [{ question: "INQ-1", title: "Were the transfers authorised?", asker: "Ana" }], withheld: null } },
  { bundle_id: "INFO-2026-0003-minutes", title: "Council minutes", project: "Sewer", age_days: 3, eligible: true,
    captured_for: { questions: [], withheld: "Captured for a question you may not see" } },
  { bundle_id: "INFO-2026-0004-lease", title: "Lease amendment", project: "Coliseum", age_days: 0, eligible: false, class: "crucial", reason: "crucial",
    captured_for: { questions: [], withheld: null } },
  { bundle_id: "INFO-2026-0005-packet", title: "Agenda packet (ZIP)", project: "Sewer", age_days: 1, eligible: null, captured_for: null,
    captured_for_basis: "no reader answered",
    archive: { sha256: "d".repeat(64), entries: 41, filed: 36, already_held: 1, not_filed: 2, waiting: 0 },
    files: [{ document: "INFO-2026-0006-agenda", sha256: "e".repeat(64), index: 1, name: "01_Agenda.pdf", grade: "B", eligible: true }],
    files_total: 36, files_truncated: true },
];

test("R4 the screen reads heldcaptures, empty when it lists no row", () => {
  const reads = S.reads(viewOf(S));
  assert.deepEqual(Object.keys(reads), ["held"]);
  assert.equal(reads.held.op, "heldcaptures");
  assert.equal(reads.held.empty({ held: [] }), true);
  assert.equal(reads.held.empty({ held: ROWS }), false);
  assert.match(draw(viewOf(S, { data: { held: { state: "empty" } } })), /No captures are waiting/);
});

test("R4 each row with its title, age and project; questions it was captured for; withheld and refused marks with their reasons", () => {
  const html = draw(viewOf(S, { data: { held: ok({ held: ROWS }) } }));
  for (const r of ROWS) assert.match(html, new RegExp(`data-key="${r.bundle_id}"`));
  assert.match(html, /2 days old · Project: Pothole repairs/);
  assert.match(html, /Captured today · Project: Coliseum/);
  assert.match(html, /For Ana's question: “Were the transfers authorised\?”/);
  assert.match(html, /data-mark="gap\.withheld">Withheld<\/span> Captured for a question you may not see\./);
  assert.match(html, /data-mark="gap\.refused">Refused<\/span> Not eligible for a batch: it is crucial to a finding\. Vouch for it on its own\./);
  assert.match(html, /data-mark="gap\.undetermined"/, "an undetermined eligibility is stated, never drawn eligible");
  /* control: an eligible row with nothing withheld carries no gap mark */
  const one = draw(viewOf(S, { data: { held: ok({ held: [ROWS[0]] }) } }));
  assert.doesNotMatch(one, /data-mark="gap\./);
});

test("R4 rows are picked (shell R19), the hold strip offering release and heldsetaside; an archive's files open open-file", () => {
  const html = draw(viewOf(S, { data: { held: ok({ held: ROWS }) } }));
  assert.equal((html.match(/data-pick=/g) || []).length, ROWS.length);
  assert.match(html, /data-hold="picked"><span class="acts"><button[^>]*data-act="heldsetaside"[\s\S]*data-act="release"/);
  assert.match(html, new RegExp(`data-ref="open-file:${"e".repeat(64)}"[^>]*>01_Agenda\\.pdf<`));
  assert.match(html, /An archive: 36 files filed and held beside it, 2 not filed/);
  assert.match(html, /1 of 36 files shown/);
});

test("R4 release: an enumerated selection of the picked rows, then the release over its handle with the dialog's two fields", async () => {
  const v = viewOf(S, { data: { held: ok({ held: ROWS }) } });
  const r = await press(S, v, "release", { picked: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"],
    fields: { acknowledgment: "Each copy is what its source gave.", mitigation: "Compared with the site." },
    answers: { select: { ok: true, result: { handle: "SEL-1", n: 2 } }, release: { ok: true, released: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"] } } });
  assert.deepEqual(r.kit.requests.map((q) => q.op), ["select", "release"]);
  assert.deepEqual(r.kit.requests[0].body, { ids: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"] });
  assert.deepEqual(r.request.body, { handle: "SEL-1", acknowledgment: "Each copy is what its source gave.", mitigation: "Compared with the site." });
  assert.match(draw(v), /Vouched for: 2\./);
  assert.deepEqual(plain(S.acts.find((a) => a.op === "release").dialog).map((d) => d.name), ["acknowledgment", "mitigation"]);
});

test("R4 release sends nothing with no rows picked, a field missing, or a field outside ratification R20's bounds", async () => {
  const none = await press(S, viewOf(S), "release", { fields: { acknowledgment: "a", mitigation: "b" } });
  assert.equal(none.refused.key, "screen.held.none");
  const miss = await press(S, viewOf(S), "release", { picked: ["X"], fields: { acknowledgment: "a" } });
  assert.match(miss.refused.text, /say: What you did to check\./);
  for (const bad of ["has a \" quote", "two\nlines", "back\\slash", "x".repeat(501)]) {
    const r = await press(S, viewOf(S), "release", { picked: ["X"], fields: { acknowledgment: bad, mitigation: "ok" } });
    assert.equal(r.refused.key, "screen.held.vouchbad", JSON.stringify(bad));
    assert.equal(r.kit.requests.length, 0, "no selection made");
  }
  /* control: at 500 characters it is sent */
  const edge = await press(S, viewOf(S), "release", { picked: ["X"], fields: { acknowledgment: "x".repeat(500), mitigation: "ok" },
    answers: { select: { ok: true, handle: "SEL-2" } } });
  assert.equal(edge.sent, true);
  /* a refused selection sends no release */
  const sel = await press(S, viewOf(S), "release", { picked: ["X"], fields: { acknowledgment: "a", mitigation: "b" }, answers: { select: { ok: false, reason: "TOO_LARGE" } } });
  assert.equal(sel.refused.key, "screen.held.selectfailed");
  assert.deepEqual(sel.kit.requests.map((q) => q.op), ["select"]);
});

test("R4 heldsetaside: one reason (the shell's field) for every picked row; the rows set aside stay in view with heldrestore", async () => {
  const v = viewOf(S, { data: { held: ok({ held: ROWS }) } });
  assert.doesNotMatch(draw(v), /data-act="heldrestore"/);
  const r = await press(S, v, "heldsetaside", { picked: ["INFO-2026-0002-budget"], reason: "Wrong year.",
    answers: { heldsetaside: { ok: true, act: "set_aside", ids: ["INFO-2026-0002-budget"], reason: "Wrong year.",
      documents: [{ id: "INFO-2026-0002-budget", waiting: [{ question: "INQ-1", title: "Were the transfers authorised?", asker: "Ana" }] }] } } });
  assert.deepEqual(r.request.body, { ids: ["INFO-2026-0002-budget"], reason: "Wrong year." });
  assert.equal(S.acts.find((a) => a.op === "heldsetaside").reasonField, undefined, "sent as reason");
  const html = draw(v);
  assert.match(html, /Set aside: 1\. They can be restored, with a reason\./);
  assert.match(html, /Ana's question “Were the transfers authorised\?” was waiting for it/);
  assert.match(html, /data-act="heldrestore"/);
  const back = await press(S, v, "heldrestore", { reason: "Right year after all." });
  assert.deepEqual(back.request.body, { ids: ["INFO-2026-0002-budget"], reason: "Right year after all." });
  assert.match(draw(v), /Restored: 1\./);
  assert.doesNotMatch(draw(v), /data-act="heldrestore"/);
  /* control: nothing picked sends nothing */
  assert.equal((await press(S, viewOf(S), "heldsetaside", {})).refused.key, "screen.held.none");
  assert.equal((await press(S, viewOf(S), "heldrestore", {})).refused.key, "screen.held.none");
});

test("R4 heldcaptures (\"See held captures\") asks the list again", async () => {
  const r = await press(S, viewOf(S), "heldcaptures", {});
  assert.equal(r.request.op, "heldcaptures");
  assert.equal(S.acts.find((a) => a.op === "heldcaptures").rereads, undefined, "every read is made again");
});
