/* following R32–R35 (T50; N1092, N1204; DEC-238 S23 "A"; K3630, K3635): a member's watch marks, read back only to her; the
   team's second-look flags, seen by every member who may see the item; the read registered with retrieval's browse
   (its R85, R86); and who watches an item, for notice-producers alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, BOB, OUTSIDER, MACHINE, T0 } from "./fixture.mjs";
import { followingOf, followingOps, FOLLOWING_CHECKS } from "../../../src/following/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const PRJ = "PRJ-2026-0001-a";
const PRIVATE = "INFO-2026-0002-a";      /* a document of PRJ: only alice sees it */
const OPEN = "INFO-2026-0003-a";         /* a document outside every project: every member sees it */
const QUESTION = "INQ-2026-0004-a";
const ACTION = "ACT-2026-0005-a";
const PLAN = "PLN-2026-0006-a";
const ADMIN = "admin";
const code = (r) => r && (r.code ?? r.reason);
const MINUTE = 60000;

/* alice owns PRJ (its document her own), bob and the outsider are members of the team who are not in it; the open
   items are seen by all; alice, bob and the founder have handles. */
function marked(opts) {
  const w = world(opts);
  w.project(PRJ);
  w.bundle(PRIVATE, { project: PRJ });
  w.bundle(OPEN);
  w.bundle(QUESTION, { type: "inquiry" });
  w.bundle(ACTION, { type: "action" });
  w.bundle(PLAN, { type: "action_plan" });
  for (const [m, h] of [["alice", "alice-h"], ["bob", "bob-h"]]) w.st.sql.exec(`UPDATE members SET handle=? WHERE member_id=?`, h, m);
  assert.equal(w.membership.founderHandleSet({ handle: "founder-h", by: ADMIN }).ok, true);
  return w;
}
const watch = (w, item, x = {}) => w.f.watchItem({ item, by: MEMBER, viewer: MEMBER, ...x });
const flag = (w, item, note = "look again", x = {}) => w.f.secondLook({ item, note, by: MEMBER, viewer: MEMBER, ...x });
const clear = (w, x = {}) => w.f.secondLookClear({ by: BOB, viewer: BOB, ...x });
const marks = (w) => w.markReaders[0].fn;
const watched = (w, viewer) => marks(w)({ viewer, only: "watched", limit: 5000 });
const flagged = (w, viewer) => marks(w)({ viewer, only: "flagged", limit: 5000 });
const count = (w, t) => w.rows(`SELECT count(*) AS n FROM ${t}`)[0].n;

/* ---------------------------------------------------------------- R32 */

test("R32 a member watches an item and her read-back lists it; another member's, the administrator's and an outsider's do not; on: false removes it from her list", () => {
  const w = marked();
  const r = watch(w, OPEN);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.item, r.watched], [OPEN, true]);
  assert.deepEqual(watched(w, MEMBER), { items: [OPEN], truncated: false });
  for (const v of [BOB, OUTSIDER, ADMIN]) assert.deepEqual(watched(w, v), { items: [], truncated: false }, `${v} reads none of alice's marks`);
  assert.deepEqual(marks(w)({ viewer: BOB, ids: [OPEN] }).watched, [], "by ids too");
  assert.deepEqual(marks(w)({ viewer: MEMBER, ids: [OPEN, PRIVATE] }).watched, [OPEN]);
  /* a mark of her own on the same item is bob's own, and alice's is not read back to him */
  assert.equal(watch(w, OPEN, { by: BOB, viewer: BOB }).ok, true);
  assert.deepEqual(watched(w, BOB), { items: [OPEN], truncated: false });
  const off = watch(w, OPEN, { on: false });
  assert.deepEqual([off.ok, off.watched], [true, false]);
  assert.deepEqual(watched(w, MEMBER), { items: [], truncated: false });
  assert.deepEqual(watched(w, BOB), { items: [OPEN], truncated: false }, "taking hers off leaves bob's");
});

