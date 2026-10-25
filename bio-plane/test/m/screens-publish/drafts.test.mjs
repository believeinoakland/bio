/* screens-publish, T51 fix round 2 (C49; DEC-394, DEC-395; DEC-396 (11)): the project's earlier drafts. The case editor, the review copy and
 * the ceremony each offer a chooser among the project's drafts (named by scope and date, the newest marked, drawn from `casedrafts`), and
 * every live review link on any draft is listed on the review copy, each stoppable with `reviewrevoke`, and counted on the editor and the
 * ceremony. Each sentence is asserted by its key (R24); every request is compared with its owner's declaration by the harness
 * (interface-shell R104). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, drew, day, ops, press, fill, tick, last, ok, refusedIn, word, COPY, DOCUMENT, P, DR, C, B1, GRANT_UNTIL } from "./fixtures.mjs";

const OLD = "RVD-2026-0000";
const ED = `/app/case-editor/${P}`, RC = `/app/review-copy/${P}`, CER = `/app/ceremony/${P}`;
const SCOPE_OLD = "The 2024 lease amendment", SCOPE_NEW = "Rent adjustments under the Coliseum lease, 2024 to 2026.";
const DRAFTS = (extra = []) => ({ kind: "review-drafts", project: P, drafts: [
  { draft_id: OLD, case: { case_id: C, edition: 1, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev", created_at: "2026-09-18T10:00:00Z", updated_at: "2026-09-18T10:00:00Z" },
  { draft_id: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev", created_at: "2026-10-12T10:00:00Z", updated_at: "2026-10-12T10:00:00Z" },
  ...extra] });
const G = (id, who, o = {}) => ({ grant_id: id, recipient: who, until: GRANT_UNTIL, zone: "America/Los_Angeles", issued_at: "2026-10-06T10:00:00Z", ...o });
/* each draft's own copy answer: its scope and its own grants */
const copies = (byDraft) => (req) => { const d = req.query.draft; const m = byDraft[d] || {}; return ok(COPY({ draft: d, authored: { scope: d === OLD ? SCOPE_OLD : SCOPE_NEW }, comments: [], grants: [], ...m })); };
const PLANE = (byDraft = {}, extra = {}) => ({ casedrafts: ok(DRAFTS()), reviewcopy: copies(byDraft), ...extra });
const line = (scope, date) => word("screen.review-copy.drafts.item", { scope, date });
const pick = (p, id, value) => fill(p, { [id]: value });
const options = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => ({ value: o.getAttribute("value"), text: o.textContent, selected: o.hasAttribute("selected") }));

for (const [screen, path, id] of [["case-editor", ED, "drafts-case-editor"], ["review-copy", RC, "drafts-review-copy"], ["ceremony", CER, "drafts-ceremony"]]) {
  test(`R1 R2 R3 C49 ${screen} offers a chooser among the project's drafts, each named by its scope and the day it was prepared, the newest marked and chosen, drawn from casedrafts`, async () => {
    const p = await open(path, { plane: PLANE() });
    const opts = options(p, id);
    assert.deepEqual(opts.map((o) => o.value), [DR, OLD], "the newest first");
    const date = (iso) => day(iso);
    const item = (s, scope, d) => word(`screen.${s}.drafts.item`, { scope, date: d });
    const newest = word(`screen.${screen}.drafts.newest`);
    assert.equal(opts[0].text.replace(/\s+/g, " "), `${item(screen, SCOPE_NEW, date("2026-10-12"))} · ${newest}`);
    assert.equal(opts[1].text.replace(/\s+/g, " "), item(screen, SCOPE_OLD, date("2026-09-18")), "an earlier draft carries no newest mark");
    assert.ok(opts[0].selected && !opts[1].selected, "the draft the screen shows is chosen");
    assert.ok(ops(p).includes("casedrafts"), "the registry's act, 'Which draft'");
    assert.ok(drew(p, `screen.${screen}.drafts.help`) && drew(p, `screen.${screen}.drafts.choose`));
    assert.equal(p.byOp("casedrafts").filter((r) => r.query && r.query.project === P).length >= 1, true, "read from casedrafts");
  });

  test(`R1 R2 R3 C49 ${screen}: choosing an earlier draft opens that draft's own screen; choosing the one shown stays (control)`, async () => {
    const p = await open(path, { plane: PLANE() });
    pick(p, id, OLD);
    await press(p, "casedrafts");
    assert.equal(p.location.pathname, `/app/${screen}/${encodeURIComponent(P + "/" + OLD)}`, "the screen opens on the chosen draft");
    const q = await open(`${path}/${DR}`, { plane: PLANE() });
    pick(q, id, DR);
    await press(q, "casedrafts");
    assert.equal(q.location.pathname, `${path}/${DR}`, "control: the draft shown stays shown, the address unchanged");
  });

  test(`R1 R2 R3 C49 ${screen}: a project with one draft draws no chooser and no act (control); a failed list is drawn failed, never as one draft`, async () => {
    const one = await open(path, { plane: { casedrafts: ok({ ...DRAFTS(), drafts: DRAFTS().drafts.slice(1) }) } });
    assert.ok(!one.doc.getElementById(id) && !ops(one).includes("casedrafts") && !drew(one, `screen.${screen}.drafts.help`), "no chooser noise for one draft");
    assert.equal(one.byOp("reviewcopy").length, 1, "and no read beyond the one draft's own");
  });
}

