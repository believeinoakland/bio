/* R37 (DEC-147 (2), (3), (5); N662; publication R66–R69): a case edition signed to publish at a set time earns, through
   feedItems, its status while it waits, one finding once it publishes, one once the check at its time stops it; to the
   member who set its time and the case's project's owners only; never a word converted from the time as set. The
   provider is a fake answering publication R69's entry shape (`scheduledEditions`, read as the plane). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const entry = (over = {}) => ({ case: "CASE-1", edition: 2, project: "PRJ-1", state: "waiting", signer: "KEY-O", set_by: "carol",
  signed_at: iso(NOW - 3600000), at: { date: "2026-09-03", time: "09:30", zone: "America/Los_Angeles" },
  publish_at: "2026-09-03T16:30:00Z", moves: [], outcome_at: null, reasons: null, ...over });

function scheduled(editions, extra = {}) {
  const asked = [];
  const w = world({ publication: { scheduledEditions: (a) => {
    asked.push(a);
    const list = typeof editions === "function" ? editions(a) : editions;
    return { ok: true, editions: list, limit: 500, cursor: null };
  } }, ...extra });
  w.member("owner"); w.member("carol"); w.member("bob"); w.member("admin", { role: "admin" });
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-2", "project");
  w.join("PRJ-1", "owner", { owner: true }); w.join("PRJ-1", "carol"); w.join("PRJ-1", "bob"); w.join("PRJ-2", "owner", { owner: true });
  w.asked2 = asked;
  return w;
}
const ofKind = (r, re) => r.items.filter((i) => re.test(i.kind));

test("R37: a waiting edition is one CONDITION edition-scheduled, keyed CONDITION::edition-scheduled::<case>@<edition>, saying \"Signed · publishes <date, time>\" as set, offering the move and the cancel", () => {
  const w = scheduled([entry()]);
  const r = w.read("owner");
  const it = byId(r)["CONDITION::edition-scheduled::CASE-1@2"];
  assert.ok(it, "the waiting edition's status");
  assert.deepEqual([it.class, it.kind], ["CONDITION", "edition-scheduled"]);
  assert.ok(it.summary.startsWith("Signed · publishes 2026-09-03, 09:30"), it.summary);
  /* R36: the date and time as set, in the group's zone as R69 carries it, never converted to UTC */
  assert.ok(!/16:30|T16|UTC/.test(`${it.summary} ${it.detail}`), "never the UTC instant");
  assert.match(it.detail, /America\/Los_Angeles/);
  assert.deepEqual(it.subject, { kind: "case_edition", id: "CASE-1@2", case: "CASE-1", edition: 2, project: "PRJ-1" });
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the case's project");
  assert.deepEqual(it.options.map((o) => o.id), ["publishatmove", "publishatcancel"]);
  assert.deepEqual(it.recipients.sort(), ["carol", "owner"]);
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3600000), ms: 3600000 }, "aged from its signing");
  assert.equal(it.basis.source, "publication.scheduledEditions");
  assert.deepEqual(it.basis.at, { date: "2026-09-03", time: "09:30", zone: "America/Los_Angeles" });
  assert.deepEqual(w.asked2[0], { after: null }, "read as the plane: no viewer is passed (publication R69)");
  /* a moved time changes the item's words, never mints another item */
  const moved = scheduled([entry({ at: { date: "2026-09-04", time: "18:05", zone: "America/Los_Angeles" },
    moves: [{ at: { date: "2026-09-03", time: "09:30", zone: "America/Los_Angeles" }, by: "owner" }] })]).read("owner");
  assert.deepEqual(ofKind(moved, /^edition-scheduled$/).map((i) => i.id), ["CONDITION::edition-scheduled::CASE-1@2"]);
  assert.ok(byId(moved)["CONDITION::edition-scheduled::CASE-1@2"].summary.startsWith("Signed · publishes 2026-09-04, 18:05"));
});