test("R32 setting a mark already set, or taking off one not set, answers existed: true and writes nothing; each setting and taking off is kept with its instant", () => {
  const w = marked();
  assert.deepEqual([watch(w, OPEN).ok, watch(w, OPEN).existed], [true, true]);
  assert.equal(count(w, "watch_marks"), 1);
  const none = watch(w, QUESTION, { on: false });
  assert.deepEqual([none.ok, none.existed, none.watched], [true, true, false]);
  assert.equal(count(w, "watch_marks"), 1, "a taking off of nothing writes nothing");
  w.t = T0 + MINUTE;
  assert.equal(watch(w, OPEN, { on: false }).ok, true);
  w.t = T0 + 2 * MINUTE;
  assert.equal(watch(w, OPEN).ok, true);
  assert.deepEqual(w.rows(`SELECT member, on_mark, at FROM watch_marks ORDER BY seq`).map((x) => [x.member, x.on_mark, x.at]),
    [[MEMBER, 1, "2026-10-06T12:00:00Z"], [MEMBER, 0, "2026-10-06T12:01:00Z"], [MEMBER, 1, "2026-10-06T12:02:00Z"]]);
});

test("R32 R34 an item is a document, a question, an action or a plan the viewer may see, or a person or an organization; a bundle of another type, a proceeding and an unseen bundle are not", () => {
  const w = marked();
  const person = w.entity("Dana Reyes", "person"), org = w.entity("Port Ellery Library Board", "institution"), proc = w.proceeding("Ellery v. Marlow");
  for (const item of [OPEN, PRIVATE, QUESTION, ACTION, PLAN, person, org]) assert.equal(watch(w, item).ok, true, item);
  assert.deepEqual(new Set(watched(w, MEMBER).items), new Set([OPEN, PRIVATE, QUESTION, ACTION, PLAN, person, org]));
  const alike = [watch(w, PRJ), watch(w, proc), watch(w, "INFO-2026-9999-none"), watch(w, PRIVATE, { by: OUTSIDER, viewer: OUTSIDER })];
  for (const r of alike) assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "MARK_NO_SUCH_ITEM", FOLLOWING_CHECKS.MARK_NO_SUCH_ITEM.check, word("refusal.MARK_NO_SUCH_ITEM")], JSON.stringify(r));
  assert.equal(new Set(alike.map((r) => r.detail)).size, 1, "absent, hidden and of another kind answer alike");
  assert.deepEqual(watched(w, OUTSIDER), { items: [], truncated: false });
});

test("R32 refusals in order, each writing nothing: a machine or absent author MACHINE_CANNOT_MARK, no item MARK_NO_ITEM, an unseen item MARK_NO_SUCH_ITEM (control: a member lands)", () => {
  const w = marked();
  for (const by of [MACHINE, "class:ai", "", null, undefined, "stranger"]) {
    const r = watch(w, OPEN, { by, viewer: MEMBER });
    assert.deepEqual([r.ok, r.code], [false, "MACHINE_CANNOT_MARK"], `${by}: ${JSON.stringify(r)}`);
    assert.equal(r.translation, word("refusal.MACHINE_CANNOT_MARK"));
    assert.equal(w.f.secondLook({ item: OPEN, note: "x", by, viewer: MEMBER }).code, "MACHINE_CANNOT_MARK");
    assert.equal(w.f.secondLookClear({ item: OPEN, by, viewer: MEMBER }).code, "MACHINE_CANNOT_MARK");
  }
  /* the author is refused before the item is looked at */
  assert.equal(watch(w, null, { by: MACHINE }).code, "MACHINE_CANNOT_MARK");
  for (const item of [null, undefined, "", "  ", 7]) assert.equal(watch(w, item).code, "MARK_NO_ITEM", String(item));
  assert.equal(watch(w, "INFO-2026-9999-none").code, "MARK_NO_SUCH_ITEM");
  assert.equal(count(w, "watch_marks"), 0, "no refusal wrote");
  assert.equal(count(w, "second_looks"), 0);
  assert.equal(watch(w, OPEN).ok, true, "control: a member lands");
  /* the viewer is whoever the stamp says; a viewer carrying the project is the same member */
  assert.equal(watch(w, PRIVATE, { by: MEMBER, viewer: `${MEMBER}@${PRJ}` }).ok, true);
});