test("R1 R2 R3 R73 C49 the chooser waits for every draft's scope: a draft whose copy is not yet read is not named from a guess", async () => {
  const p = await open(RC, { plane: { casedrafts: ok(DRAFTS()), reviewcopy: (req) => (req.query.draft === OLD ? new Promise(() => {}) : ok(COPY({ draft: req.query.draft }))) } });
  assert.ok(!p.doc.getElementById("drafts-review-copy"), "no chooser while a draft's scope is unread");
  assert.ok(main(p).querySelector('[data-state="loading"]'), "drawn as loading");
});

/* ---------- every live review link, on any draft ---------- */

const LIVE = { [OLD]: { grants: [G("GRT-OLD", "Ms. L. Brandt · tenant organizer"), G("GRT-GONE", "Gone · editor", { revoked_at: "2026-10-08T10:00:00Z" })], comments: [] },
  [DR]: { grants: [G("GRT-NEW", "Prof. N. Iyer · housing law")], comments: [] } };

test("R2 R73 C49 the review copy lists every live review link on any draft, each with the draft it is on, each stoppable with reviewrevoke; a revoked grant leaves the list", async () => {
  const p = await open(`${RC}/${DR}`, { plane: PLANE(LIVE) });
  const sec = [...main(p).querySelectorAll("section, .cs-sec")].find((s) => norm(s).includes(word("screen.review-copy.links.heading")));
  assert.ok(sec, "the section is headed screen.review-copy.links.heading");
  const t = norm(sec);
  assert.ok(t.includes("Ms. L. Brandt · tenant organizer") && t.includes("Prof. N. Iyer · housing law"), "a link on an earlier draft and one on this draft");
  assert.ok(t.includes(line(SCOPE_OLD, day("2026-09-18"))) && t.includes(line(SCOPE_NEW, day("2026-10-12"))), "each says which draft by its scope and date");
  assert.ok(!t.includes("Gone · editor"), "control: a revoked grant is not a live link");
  assert.ok(t.includes(word("screen.review-copy.links.note")));
  const stops = sec.querySelectorAll('button[data-act="reviewrevoke"]');
  assert.equal(stops.length, 2, "one Stop sharing for each live link");
});

