/* retrieval-browse: browse (R10, R11; moved from retrieval R85, R86; T50-10; N1092, K3314; DEC-238 F1, F2, S23), at the
 * module's interface: what the viewer may see, newest first, by kind, with `new_since`, `watched` and `flagged`; the marks
 * read from the one module that registers them (`following`'s read, a stub here). The table and the scopes (R12, R13)
 * are in table.test.mjs. */
import test from "node:test";
import assert from "node:assert/strict";
import { word as WORD } from "../../../src/setup-words/index.mjs";
import { world, V, MACHINE } from "./fixture.mjs";
import { BROWSE_KINDS, BROWSE_ONLY, BROWSE_LIMIT_DEFAULT, BROWSE_LIMIT_MAX } from "../../../src/retrieval-browse/index.mjs";
import { listenerRefusal } from "../../../src/membership/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";

const T = (d) => `2026-10-${String(d).padStart(2, "0")}T00:00:00Z`;
const browse = (w, args, viewer = V("vera")) => w.rb.browse({ viewer, ...args });
const tableCounts = (w) => w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
  .map((t) => [t.name, w.count(t.name)]);

/* A document (Oct 5), a question (Oct 3), an action (Oct 4), a plan (Oct 6) and a person (Oct 7), every one visible to
   vera, and one document only ann sees (a project's), newest of all. */
function corpus() {
  let ents = null;
  const w = world({ before: (x) => { ents = entitiesOf(x.host, { record: x.record, membership: x.membership }); } });
  w.entities = ents;
  if (typeof ents.migrate === "function") ents.migrate();
  w.doc("INFO-D", { title: "The budget", last_updated: T(5) });
  w.doc("INQ-Q", { object_type: "inquiry", title: "Who pays?", last_updated: T(3) });
  w.doc("ACT-A", { object_type: "action", title: "Ask the city", last_updated: T(4) });
  w.doc("PLAN-P", { object_type: "action_plan", title: "The plan", last_updated: T(6) });
  const p = w.entities.createEntity({ kind: "person", label: "Jane Roe", note: "n", declaredBy: "member:ann" });
  const o = w.entities.createEntity({ kind: "institution", label: "The Clerk's office", note: "n", declaredBy: "member:ann" });
  w.st.sql.exec(`UPDATE entities SET at = ? WHERE entity_id = ?`, T(7), p.entity_id);
  w.st.sql.exec(`UPDATE entities SET at = ? WHERE entity_id = ?`, T(2), o.entity_id);
  w.person = p.entity_id; w.org = o.entity_id;
  return w;
}
/** The marks read as R11 states it: `{viewer, only, limit}` answers the ids marked, `{viewer, ids}` the marks of those ids. */
function marks({ watches = {}, flags = [] } = {}) {
  const calls = [];
  return {
    calls,
    fn(a) {
      calls.push(a);
      if (a.ids) return { watched: a.ids.filter((id) => (watches[a.viewer] || []).includes(id)),
                          flagged: flags.filter((f) => a.ids.includes(f.id)) };
      return a.only === "watched" ? { items: [...(watches[a.viewer] || [])], truncated: false } : { items: [...flags], truncated: false };
    },
  };
}