test("R32 R17 the marks are declared with their classes: watch marks are owner-seen and never exported; flags are bundle-seen", () => {
  const w = marked();
  const t = (n) => w.record.declaredTables().find((x) => x.name === n);
  assert.deepEqual([t("watch_marks").module, t("watch_marks").sight, t("watch_marks").export], ["following", "owner", "never"]);
  assert.deepEqual([t("second_looks").module, t("second_looks").sight], ["following", "bundle"]);
});

test("R32 the administrator is a member of the team who sets and reads her own marks, and the founder's marks are hers alone", () => {
  const w = marked();
  assert.equal(watch(w, OPEN, { by: ADMIN, viewer: ADMIN }).ok, true);
  assert.deepEqual(watched(w, ADMIN), { items: [OPEN], truncated: false });
  assert.deepEqual(watched(w, "member:admin"), { items: [OPEN], truncated: false }, "the founder's id spelled either way is the founder");
  assert.deepEqual(watched(w, MEMBER), { items: [], truncated: false });
});

/* ---------------------------------------------------------------- R33 */

test("R33 a member flags a question with a note; another member who sees it reads who raised it (her handle), when and the note, clears it, and the history keeps both", () => {
  const w = marked();
  w.t = T0 + MINUTE;
  const f = flag(w, QUESTION, "the second source disagrees");
  assert.equal(f.ok, true, JSON.stringify(f));
  assert.deepEqual([f.item, f.by, f.at, f.note, f.cleared_by, f.cleared_at], [QUESTION, "alice-h", "2026-10-06T12:01:00Z", "the second source disagrees", null, null]);
  assert.deepEqual(flagged(w, BOB).items, [{ id: QUESTION, by: "alice-h", at: "2026-10-06T12:01:00Z", note: "the second source disagrees" }]);
  assert.deepEqual(flagged(w, MEMBER).items, flagged(w, BOB).items, "the raiser sees it as everyone does");
  assert.deepEqual(w.f.secondLooksOf({ item: QUESTION, viewer: BOB }).flags.map((x) => [x.by, x.note, x.cleared_by]), [["alice-h", "the second source disagrees", null]]);
  w.t = T0 + 2 * MINUTE;
  const c = clear(w, { item: QUESTION });
  assert.deepEqual([c.ok, c.flag, c.by, c.cleared_by, c.cleared_at], [true, f.flag, "alice-h", "bob-h", "2026-10-06T12:02:00Z"], JSON.stringify(c));
  assert.deepEqual(flagged(w, BOB), { items: [], truncated: false }, "a cleared flag is gone from the open list");
  assert.deepEqual(w.f.secondLooksOf({ item: QUESTION, viewer: MEMBER }).flags.map((x) => [x.by, x.note, x.at, x.cleared_by, x.cleared_at]),
    [["alice-h", "the second source disagrees", "2026-10-06T12:01:00Z", "bob-h", "2026-10-06T12:02:00Z"]], "the history keeps who raised and who cleared it");
  /* a flag cleared once is not open, and a new flag may be raised */
  assert.equal(clear(w, { item: QUESTION }).code, "SECOND_LOOK_NOT_OPEN");
  assert.equal(clear(w, { flag: f.flag }).code, "SECOND_LOOK_NOT_OPEN");
  const again = flag(w, QUESTION, "still disagrees", { by: BOB, viewer: BOB });
  assert.deepEqual([again.ok, again.existed, again.by, again.flag === f.flag], [true, undefined, "bob-h", false]);
  assert.equal(w.f.secondLooksOf({ item: QUESTION, viewer: BOB }).flags.length, 2);
});

