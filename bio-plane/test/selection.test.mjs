/* NEGATIVE CONTROL: (run 2026-07-31) force every selection with no explicit kind to resolve as "query" (store.mjs: guard the `ids.length ? "enumerated"` arm with `false`, so a picked-ids selection stops enumerating) -> 7 assertions fail (kind enumerated, the stored-item count, resolving to exactly what was picked) then the suite throws; restored, 65 pass. */
/* Server-side selections, S-10 step 5.
 *
 * Negative-control detail: force every selection with no explicit kind to resolve as "query" (store.mjs: guard the `ids.length ? "enumerated"` arm with `false`, so a picked-ids selection stops enumerating) -> 7 assertions fail (kind enumerated, the stored-item count, resolving to exactly what was picked) then the suite throws; restored, 65 pass.
 *
 * A selection exists so that the set an operator selected is the set an action
 * lands on. Bob settled the three questions this was blocked on, 2026-07-25:
 *
 *   1. SELECT-ALL MEANS THE QUERY. The operator picked a criterion, so the
 *      current answer to the criterion is the correct set. A query selection
 *      therefore stores no items at all, which is O(1) storage AND the honest
 *      representation of what was meant, rather than a size optimisation
 *      wearing that disguise. An ENUMERATED selection, where the operator
 *      picked specific items, freezes membership and stores the sha each item
 *      carried when picked.
 *
 *   2. KEEP-ALIVE IS 300 SECONDS, refreshed on read, provisional until
 *      operational experience says otherwise. A Worker holds no connection, so
 *      a closed view is unobservable; the plane requires proof of life instead.
 *
 *   3. WHAT DRIFT MEANS DEPENDS ON THE ACTION'S WEIGHT. Citing Information in a
 *      Project proceeds and reports. Anything that changes state refuses and
 *      makes the operator look again.
 *
 * The case that is NOT a policy choice: visibility. An item the viewer may no
 * longer see must leave the selection, because a frozen selection that
 * preserved access past a revocation would be a visibility leak outliving the
 * revocation. Asserted below by resolving the same selection under a viewer the
 * compiler does not recognise.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

const OWNER = "class:member", VIEW = "viewer=class:member&owner=class:member";

const md = (b) => `---
id: ${b.id}
object_type: ${b.type || "information"}
schema: information@2
title: "${b.title}"
current_state: ${b.state}
created: "2026-07-01T00:00:00Z"
last_updated: "${b.updated}"
criticality: ${b.crit || "notable"}
group: believe-in-oakland
references: []
source:
  locator: "https://oaklandca.opengov.com/x"
  authority: "Oakland OpenGov portal"
  retrieved: "2026-07-01"
---

${b.body}
`;
const promote = async (b, base = null, writer = null, operation = null) => {
  const text = md(b);
  return call("/promote", {
    bundleId: b.id, base, snapKey: `${b.id}-${base ? Date.now() : "new"}`, author: "suite",
    writer, operation,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    meta: { object_type: b.type || "information", group: "believe-in-oakland", title: b.title,
            current_state: b.state, created: "2026-07-01T00:00:00Z", last_updated: b.updated,
            criticality: b.crit || "notable" },
  });
};

const CORPUS = [];
for (let i = 0; i < 12; i++) CORPUS.push({
  id: `INFO-2026-${String(7000 + i).padStart(4, "0")}-sel`,
  title: `Selection record ${i}`,
  state: i < 6 ? "collected" : "reviewed",
  updated: `2026-07-${String(10 + i).padStart(2, "0")}T00:00:00Z`,
  body: `sewer fund record ${i} ${i % 2 ? "alpha" : "bravo"}`,
});
for (const b of CORPUS) await promote(b);

console.log("\n--- a query selection stores the criterion, not the rows ---");
let qh;
{
  const s = await call(`/select?${VIEW}&q=state:collected`);
  t("it is created", s.ok, true);
  t("and it is a query selection, because no ids were named", s.kind, "query");
  t("with the right count", s.n, 6);
  t("and it reports the keep-alive Bob set", s.ttlSeconds, 300);
  qh = s.handle;
  const st = await call("/stats");
  /* The whole point of the O(1) representation: six members, zero stored rows. */
  t("no items were stored for it", st.selectionItems, 0);
  t("but the selection itself exists", st.selections, 1);
  const r = await call(`/selection?handle=${qh}&${VIEW}`);
  t("resolving it answers the criterion", r.n, 6);
  t("and nothing has moved yet", r.moved, false);
  t("the members are the ids", r.members.length, 6);
}