test("R37: once published, one FINDING edition-published-as-scheduled naming the set time and the instant published; once stopped, one FINDING scheduled-edition-stopped naming each reason in its own translation; a cancelled edition earns none", () => {
  const reasons = [{ code: "SCHEDULED_SOURCE_CHANGED", translation: "A source this case rests on changed after it was signed." },
                   { code: "SCHEDULED_HOLD_CHANGED", translation: "A hold on this case changed after it was signed." }];
  const w = scheduled([
    entry({ case: "CASE-P", state: "published", outcome_at: iso(NOW - 60000) }),
    entry({ case: "CASE-S", state: "stopped", outcome_at: iso(NOW - 120000), reasons }),
    entry({ case: "CASE-C", state: "cancelled", outcome_at: iso(NOW - 1000) })]);
  const r = w.read("owner");
  const m = byId(r);
  const pub = m["FINDING::edition-published-as-scheduled::CASE-P@2"];
  assert.deepEqual([pub.class, pub.kind], ["FINDING", "edition-published-as-scheduled"]);
  assert.match(pub.summary, /2026-09-03, 09:30/, "the set time");
  assert.ok(pub.detail.includes(iso(NOW - 60000)), "the instant published");
  assert.deepEqual(pub.age, { state: "determined", since: iso(NOW - 60000), ms: 60000 });
  assert.deepEqual(pub.options, []);
  const stop = m["FINDING::scheduled-edition-stopped::CASE-S@2"];
  assert.deepEqual([stop.class, stop.kind], ["FINDING", "scheduled-edition-stopped"]);
  for (const x of reasons) assert.ok(stop.detail.includes(x.translation), `names ${x.code} in its own translation`);
  assert.match(stop.detail, /Nothing was published\. Publishing this edition needs a new signing\./);
  assert.deepEqual(stop.basis.reasons, reasons);
  assert.deepEqual(stop.age, { state: "determined", since: iso(NOW - 120000), ms: 120000 });
  assert.equal(r.items.filter((i) => i.subject && i.subject.case === "CASE-C").length, 0, "a cancelled edition earns no item");
  assert.equal(ofKind(r, /scheduled|published-as/).length, 2, "nothing else: no CONDITION once it has left waiting");
});

test("R37: the items go to the member who set the time and the case's project's owners, and to nobody else; a project the viewer may not see yields none (R11)", () => {
  const w = scheduled([entry(), entry({ case: "CASE-2", project: "PRJ-2", set_by: "token:admin" }),
                       entry({ case: "CASE-3", project: "PRJ-H", set_by: "owner" })]);
  w.bundle("PRJ-H", "project");
  const ids = (who, viewer) => ofKind(w.read(who, viewer), /^edition-scheduled$/).map((i) => i.id).sort();
  assert.deepEqual(ids("owner"), ["CONDITION::edition-scheduled::CASE-1@2", "CONDITION::edition-scheduled::CASE-2@2"],
    "an owner of each project; PRJ-H, which owner may not see, is withheld though owner set its time");
  assert.deepEqual(ids("carol"), ["CONDITION::edition-scheduled::CASE-1@2"], "the member who set the time, not an owner");
  assert.deepEqual(ids("bob"), [], "a member of the project who neither set it nor owns it");
  assert.deepEqual(ids("admin"), [], "an administrator is not named by R37");
  assert.deepEqual(ids(null, "class:admin"), [], "a caller with no member");
  assert.ok(!JSON.stringify(w.read("owner")).includes("PRJ-H"), "the hidden project is named nowhere");
  const two = byId(w.read("owner"))["CONDITION::edition-scheduled::CASE-2@2"];
  assert.deepEqual(two.recipients, ["owner"], "a machine that set the time is no recipient");
});

test("R37: the read is followed by its cursor, and an unreadable time is said so, never guessed", () => {
  const pages = { null: [entry({ case: "CASE-A" })], "c1": [entry({ case: "CASE-B", at: { date: "2026-9-3", time: "9:30", zone: null } })] };
  const w = world({ publication: { scheduledEditions: ({ after }) => ({ ok: true, limit: 500,
    editions: pages[String(after)] || [], cursor: after === null ? "c1" : null }) } });
  w.member("owner"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "owner", { owner: true });
  const m = byId(w.read("owner"));
  assert.ok(m["CONDITION::edition-scheduled::CASE-A@2"] && m["CONDITION::edition-scheduled::CASE-B@2"], "both pages read");
  assert.match(m["CONDITION::edition-scheduled::CASE-B@2"].summary, /^Signed · publishes a time that cannot be read/);
});