test("R33 an item already flagged and not cleared answers existed: true with that flag and writes nothing; any member who sees it may clear it by the flag or by the item, with no reason", () => {
  const w = marked();
  const f = flag(w, OPEN, "first note");
  const dup = flag(w, OPEN, "a second note", { by: BOB, viewer: BOB });
  assert.deepEqual([dup.ok, dup.existed, dup.flag, dup.by, dup.note], [true, true, f.flag, "alice-h", "first note"]);
  assert.equal(count(w, "second_looks"), 1);
  const c = w.f.secondLookClear({ flag: f.flag, by: ADMIN, viewer: ADMIN });
  assert.deepEqual([c.ok, c.cleared_by], [true, "founder-h"], "the founder is named by the handle membership holds for her, never her id");
  const g = flag(w, QUESTION);
  assert.equal(w.f.secondLookClear({ item: QUESTION, by: OUTSIDER, viewer: OUTSIDER }).ok, true, "a member who sees the item clears it");
  assert.equal(g.ok, true);
});

test("R33 the note is one line of at most 500 characters: absent, blank, longer, or holding a line break is SECOND_LOOK_NO_NOTE and writes nothing (control: 500 characters lands)", () => {
  const w = marked();
  for (const note of [undefined, null, "", "   ", "x".repeat(501), "two\nlines", "two\r\nlines", "carriage\rreturn", "sep\u2028arator", 12]) {
    const r = w.f.secondLook({ item: OPEN, note, by: MEMBER, viewer: MEMBER });
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "SECOND_LOOK_NO_NOTE", FOLLOWING_CHECKS.SECOND_LOOK_NO_NOTE.check, word("refusal.SECOND_LOOK_NO_NOTE")], String(note));
  }
  assert.equal(count(w, "second_looks"), 0);
  assert.equal(flag(w, OPEN, "x".repeat(500)).ok, true);
});

test("R33 refusals in order: a machine author, no item, an unseen item, then the note; clearing what is not open is SECOND_LOOK_NOT_OPEN", () => {
  const w = marked();
  assert.equal(flag(w, null, "", { by: MACHINE }).code, "MACHINE_CANNOT_MARK");
  assert.equal(flag(w, null, "").code, "MARK_NO_ITEM");
  assert.equal(flag(w, "INFO-2026-9999-none", "").code, "MARK_NO_SUCH_ITEM");
  assert.equal(flag(w, PRIVATE, "", { by: BOB, viewer: BOB }).code, "MARK_NO_SUCH_ITEM");
  assert.equal(flag(w, OPEN, "").code, "SECOND_LOOK_NO_NOTE");
  assert.equal(w.f.secondLookClear({ by: MEMBER, viewer: MEMBER }).code, "MARK_NO_ITEM");
  assert.equal(w.f.secondLookClear({ item: "INFO-2026-9999-none", by: MEMBER, viewer: MEMBER }).code, "MARK_NO_SUCH_ITEM");
  assert.equal(w.f.secondLookClear({ flag: 99, by: MEMBER, viewer: MEMBER }).code, "MARK_NO_SUCH_ITEM");
  const r = w.f.secondLookClear({ item: OPEN, by: MEMBER, viewer: MEMBER });
  assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "SECOND_LOOK_NOT_OPEN", FOLLOWING_CHECKS.SECOND_LOOK_NOT_OPEN.check, word("refusal.SECOND_LOOK_NOT_OPEN")]);
  assert.equal(count(w, "second_looks"), 0);
});