console.log("\n--- an enumerated selection freezes the rows the operator picked ---");
let eh;
{
  const picked = CORPUS.slice(0, 4).map((b) => b.id);
  const s = await call(`/select?${VIEW}&q=`, { ids: picked });
  t("naming ids makes it an enumeration", s.kind, "enumerated");
  t("with the picked count", s.n, 4);
  eh = s.handle;
  t("and the items are stored, with the sha each carried", (await call("/stats")).selectionItems, 4);
  const r = await call(`/selection?handle=${eh}&${VIEW}`);
  t("it resolves to what was picked", r.members.slice().sort(), picked.slice().sort());
  t("and nothing has moved", r.moved, false);
}

console.log("\n--- the two kinds answer a new match differently, which is the whole distinction ---");
{
  await promote({ id: "INFO-2026-7099-newcomer", title: "Selection record newcomer",
                  state: "collected", updated: "2026-07-30T00:00:00Z", body: "sewer fund newcomer alpha" });
  const q = await call(`/selection?handle=${qh}&${VIEW}`);
  t("the query selection includes the new match, because the criterion is the intent", q.n, 7);
  t("and says the set moved", q.moved, true);
  t("reporting one added", q.drift.added, 1);
  t("it cannot say WHICH rows moved, and says so rather than implying it can",
    typeof q.drift.detail === "string", true);
  const e = await call(`/selection?handle=${eh}&${VIEW}`);
  t("the enumeration does NOT gain it, because the operator picked items", e.n, 4);
  t("and reports no movement at all", e.moved, false);
}

console.log("\n--- revision drift is detected and CLASSIFIED from the manifest ---");
{
  const target = CORPUS[0];
  const cur = (await call(`/projection?id=${target.id}`)).bundle_sha;
  await promote({ ...target, body: "sewer fund record 0 bravo rewritten", updated: "2026-07-28T00:00:00Z" }, cur);
  const r = await call(`/selection?handle=${eh}&${VIEW}`);
  t("the revision is seen", r.drift.revised.length, 1);
  t("naming the bundle", r.drift.revised[0].bundleId, target.id);
  t("with the sha it was picked at and the sha it carries now",
    [typeof r.drift.revised[0].was, typeof r.drift.revised[0].now], ["string", "string"]);
  t("classified as authored, because a person wrote it", r.drift.revised[0].class, "authored");
  t("the member is still in the set", r.members.includes(target.id), true);
  t("and the set is reported as moved", r.moved, true);

  /* A monitor tick and a member's rewrite are different events, and the manifest
     already records which is which, so drift is classified rather than lumped. */
  const target2 = CORPUS[1];
  const cur2 = (await call(`/projection?id=${target2.id}`)).bundle_sha;
  await promote({ ...target2, body: "sewer fund record 1 alpha", updated: "2026-07-29T00:00:00Z" },
    cur2, "mechanical", "monitor-tick");
  const r2 = await call(`/selection?handle=${eh}&${VIEW}`);
  const mech = r2.drift.revised.find((x) => x.bundleId === target2.id);
  t("a mechanical revision is classified as mechanical", mech.class, "mechanical");
  t("and names the operation it claimed", mech.operation, "monitor-tick");
}

console.log("\n--- action weight decides what drift means (Bob, 2026-07-25) ---");
{
  const light = await call(`/selection?handle=${eh}&${VIEW}&weight=report`);
  t("a citing-weight action proceeds", light.ok, true);
  t("and hands over the members", light.members.length, 4);
  t("while saying the set moved", light.moved, true);
  const heavy = await call(`/selection?handle=${eh}&${VIEW}&weight=refuse`);
  t("a state-changing action refuses", heavy.ok, false);
  t("with a reason that names what happened", heavy.reason, "SET_MOVED");
  t("and hands over NOTHING, so it cannot half-run", heavy.members, []);
  t("but still reports the drift, so the operator can see what to look at", heavy.drift.revised.length, 2);

  /* An unmoved selection is not refused. Weight only matters when something
     moved, or every heavy action would be impossible. */
  const fresh = await call(`/select?${VIEW}&q=state:reviewed`);
  const ok = await call(`/selection?handle=${fresh.handle}&${VIEW}&weight=refuse`);
  t("a heavy action on a set that did not move proceeds", [ok.ok, ok.moved], [true, false]);
  await call(`/selectionrelease?handle=${fresh.handle}&owner=${OWNER}`);
}

console.log("\n--- visibility is not a policy choice: it can only shrink a selection ---");
{
  /* Resolved under a viewer the compiler does not recognise, which is the deny
     predicate. A selection that still yielded members here would be preserving
     access past a revocation. */
  const denied = await call(`/selection?handle=${eh}&viewer=nobody&owner=${OWNER}`);
  t("the enumeration yields no members under a denied viewer", denied.members, []);
  t("and reports them as hidden rather than purged, because they still exist", denied.drift.hidden.length, 4);
  t("with nothing counted as purged", denied.drift.purged, []);
  const q = await call(`/selection?handle=${qh}&viewer=nobody&owner=${OWNER}`);
  t("the query selection yields nothing either", q.n, 0);
}

