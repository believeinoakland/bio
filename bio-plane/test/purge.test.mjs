/* NEGATIVE CONTROL: (run 2026-07-31) disable the confirm-target gate in the purge op (guard `confirm !== storeName` with `false`, so a purge with no/other confirm is not refused) -> 3 assertions fail (the unconfirmed-target and wrong-confirm refusals); restored, 14 pass. */
/* Purge, both layers. The store layer does the deletion; the control plane
   decides who may ask and refuses an unconfirmed target. Credential-free.
   Negative-control detail: disable the confirm-target gate in the purge op (guard `confirm !== storeName` with `false`, so a purge with no/other confirm is not refused) -> 3 assertions fail (the unconfirmed-target and wrong-confirm refusals); restored, 14 pass. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm", MEMBER_TOKEN: "mem", PROBE_TOKEN: "prb" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const j = async (q, init) => (await (await mf.dispatchFetch("http://x/?" + q, init)).json());

const md = (id) => `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nx\n`;
const pkg = (id) => {
  const b = md(id);
  return { bundleId: id, snapKey: "20260723T100000Z_aaaa1111", author: "t",
    meta: { object_type: "information", group: "believe-in-oakland", title: "t",
            current_state: "collected", created: "2026-01-01T00:00:00Z", last_updated: "2026-07-23T10:00:00Z" },
    files: [{ path: "bundle.md", text: b, bytes: b.length, sha256: sha(b) }],
    register: [], base: null };
};
const post = (q, body) => j(q, { method: "POST", body: JSON.stringify(body) });

console.log("\n--- the control plane decides who may ask ---");
t("member is refused", (await j("op=purge&token=mem&confirm=bio")).error, "forbidden for token class");
t("public token is unauthenticated", (await j("op=purge&token=nope&confirm=bio")).error, "unauthenticated");

console.log("\n--- an unconfirmed target is refused, not guessed ---");
t("no confirm refused", (await j("op=purge&token=adm")).error, "purge requires confirm=<store>");
t("wrong confirm refused", (await j("op=purge&token=adm&confirm=scratch")).error, "purge requires confirm=<store>");
t("refusal names the resolved store", (await j("op=purge&token=adm&confirm=scratch")).expected, "bio");

console.log("\n--- probe cannot purge the live store ---");
const pr = await j("op=purge&token=prb&store=bio&confirm=bio");
t("probe naming bio is confined", /confined to the scratch namespace/.test(pr.error || ""), true);

console.log("\n--- single bundle purge takes the whole lineage ---");
await post("op=promote&token=adm", pkg("INFO-2026-0001-x"));
await post("op=promote&token=adm", pkg("INFO-2026-0002-x"));
const s0 = (await j("op=stats&token=adm")).result;
t("two bundles present", s0.bundles, 2);
const p1 = (await j("op=purge&token=adm&confirm=bio&bundleId=INFO-2026-0001-x")).result;
t("one bundle removed", p1.removed.bundles, 1);
t("its file went with it", p1.removed.files, 1);
t("scope is named in the result", p1.scope, "INFO-2026-0001-x");
t("the other bundle survived", (await j("op=stats&token=adm")).result.bundles, 1);

console.log("\n--- allocid does not reissue across a purge ---");
const a1 = (await j("op=allocid&token=adm&prefix=INFO&year=2026")).result;
const p2 = (await j("op=purge&token=adm&confirm=bio")).result;
t("whole store cleared", p2.after.bundles, 0);
const a2 = (await j("op=allocid&token=adm&prefix=INFO&year=2026")).result;
t("counter kept climbing", JSON.stringify(a2) !== JSON.stringify(a1), true);

console.log("\n--- the store still works after a purge ---");
const re = await post("op=promote&token=adm", pkg("INFO-2026-0009-x"));
t("promote succeeds on a purged store", re.result.ok, true);

console.log(`\n${fail ? "FAILED" : "OK"}  ${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