test("R33 a member who may not see the item neither reads nor clears its flag (control: a member who may does)", () => {
  const w = marked();
  const f = flag(w, PRIVATE, "the dates do not add up");
  assert.equal(f.ok, true, JSON.stringify(f));
  assert.deepEqual(flagged(w, OUTSIDER), { items: [], truncated: false });
  assert.deepEqual(flagged(w, BOB), { items: [], truncated: false });
  assert.deepEqual(marks(w)({ viewer: BOB, ids: [PRIVATE] }).flagged, []);
  assert.equal(w.f.secondLooksOf({ item: PRIVATE, viewer: BOB }).code, "MARK_NO_SUCH_ITEM");
  assert.equal(w.f.secondLookClear({ item: PRIVATE, by: BOB, viewer: BOB }).code, "MARK_NO_SUCH_ITEM");
  assert.equal(w.f.secondLookClear({ flag: f.flag, by: BOB, viewer: BOB }).code, "MARK_NO_SUCH_ITEM", "nor by its flag id");
  assert.equal(flagged(w, MEMBER).items.length, 1, "it is still open");
  assert.equal(w.f.secondLookClear({ flag: f.flag, by: MEMBER, viewer: MEMBER }).ok, true);
});

test("R33 who raised and who cleared a flag is a handle, never an internal id; a member with no handle is answered null", () => {
  const w = marked();
  w.st.sql.exec(`UPDATE members SET handle=NULL WHERE member_id='outsider'`);
  const f = flag(w, OPEN, "check", { by: OUTSIDER, viewer: OUTSIDER });
  assert.equal(f.by, null);
  assert.doesNotMatch(JSON.stringify([f, flagged(w, MEMBER), marks(w)({ viewer: MEMBER, ids: [OPEN] })]), /outsider|member:/);
});

/* ---------------------------------------------------------------- R34 */

test("R34 at start the module registers once with retrieval's browse-marks door; a second registration is refused; a refused registration is a start-up fault, not ignored", () => {
  const w = marked();
  assert.deepEqual(w.f.marksRegistered, { ok: true, module: "following" });
  assert.deepEqual(w.markReaders.map((x) => x.module), ["following"]);
  assert.throws(() => w.f.registerMarks(), /retrieval refused its marks read: LISTENER_DECLARED/, "a second registration is refused by the door, and reported");
  /* the real retrieval, which following registered with at start: its answer to a second registration is the refusal */
  const real = world({ realRetrieval: true }).retrieval;
  const refusing = { registerBrowseMarks: (...a) => real.registerBrowseMarks(...a) };
  assert.throws(() => world({ door: refusing }), /retrieval refused its marks read: LISTENER_DECLARED/);
  const absent = world({ door: {} });
  assert.deepEqual(absent.f.marksRegistered, { ok: false, reason: "NO_BROWSE_DOOR" });
});

test("R34 the registered read answers only what the viewer may see: a viewer membership does not recognise gets nothing, and the answer never throws", () => {
  const w = marked();
  assert.equal(watch(w, PRIVATE).ok, true);
  flag(w, PRIVATE);
  flag(w, OPEN);
  for (const viewer of [undefined, null, "", "nobody", MACHINE, "class:ai", 42]) {
    assert.deepEqual(marks(w)({ viewer, only: "watched" }), { items: [], truncated: false }, String(viewer));
    assert.deepEqual(marks(w)({ viewer, only: "flagged" }), { items: [], truncated: false }, String(viewer));
    assert.deepEqual(marks(w)({ viewer, ids: [OPEN] }), { watched: [], flagged: [] }, String(viewer));
  }
  assert.deepEqual(marks(w)({ viewer: MEMBER, only: "elsewhere" }), { items: [], truncated: false });
  assert.deepEqual(marks(w)({ viewer: MEMBER, ids: [] }), { watched: [], flagged: [] });
  assert.deepEqual(marks(w)(), { items: [], truncated: false });
  assert.deepEqual(marks(w)({ viewer: BOB, only: "flagged" }).items.map((x) => x.id), [OPEN], "bob sees the open item's flag, not the private one's");
  /* an item that stops being seen drops out of the watcher's own list */
  assert.deepEqual(watched(w, MEMBER).items, [PRIVATE]);
  w.st.sql.exec(`DELETE FROM project_participants WHERE project_id=?`, PRJ);
  assert.deepEqual(watched(w, MEMBER).items, [], "no watch of an item hidden from her is answered");
});