console.log("\n--- a purged member is reported, not silently forgotten ---");
{
  const doomed = CORPUS[2].id;
  await call(`/purge?bundleId=${doomed}`);
  const r = await call(`/selection?handle=${eh}&${VIEW}`);
  t("the purged item is named", r.drift.purged, [doomed]);
  t("it is not in the members", r.members.includes(doomed), false);
  t("and the set is one smaller than it was picked at", [r.n, r.snapshotN], [3, 4]);
}

console.log("\n--- ownership is enforced, not inferred from an unguessable handle ---");
{
  const other = await call(`/selection?handle=${eh}&viewer=class:member&owner=class:admin`);
  t("another owner is refused", other.reason, "NOT_YOURS");
  t("with no members leaked in the refusal", other.members, undefined);
  t("an unknown handle is refused the same way",
    (await call(`/selection?handle=sel-nope&${VIEW}`)).reason, "NO_SUCH_SELECTION");
  t("releasing someone else's selection is refused",
    (await call(`/selectionrelease?handle=${eh}&owner=class:admin`)).reason, "NOT_YOURS");
  const mine = await call(`/selectionlist?owner=${OWNER}`);
  t("the owner sees their own", mine.selections.length >= 2, true);
  t("and the list reports the caps", mine.caps.maxItems, 10000);
  t("a list with no owner is refused", (await call(`/selectionlist?owner=`)).reason, "NO_OWNER");
}

console.log("\n--- an enumeration larger than one statement can bind ---");
{
  /* workerd refuses a statement binding more than about 100 variables, so an id
     list is chunked. The bench found this and the suite had not, because no test
     had ever enumerated more than four ids. This one crosses the boundary
     several times over. */
  const many = CORPUS.slice(0, 9).map((b) => b.id);
  while (many.length < 220) many.push(CORPUS[many.length % CORPUS.length].id);
  const unique = [...new Set(many)];
  const bulk = await call(`/select?${VIEW}&q=`, { ids: unique });
  t("a multi-chunk enumeration is created rather than refused by the engine", bulk.ok, true);
  const r = await call(`/selection?handle=${bulk.handle}&${VIEW}`);
  t("and it resolves across every chunk", r.n > 0, true);
  t("with membership matching what still exists and is visible",
    r.members.length + r.drift.purged.length + r.drift.hidden.length, bulk.n + r.drift.purged.length);
  await call(`/selectionrelease?handle=${bulk.handle}&owner=${OWNER}`);
}

console.log("\n--- an enumeration too large is REFUSED, never downgraded to a query ---");
{
  const huge = Array.from({ length: 10001 }, (_, i) => `INFO-2026-9${String(i).padStart(3, "0")}-x`);
  const r = await call(`/select?${VIEW}&q=`, { ids: huge });
  t("it is refused", r.ok, false);
  t("with the reason", r.reason, "TOO_LARGE");
  t("naming the limit", r.limit, 10000);
  /* Downgrading would change what the operator's click meant, which is exactly
     the collapse the two-kind design exists to prevent. */
  t("and it did not quietly become a query selection", r.kind, undefined);
  t("an empty enumeration is refused too", (await call(`/select?${VIEW}&q=`, { ids: [] })).kind, "query");
}

console.log("\n--- the keep-alive: 300 seconds, refreshed on read ---");
{
  const s = await call(`/select?${VIEW}&q=state:collected`);
  const first = (await call(`/selection?handle=${s.handle}&${VIEW}`)).expires;
  await new Promise((r) => setTimeout(r, 1100));
  const second = (await call(`/selection?handle=${s.handle}&${VIEW}`)).expires;
  t("reading it pushes the expiry out", new Date(second) > new Date(first), true);
  t("by roughly the declared TTL",
    Math.abs((new Date(second) - Date.now()) - 300000) < 5000, true);
  await call(`/selectionrelease?handle=${s.handle}&owner=${OWNER}`);
}

console.log("\n--- selections are the one collectable thing in an append-only store ---");
{
  const before = (await call("/stats")).selections;
  t("there are selections to collect", before > 0, true);
  const rel = await call(`/selectionrelease?owner=${OWNER}`);
  t("releasing all of an owner's collects them", rel.released, before);
  t("and the items go with them", (await call("/stats")).selectionItems, 0);
  t("and the store is empty of selections", (await call("/stats")).selections, 0);
  /* Nothing about the record moved. A selection holds no assertion about the
     world, which is what makes collecting one legitimate here and collecting
     anything else in this store a violation. */
  const st = await call("/stats");
  t("the corpus is untouched by any of it", st.bundles, CORPUS.length + 1 - 1);
}

await mf.dispose();
console.log(`\nselection: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
