import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
import { createHash } from "node:crypto";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"), modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },

});

const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const md = (state, n) => `---\nid: INFO-2026-0001-x\nobject_type: information\ncurrent_state: ${state}\n---\n\n## Summary\n\nrev ${n}\n`;
const pkg = (state, n, extra = []) => {
  const body = md(state, n);
  return {
    bundleId: "INFO-2026-0001-x", snapKey: "20260723T100000Z_aaaa1111", author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "t", current_state: state, created: "2026-01-01T00:00:00Z", last_updated: "2026-07-23T10:00:00Z" },
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }, ...extra],
    register: [],
  };
};

console.log("\n--- creation and the CAS ladder ---");
const c1 = await call("/promote", { ...pkg("collected", 1), base: null });
t("creation with base null succeeds", c1.result.ok, true);
const sha1 = c1.result.bundleSha;

const c2 = await call("/promote", { ...pkg("collected", 2), base: null });
t("second creation is refused", c2.result.reason, "EXISTS");

const c3 = await call("/promote", { ...pkg("verified", 3), base: sha1 });
t("update with correct base succeeds", c3.result.ok, true);
t("row_version advanced", c3.result.rowVersion, 2);
const sha2 = c3.result.bundleSha;

// THE ASSERTION THE WHOLE PLANE DECISION RESTS ON
const c4 = await call("/promote", { ...pkg("ratified", 4), base: sha1 });
t("update with STALE base is refused", c4.result.reason, "CAS_STALE");
t("stale attempt did not change live state", (await call("/list")).result[0].bundle_sha, sha2);
t("state is the one the winning write set", (await call("/list")).result[0].current_state, "verified");

const c5 = await call("/promote", { ...pkg("ratified", 5), base: "deadbeef" });
t("garbage base is refused", c5.result.reason, "CAS_STALE");

const c6 = await call("/promote", { ...pkg("collected", 6), base: sha2, bundleId: "PROB-2026-9999-absent" });
t("update against an absent bundle is refused", c6.result.reason, "ABSENT");

console.log("\n--- history is append-only ---");
const img = (await call("/image?id=INFO-2026-0001-x")).result;
t("history snapshot present for the superseded rev", "_history/bundle_20260723T100000Z_aaaa1111.md" in img, true);
t("the snapshot key is a filename suffix, not a directory", Object.keys(img).some(k => k.startsWith("_history/20260723T100000Z")), false);
t("the verbatim promotion record is projected", "_history/promotion_20260723T100000Z_aaaa1111.json" in img, true);
t("manifest projected into the image", "_history/manifest.json" in img, true);
t("live bundle.md is the winning revision", /rev 3/.test(img["bundle.md"]), true);
t("history holds the prior revision, not the stale one", /rev 1/.test(img["_history/bundle_20260723T100000Z_aaaa1111.md"]), true);
{
  const rec = JSON.parse(img["_history/promotion_20260723T100000Z_aaaa1111.json"]);
  t("the promotion record names its target", rec.target, "INFO-2026-0001-x");
  t("and carries a per-file sha256 the hash chain can be rebuilt from",
    typeof (rec.files.find(f => f.name === "bundle.md") || {}).sha256, "string");
  const man = JSON.parse(img["_history/manifest.json"]);
  t("manifest entries use the catalog's kind vocabulary", man.entries[0].kind, "promotion");
  t("and record what was snapshotted", man.entries[0].snapshotted.includes("bundle.md"), true);
}

console.log("\n--- the Drive defect classes, now structurally impossible ---");
const dup = await call("/promote", { ...pkg("collected", 7), base: null });
t("concurrent creation cannot fork the bundle", dup.result.reason, "EXISTS");
t("exactly one bundle row exists", (await call("/list")).result.length, 1);
const big = "x".repeat(1024 * 1024 + 1);
const over = await call("/promote", { ...pkg("verified", 8), base: sha2, files: [...pkg("verified", 8).files, { path: "big.md", text: big, bytes: big.length, sha256: sha(big) }] });
t("oversize inline is refused at the write, not at SQLite", over.result.reason, "OVERSIZE_INLINE");

console.log("\n--- coordination ---");
t("allocid is serial and gapless (1)", (await call("/allocid?prefix=INFO&year=2026")).result.id, "INFO-2026-0001");
t("allocid is serial and gapless (2)", (await call("/allocid?prefix=INFO&year=2026")).result.id, "INFO-2026-0002");
t("allocid namespaces by prefix", (await call("/allocid?prefix=PROB&year=2026")).result.id, "PROB-2026-0001");
const l1 = await call("/lease?id=INFO-2026-0001-x&actor=alice");
t("lease returns the live sha as the edit base", l1.result.base, sha2);
const l2 = await call("/lease?id=INFO-2026-0001-x&actor=bob");
t("second actor is denied while the lease holds", l2.result.ok, false);
t("denial names the holder", l2.result.heldBy, "alice");

console.log("\n--- index projection ---");
const idx = (await call("/index")).result;
t("index carries no substrate locator", Object.keys(idx.bundles[0]).includes("locator"), false);
t("index carries the C-13 diff key", "sha256" in idx.bundles[0], true);


console.log("\n--- a promotion cannot silently delete files ---");
{
  /* This trap cost twice before it was closed: the monitor's first tick removed
     the provenance register of every bundle it touched, and the browser's revise
     path did the same for anyone editing a captured document. Both were the
     default behaviour of a caller doing the obvious thing. */
  const DID = "INFO-2026-0003-two-files";
  const body = pkg("collected", 1).files[0].text;
  const extra = JSON.stringify({ note: "beside the record" }, null, 1);
  const two = { ...pkg("collected", 1), bundleId: DID, base: null,
    snapKey: "20260723T120000Z_dddd1111",
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) },
            { path: "data/extra.json", text: extra, bytes: extra.length, sha256: sha(extra) }] };
  const a = await call("/promote", two);
  t("a bundle with two files is created", a.result.ok, true);

  const onlyMd = { ...two, base: a.result.bundleSha, snapKey: "20260723T130000Z_dddd2222",
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }] };
  const dropped = await call("/promote", onlyMd);
  t("mentioning one file is refused, not obeyed", dropped.result.reason, "FILES_DROPPED");
  t("and the refusal names what would have gone", dropped.result.paths, ["data/extra.json"]);
  t("nothing was removed", Object.keys((await call("/image?id=" + DID)).result).includes("data/extra.json"), true);

  const declared = await call("/promote", { ...onlyMd, drop: ["data/extra.json"] });
  t("naming it deletes it on purpose", declared.result.ok, true);
  t("and then it really is gone",
    Object.keys((await call("/image?id=" + DID)).result).includes("data/extra.json"), false);
}

console.log(`\n${fail ? "FAILED" : "OK"}  ${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