test("R34 only watched and only flagged are bounded by limit with truncated; the ids form answers at most 200 ids", () => {
  const w = marked();
  const docs = Array.from({ length: 205 }, (_, i) => w.bundle(`INFO-2026-1${String(i).padStart(3, "0")}-a`));
  w.t = T0;
  for (const d of docs) watch(w, d);
  assert.equal(marks(w)({ viewer: MEMBER, only: "watched", limit: 3 }).items.length, 3);
  assert.equal(marks(w)({ viewer: MEMBER, only: "watched", limit: 3 }).truncated, true);
  assert.deepEqual(marks(w)({ viewer: MEMBER, only: "watched", limit: 5000 }).truncated, false);
  assert.equal(marks(w)({ viewer: MEMBER, only: "watched" }).items.length, 205);
  assert.equal(marks(w)({ viewer: MEMBER, ids: docs }).watched.length, 200);
  for (const d of docs.slice(0, 4)) flag(w, d);
  assert.deepEqual([marks(w)({ viewer: BOB, only: "flagged", limit: 2 }).items.length, marks(w)({ viewer: BOB, only: "flagged", limit: 2 }).truncated], [2, true]);
});

test("R34 with the registration in place, retrieval.browse with only watched lists the viewer's marks and none of another member's, and only flagged shows by, at and note to every member who sees the item", () => {
  const w = marked({ realRetrieval: true });
  assert.deepEqual(w.f.marksRegistered, { ok: true, module: "following" });
  const r = w.retrieval;
  assert.equal(watch(w, OPEN).ok, true);
  assert.equal(watch(w, PRIVATE).ok, true);
  w.t = T0 + MINUTE;
  assert.equal(flag(w, OPEN, "worth a second look").ok, true);
  assert.equal(flag(w, PRIVATE, "this one is hidden from bob").ok, true);
  const mine = r.browse({ only: "watched", viewer: MEMBER });
  assert.equal(mine.ok, true, JSON.stringify(mine));
  assert.deepEqual(new Set(mine.items.map((x) => x.id)), new Set([OPEN, PRIVATE]));
  assert.ok(mine.items.every((x) => x.watched === true));
  for (const v of [BOB, OUTSIDER, ADMIN]) assert.deepEqual(r.browse({ only: "watched", viewer: v }).items, [], `${v} lists none of alice's marks`);
  const seen = r.browse({ only: "flagged", viewer: BOB });
  assert.deepEqual(seen.items.map((x) => [x.id, x.flagged]), [[OPEN, { by: "alice-h", at: "2026-10-06T12:01:00Z", note: "worth a second look" }]],
    "bob reads by, at and note; the flag on the item hidden from him is not answered");
  assert.equal(seen.items[0].watched, false);
  assert.deepEqual(r.browse({ only: "flagged", viewer: MEMBER }).items.map((x) => x.id).sort(), [OPEN, PRIVATE].sort());
  assert.equal(r.browse({ viewer: BOB }).items.find((x) => x.id === OPEN).flagged.note, "worth a second look", "the flag shows beside the item in a plain browse too");
  /* control: after secondLookClear the flag is gone from both answers */
  assert.equal(clear(w, { item: OPEN }).ok, true);
  assert.deepEqual(r.browse({ only: "flagged", viewer: BOB }).items, []);
  assert.equal(r.browse({ viewer: BOB }).items.find((x) => x.id === OPEN).flagged, null);
  assert.equal(r.browse({ viewer: MEMBER }).undetermined, undefined, "a working read leaves nothing undetermined");
  /* taking a mark off removes it from her list */
  assert.equal(watch(w, OPEN, { on: false }).ok, true);
  assert.deepEqual(r.browse({ only: "watched", viewer: MEMBER }).items.map((x) => x.id), [PRIVATE]);
});