test("R2 R73 C49 stopping a link on an earlier draft sends reviewrevoke with that grant and the list is read again without it", async () => {
  let gone = false;
  const p = await open(`${RC}/${DR}`, { plane: PLANE(LIVE, { reviewrevoke: () => { gone = true; return ok({ ok: true }); },
    reviewcopy: (req) => ok(COPY({ draft: req.query.draft, authored: { scope: req.query.draft === OLD ? SCOPE_OLD : SCOPE_NEW }, comments: [],
      grants: req.query.draft === OLD ? [G("GRT-OLD", "Ms. L. Brandt · tenant organizer", gone ? { revoked_at: "2026-10-09T10:00:00Z" } : {})] : [G("GRT-NEW", "Prof. N. Iyer · housing law")] })) }) });
  const all = [...main(p).querySelectorAll('button[data-act="reviewrevoke"]')];
  const mine = all.find((b) => b.getAttribute("data-grant") === "GRT-OLD");
  assert.ok(mine, "the earlier draft's link has its own button");
  await p.click(mine);
  await p.settle();
  const slot = p.root().querySelector(`[data-slot="${mine.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  if (ta) { ta.value = "the reader is done"; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  const ok2 = p.root().querySelector('[data-shell="confirm"]');
  if (ok2) await p.click(ok2);
  await p.settle();
  assert.deepEqual(last(p, "reviewrevoke").body.grant, "GRT-OLD");
  assert.ok(!text(p).includes("Ms. L. Brandt · tenant organizer"), "the stopped link leaves the list");
  assert.ok(text(p).includes("Prof. N. Iyer · housing law"), "control: the other stays");
});

test("R2 R73 C49 a project with one draft draws no second list of links (the roster is the list); no live link anywhere draws no links section (controls)", async () => {
  const one = await open(RC, { plane: { casedrafts: ok({ ...DRAFTS(), drafts: DRAFTS().drafts.slice(1) }), reviewcopy: copies(LIVE) } });
  assert.ok(!drew(one, "screen.review-copy.links.heading"), "one draft: the roster lists its links");
  const none = await open(`${RC}/${DR}`, { plane: PLANE({ [OLD]: { grants: [G("GRT-GONE", "Gone · editor", { revoked_at: "2026-10-08T10:00:00Z" })] }, [DR]: { grants: [] } }) });
  assert.ok(!drew(none, "screen.review-copy.links.heading"), "none live: no section");
});

test("R1 R3 R73 C49 the case editor and the ceremony say how many review links are live and how many sit on an earlier draft, and lead to the review copy; none on an earlier draft says nothing (control)", async () => {
  for (const [path, screen] of [[`${ED}/${DR}`, "case-editor"], [`${CER}/${DR}`, "ceremony"]]) {
    const p = await open(path, { plane: PLANE(LIVE) });
    assert.ok(drew(p, `screen.${screen}.links.live`, { count: "2", earlier: "1" }), `${screen}: 2 live, 1 on an earlier draft (the revoked one is no link)`);
    const a = [...main(p).querySelectorAll("a")].find((x) => norm(x).includes(word(`screen.${screen}.links.live`, { count: "2", earlier: "1" })));
    assert.ok(a && String(a.getAttribute("href")).startsWith(`/app/review-copy/${encodeURIComponent(P)}`), `${screen}: a way to the review copy`);
    const q = await open(path, { plane: PLANE({ [OLD]: { grants: [] }, [DR]: { grants: [G("GRT-NEW", "Prof. N. Iyer · housing law")] } }) });
    assert.ok(!text(q).includes(word(`screen.${screen}.links.live`, { count: "1", earlier: "0" })), `${screen} control: nothing on an earlier draft draws no note`);
  }
});

test("R3 R73 C49 the ceremony still draws when the drafts list could not be read: the chooser is drawn failed, the ceremony kept", async () => {
  const p = await open(`${CER}/${DR}`, { plane: { casedrafts: refusedIn("SOME_REFUSAL", "The plane refused this read.") } });
  assert.ok(main(p).querySelector('[data-state="failed"]') && main(p).querySelector("h1"), "failed in its own state, the screen kept");
  assert.ok(ops(p).includes("publishpreflight"), "the ceremony's own steps are still drawn");
});

/* ---------- DEC-396 (11): the Sign step's count and a reopened ceremony ---------- */

test("R13 R71 the Sign step's count line with no evidence is screen.ceremony.signs.count.findings; a reopened ceremony whose edition is public draws screen.ceremony.published.edition", async () => {
  const pub = await open(`${CER}/${DR}`, { plane: { publishedcase: (req) => ((req.query || {}).caseId ? ok({ caseId: C, editions: [{ edition: 1 }] }) : ok({})) } });
  assert.ok(drew(pub, "screen.ceremony.published.edition", { n: "1" }), "Published: edition 1");
  assert.ok(main(pub).querySelector("[data-published-link]"), "with the link to that edition");
  const never = await open(`${CER}/${DR}`);
  assert.ok(!drew(never, "screen.ceremony.published.edition", { n: "1" }), "control: a draft never published draws no such line");
  /* the Sign step: the edition and one finding sign together, no evidence among them */
  const sign = async (plane) => { const q = await open(`${CER}/${DR}`, { plane }); tick(q, "ce-tie", "yes"); await press(q, "publish", { reason: "because" }); return q; };
  const none = await sign({ casedocument: ok(DOCUMENT({ citations: { state: "signed", rows: [{ target: "FND-2026-0031", version: "no_bytes", capture: null }] } })) });
  assert.ok(drew(none, "screen.ceremony.signs.count.findings", { n: "2", findings: "1" }), "the edition and its one finding, no evidence counted");
  assert.ok(!drew(none, "screen.ceremony.signs.count", { n: "2", findings: "1", evidence: "0" }), "never '0 pieces of evidence'");
  const some = await sign({});
  assert.ok(drew(some, "screen.ceremony.signs.count", { n: "3", findings: "1", evidence: "1" }) && !drew(some, "screen.ceremony.signs.count.findings", { n: "3", findings: "1" }), "control: evidence signed with the case is counted as before");
});

const norm = (el) => String(el.textContent).replace(/\s+/g, " ").trim();

/* ---------- G12c (fix round 6): the other drafts' copies are read in one `reviewcopy`, not one each ---------- */
const MORE = ["RVD-2026-0002", "RVD-2026-0003", "RVD-2026-0004"].map((id, i) => ({ draft_id: id, case: null, created_by: "dev", updated_by: "dev", created_at: `2026-10-1${3 + i}T10:00:00Z` }));
/* the batch as `review` is to answer it: `drafts` the ids comma-joined, `{ok, kind: "review-copies", count, copies: {<id>: the single answer}}` */
const batched = (single, dead = []) => (req) => {
  if (!req.query.drafts) return single(req);
  return ok({ ok: true, kind: "review-copies", count: 0, copies: Object.fromEntries(req.query.drafts.split(",").filter((id) => !dead.includes(id)).map((id) => [id, single({ query: { draft: id } }).json.result])) });
};
for (const [screen, path] of [["case-editor", ED], ["review-copy", RC], ["ceremony", CER]]) {
  test(`R73 C49 G12c ${screen}: a project of five drafts reads the four other drafts' copies in one reviewcopy, each draft named by its own scope; a draft the batch lacks is drawn unread (control)`, async () => {
    const plane = (dead) => ({ casedrafts: ok(DRAFTS(MORE)), reviewcopy: batched(copies({ "RVD-2026-0002": { authored: { scope: "Second scope" } }, "RVD-2026-0003": { authored: { scope: "Third scope" } } }), dead) });
    const p = await open(path, { plane: plane([]) });
    const reads = p.byOp("reviewcopy");
    assert.equal(reads.length, 2, "the newest draft, which the screen shows, and one batch for the rest (five reads before)");
    const batch = reads.filter((r) => r.query.drafts);
    assert.equal(batch.length, 1);
    assert.deepEqual(batch[0].query.drafts.split(",").sort(), [OLD, DR, "RVD-2026-0002", "RVD-2026-0003"].sort(), "every other draft, none twice, not the one shown");
    assert.equal(batch[0].query.draft, undefined, "a batch names its drafts alone");
    const labels = options(p, `drafts-${screen}`).map((o) => o.text);
    assert.ok(labels.some((t) => t.includes("Second scope")) && labels.some((t) => t.includes("Third scope")) && labels.some((t) => t.includes(SCOPE_OLD)), "each named by the scope of its own copy");
    const q = await open(path, { plane: plane(["RVD-2026-0003"]) });
    assert.equal(q.byOp("reviewcopy").length, 2);
    assert.ok(!text(q).includes("Third scope"), "a draft the batch does not answer is never given another draft's scope");
  });
}