test("R10 (T50; N1092): browse lists what the viewer may see, newest first by last change, each item with its kind, id, title, last_changed, new, watched and flagged; ties by id; entities by their creation instant; kinds narrows (a plan list holds plans only)", () => {
  const w = corpus();
  const ans = browse(w, {});
  assert.deepEqual([ans.ok, ans.kinds, ans.only, ans.count, ans.limit, ans.truncated, ans.next], [true, BROWSE_KINDS, null, 6, BROWSE_LIMIT_DEFAULT, false, null]);
  assert.deepEqual(ans.items.map((i) => [i.kind, i.id, i.title, i.last_changed]), [
    ["person", w.person, "Jane Roe", T(7)], ["plan", "PLAN-P", "The plan", T(6)], ["document", "INFO-D", "The budget", T(5)],
    ["action", "ACT-A", "Ask the city", T(4)], ["question", "INQ-Q", "Who pays?", T(3)], ["organization", w.org, "The Clerk's office", T(2)]]
    .map(([k, id, t, at]) => [k === "plan" ? "plan" : k, id, t, at]));
  assert.ok(ans.items.every((i) => i.new === false && i.watched === false && i.flagged === null));
  assert.deepEqual(browse(w, { kinds: ["plan"] }).items.map((i) => i.id), ["PLAN-P"]);
  assert.deepEqual(browse(w, { kinds: "document,question" }).items.map((i) => i.kind), ["document", "question"]);
  assert.deepEqual(browse(w, { kinds: ["entity"] }).items.map((i) => i.kind), ["person", "organization"]);
  assert.deepEqual(browse(w, { kinds: ["all"] }).items.length, 6);
  /* Ties by id. */
  w.doc("INFO-B", { title: "B", last_updated: T(5) });
  assert.deepEqual(browse(w, { kinds: ["document"] }).items.map((i) => i.id), ["INFO-B", "INFO-D"]);
  /* A page: limit, truncated by reading one past, next continuing exactly. */
  const p1 = browse(w, { limit: 3 });
  assert.deepEqual([p1.count, p1.truncated, typeof p1.next], [3, true, "string"]);
  const p2 = browse(w, { limit: 3, after: p1.next });
  const p3 = browse(w, { limit: 3, after: p2.next });
  assert.deepEqual([...p1.items, ...p2.items, ...p3.items].map((i) => i.id), browse(w, { limit: 200 }).items.map((i) => i.id));
  assert.deepEqual([p3.truncated, p3.next], [false, null]);
  assert.deepEqual([browse(w, { limit: 0 }).limit, browse(w, { limit: 10 ** 6 }).limit, browse(w, { limit: "x" }).limit], [1, BROWSE_LIMIT_MAX, BROWSE_LIMIT_DEFAULT]);
});

test("R10 (T50; N1092): new_since needs since and lists only what changed strictly later; new is true only then; the refusals, in order — VIEWER_MISSING, KIND_UNKNOWN, ONLY_UNKNOWN, NO_SINCE, BAD_SINCE — each reading nothing", () => {
  const w = corpus();
  const ans = browse(w, { only: "new_since", since: T(5) });
  assert.deepEqual(ans.items.map((i) => [i.id, i.new]), [[w.person, true], ["PLAN-P", true]], "the document changed exactly at since is not new");
  const all = browse(w, { since: T(5) });
  assert.deepEqual(all.items.filter((i) => i.new).map((i) => i.id), [w.person, "PLAN-P"], "since without only marks new and lists all");
  assert.equal(browse(w, {}).items.some((i) => i.new), false, "new is true only when since was given");
  const before = tableCounts(w);
  const why = (args, viewer) => w.rb.browse({ viewer, ...args }).reason;
  assert.equal(why({}, null), "VIEWER_MISSING");
  assert.equal(why({}, ""), "VIEWER_MISSING");
  const unknown = browse(w, { kinds: ["document", "vibes"], only: "bogus", since: "nope" });
  assert.deepEqual([unknown.reason, unknown.kinds], ["KIND_UNKNOWN", BROWSE_KINDS]);
  const only = browse(w, { only: "bogus", since: "nope" });
  assert.deepEqual([only.reason, only.only], ["ONLY_UNKNOWN", BROWSE_ONLY]);
  assert.equal(why({ only: "new_since" }, V("vera")), "NO_SINCE");
  assert.equal(why({ only: "new_since", since: "" }, V("vera")), "NO_SINCE");
  assert.equal(why({ only: "new_since", since: "yesterday-ish" }, V("vera")), "BAD_SINCE");
  assert.equal(why({ since: 5 }, V("vera")), "BAD_SINCE");
  assert.deepEqual(tableCounts(w), before, "a refusal writes nothing");
});