/* ---------------------------------------------------------------- R35 */

test("R35 watchedBy answers each member whose mark is set now with the instant it was last set, oldest first; a taking off drops her, setting again gives the later instant", () => {
  const w = marked();
  assert.deepEqual(w.f.watchedBy(OPEN), { ok: true, watchers: [] }, "control: an item nobody watches");
  w.t = T0 + MINUTE;
  watch(w, OPEN, { by: BOB, viewer: BOB });
  w.t = T0 + 2 * MINUTE;
  watch(w, OPEN);
  assert.deepEqual(w.f.watchedBy(OPEN).watchers, [{ member: BOB, at: "2026-10-06T12:01:00Z" }, { member: MEMBER, at: "2026-10-06T12:02:00Z" }]);
  w.t = T0 + 3 * MINUTE;
  watch(w, OPEN, { by: BOB, viewer: BOB, on: false });
  assert.deepEqual(w.f.watchedBy(OPEN).watchers, [{ member: MEMBER, at: "2026-10-06T12:02:00Z" }]);
  w.t = T0 + 4 * MINUTE;
  watch(w, OPEN, { by: BOB, viewer: BOB });
  watch(w, OPEN, { by: BOB, viewer: BOB });
  assert.deepEqual(w.f.watchedBy(OPEN).watchers, [{ member: MEMBER, at: "2026-10-06T12:02:00Z" }, { member: BOB, at: "2026-10-06T12:04:00Z" }],
    "set again: the later instant; setting what is set moves nothing");
  watch(w, PRIVATE);
  assert.deepEqual(w.f.watchedBy(PRIVATE).watchers, [{ member: MEMBER, at: "2026-10-06T12:04:00Z" }], "the producer reads every watcher, whoever may see the item");
  const person = w.entity("Dana Reyes", "person");
  assert.deepEqual(w.f.watchedBy(person), { ok: true, watchers: [] });
  for (const item of ["INFO-2026-9999-none", PRJ, w.proceeding("Ellery v. Marlow"), "", null, undefined, 5])
    assert.equal(w.f.watchedBy(item).code, "MARK_NO_SUCH_ITEM", String(item));
});

test("R35 R32 no op returns another member's mark: the ops answer the caller's own act only, and watchedBy has no op", () => {
  const w = marked();
  const url = (by) => new URL(`http://x/?by=${encodeURIComponent(by)}&viewer=${encodeURIComponent(by)}`);
  const ops = (by, body) => followingOps(w.f, url(by), body);
  assert.deepEqual(["watchitem", "secondlook", "secondlookclear"].filter((o) => !(o in ops(MEMBER, null))), []);
  assert.equal("watchedby" in ops(MEMBER, null), false);
  assert.equal(ops(MEMBER, { item: OPEN }).watchitem().ok, true);
  const bobs = ops(BOB, { item: OPEN }).watchitem();
  assert.deepEqual([bobs.ok, bobs.existed], [true, undefined], "bob's act is bob's own, not told that alice watches");
  assert.doesNotMatch(JSON.stringify(bobs), /alice/);
  assert.equal(ops(MEMBER, { item: OPEN, note: "look" }).secondlook().ok, true);
  assert.equal(ops(BOB, { item: OPEN }).secondlookclear().ok, true);
  assert.equal(ops(MACHINE, { item: OPEN }).watchitem().code, "MACHINE_CANNOT_MARK", "the stamp is the caller's, never the body's");
});

test("R32 R33 each refusal row's translation is the word list's sentence for its code, read by key (setup-words), and the module holds no member-facing English of its own for them", () => {
  for (const [c, row] of Object.entries(FOLLOWING_CHECKS)) assert.equal(row.translation, word(`refusal.${c}`), c);
});