test("R10 (T50; N1092): a bundle the gate does not pass is neither listed nor counted — an absent or unrecognised viewer sees nothing, never everything — and browsing writes nothing and moves nothing, however often it is read", () => {
  const w = corpus();
  const proj = w.project("Ann's secret", "ann");
  w.doc("INFO-HIDE", { project: proj, title: "Filed in the secret project", last_updated: T(9) }, { author: V("ann") });
  const mine = w.rb.browse({ viewer: V("ann") });
  assert.ok(mine.items.some((i) => i.id === "INFO-HIDE"));
  const theirs = browse(w, {});
  assert.ok(!theirs.items.some((i) => i.id === "INFO-HIDE") && theirs.count === 6, "vera sees six and not the one filed in a project she may not see");
  assert.deepEqual(browse(w, { kinds: ["document"], limit: 1 }).truncated, false);
  for (const viewer of ["garbage", "nobody"]) {
    const none = w.rb.browse({ viewer });
    assert.deepEqual([none.ok, none.count, none.items, none.truncated, none.next], [true, 0, [], false, null], viewer);
  }
  assert.equal(w.rb.browse({ viewer: MACHINE }).ok, true);
  const snap = () => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
    .map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));
  browse(w, {});
  const before = snap();
  const a = browse(w, { only: "new_since", since: T(1) }), b = browse(w, { only: "new_since", since: T(1) });
  assert.deepEqual(a, b, "browsing twice answers alike");
  assert.equal(snap(), before, "and moves nothing");
});

test("R11 (T50; N1092): registerBrowseMarks — a malformed registration, and a second whoever makes it, are refused through membership's listenerRefusal; with a registered stub only: watched lists the viewer's own watches and none of another member's, only: flagged every flag, and a flag shows by, at and note to every viewer who sees the item", () => {
  const w = corpus();
  const r = w.rb;
  for (const [m, f] of [["", () => {}], [null, () => {}], ["following", null], ["following", "fn"]])
    assert.deepEqual(r.registerBrowseMarks(m, f), listenerRefusal(null, m, f), `${m} ${typeof f}`);
  const stub = marks({ watches: { [V("vera")]: ["INFO-D", w.person], [V("ann")]: ["PLAN-P"] },
                       flags: [{ id: "ACT-A", by: V("ann"), at: T(8), note: "check the date" }, { id: "INFO-D", by: V("vera"), at: T(9), note: null }] });
  assert.equal(r.registerBrowseMarks("following", stub.fn).ok, true);
  const again = () => {};
  assert.deepEqual(r.registerBrowseMarks("following", again), listenerRefusal({ module: "following" }, "following", again));
  assert.equal(r.registerBrowseMarks("queue", again).reason, "LISTENER_DECLARED", "the slot takes one registration whoever makes it");
  const watched = browse(w, { only: "watched" });
  assert.deepEqual(watched.items.map((i) => [i.id, i.watched]), [[w.person, true], ["INFO-D", true]], "the viewer's own, never ann's PLAN-P");
  assert.equal(watched.undetermined, undefined);
  assert.deepEqual(stub.calls[0], { viewer: V("vera"), only: "watched", limit: 5000 });
  const flagged = browse(w, { only: "flagged" });
  assert.deepEqual(flagged.items.map((i) => [i.id, i.flagged]), [["INFO-D", { by: V("vera"), at: T(9), note: null }],
    ["ACT-A", { by: V("ann"), at: T(8), note: "check the date" }]]);
  /* Every viewer who sees the item sees the flag; a plain browse shows both marks on each item. */
  const plain = browse(w, {}, V("ann"));
  assert.deepEqual(plain.items.find((i) => i.id === "ACT-A").flagged, { by: V("ann"), at: T(8), note: "check the date" });
  assert.equal(plain.items.find((i) => i.id === "INFO-D").watched, false, "ann does not watch INFO-D");
  assert.equal(plain.items.find((i) => i.id === "PLAN-P").watched, true);
  assert.ok(stub.calls.some((c) => Array.isArray(c.ids) && c.ids.length <= BROWSE_LIMIT_MAX));
  /* kinds narrows the marked list too. */
  assert.deepEqual(browse(w, { only: "watched", kinds: ["entity"] }).items.map((i) => i.id), [w.person]);
  /* new_since beside a mark. */
  assert.deepEqual(browse(w, { only: "new_since", since: T(5), kinds: ["document", "entity"] }).items.map((i) => [i.id, i.new, i.watched]), [[w.person, true, true]]);
});

test("R11, R10 (T50; N1092): with no module registered only: watched and only: flagged answer empty with undetermined, never unfiltered; a read that throws, answers a promise or another shape is no marks — watched false everywhere, undetermined said; a hidden flagged item is not listed", async () => {
  const w = corpus();
  for (const only of ["watched", "flagged"]) {
    const none = browse(w, { only });
    assert.deepEqual([none.ok, none.items, none.count, typeof none.undetermined.why], [true, [], 0, "string"], only);
  }
  const plainNone = browse(w, {});
  assert.equal(plainNone.count, 6);
  assert.ok(plainNone.items.every((i) => i.watched === false && i.flagged === null));
  assert.equal(typeof plainNone.undetermined.why, "string", "the marks cannot be read, and the answer says so");
  const unhandled = [];
  const onUnhandled = (e) => unhandled.push(e);
  process.on("unhandledRejection", onUnhandled);
  assert.equal(w.rb.registerBrowseMarks("following", (a) => {
    if (a.only) throw new Error("watch table gone");
    return Promise.reject(new Error("later"));
  }).ok, true);
  const thrown = browse(w, { only: "watched" });
  assert.deepEqual([thrown.items, typeof thrown.undetermined.why], [[], "string"]);
  assert.match(thrown.undetermined.why, /threw/);
  const promise = browse(w, {});
  assert.equal(promise.count, 6);
  assert.ok(promise.items.every((i) => i.watched === false && i.flagged === null));
  assert.match(promise.undetermined.why, /promise/);
  await new Promise((r) => setTimeout(r, 20));
  process.off("unhandledRejection", onUnhandled);
  assert.deepEqual(unhandled, [], "a rejecting read leaves no unhandled rejection");
  /* Another shape. */
  const w2 = corpus();
  w2.rb.registerBrowseMarks("following", (a) => (a.ids ? { watched: "no", flagged: [] } : { items: "no", truncated: false }));
  assert.equal(browse(w2, { only: "flagged" }).undetermined.why, WORD("retrieval-browse.browse.marks_another_shape"));
  assert.equal(browse(w2, {}).undetermined.why, WORD("retrieval-browse.browse.marks_another_shape"));
  /* Control: a flagged item the viewer may not see is not listed, and counted nowhere. */
  const w3 = corpus();
  const proj = w3.project("Ann's secret", "ann");
  w3.doc("INFO-HIDE", { project: proj, title: "Filed in the secret project", last_updated: T(9) }, { author: V("ann") });
  w3.rb.registerBrowseMarks("following", marks({ flags: [{ id: "INFO-HIDE", by: V("ann"), at: T(8), note: "n" }, { id: "INFO-D", by: V("ann"), at: T(8), note: "n" }] }).fn);
  const flagged = browse(w3, { only: "flagged" });
  assert.deepEqual([flagged.items.map((i) => i.id), flagged.count, flagged.truncated], [["INFO-D"], 1, false]);
  assert.deepEqual(w3.rb.browse({ viewer: V("ann"), only: "flagged" }).items.map((i) => i.id).sort(), ["INFO-HIDE", "INFO-D"].sort());
});
