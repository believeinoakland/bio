/* The two-bucket fence, asserted at the door.
 *
 * The design rule is stated in the control plane's own header: the public token
 * class is "published-scope reads only", and the note on `verify` says it is safe
 * unauthenticated precisely BECAUSE it answers from the published projection,
 * which has never seen unratified material.
 *
 * The fence is what makes the system usable by people investigating an
 * institution. Working material is what a group is looking into before it is
 * ready to say so. A title is not a small leak: "Sewer Service Fund transfer
 * series" discloses the subject, and the state discloses how far along the group
 * is. A public-class reader learning that set learns what is being built against
 * whom, before there is anything to answer.
 *
 * So this suite holds one line: no public-class credential reads working-corpus
 * metadata, by any op. It is separate from the read suites because it is a
 * doctrine boundary rather than a feature, and because the next op that touches
 * the fence should land its assertion here.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: {
    VERSION: "fence-test",
    ADMIN_TOKEN: "BOOT-fence-test-1",
    MEMBER_TOKEN: "mem-fence-test-1",
    PROBE_TOKEN: "prb-fence-test-1",
    PUBLIC_TOKEN: "pub-fence-test-1",
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");
const j = async (p, init) => (await mf.dispatchFetch("http://x" + p, init)).json();
const post = (p, b) => j(p, { method: "POST", body: JSON.stringify(b) });

const PUB = "pub-fence-test-1";
const MEM = "mem-fence-test-1";

/* Seed one bundle whose title is the thing that must not leak. */
await post("/api/?op=claim", { bootstrapToken: "BOOT-fence-test-1", password: "a-long-enough-password" });
const SECRET_TITLE = "Sewer Service Fund transfer series";
const md = `---\nid: INFO-2026-7100-fence\nobject_type: information\ntitle: "${SECRET_TITLE}"\ncurrent_state: collected\nlast_updated: "2026-07-24T00:00:00Z"\ncreated: "2026-07-20T00:00:00Z"\n---\n\n## Summary\n\nUnratified working material.\n`;
await post(`/api/?op=promote&token=${MEM}`, {
  bundleId: "INFO-2026-7100-fence", base: null, snapKey: "20260724T000000Z_fenceseed", author: "seed",
  meta: { object_type: "information", group: "g", title: SECRET_TITLE, current_state: "collected",
          created: "2026-07-20T00:00:00Z", last_updated: "2026-07-24T00:00:00Z" },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
});

console.log("\n--- the working corpus is readable by a member ---");
const memIdx = await j(`/api/?op=index&token=${MEM}`);
t("a member sees the bundle in the index", memIdx.result.bundles.map((b) => b.id), ["INFO-2026-7100-fence"]);
t("and the member sees its title", memIdx.result.bundles[0].title, SECRET_TITLE);

console.log("\n--- and it is not readable by the public class, through any op ---");
/* op=index is the one that carried the hole: it reads the `bundles` table, which
   is working corpus, and it was granted to the public class. */
const pubIdx = await j(`/api/?op=index&token=${PUB}`);
t("op=index refuses a public credential", pubIdx.error, "forbidden for token class");
t("and returns no bundle metadata at all", pubIdx.result, undefined);
t("so the title does not appear anywhere in the response", JSON.stringify(pubIdx).includes("Sewer"), false);

for (const op of ["list", "image", "file", "stats", "dangling", "audit"]) {
  const r = await j(`/api/?op=${op}&token=${PUB}&id=INFO-2026-7100-fence`);
  t(`op=${op} refuses a public credential`, r.error, "forbidden for token class");
}

console.log("\n--- the public class keeps what it is for: the published projection ---");
/* publishedlist IS the public surface, and is correctly granted. The fence claim
   is not that the public class reads nothing, it is that what it reads has been
   ratified. An unratified bundle must be absent from it. */
const pl = await j(`/api/?op=publishedlist&token=${PUB}`);
t("publishedlist answers a public credential", pl.error, undefined);
t("and the unratified bundle is not in it", JSON.stringify(pl).includes("Sewer"), false);
const st = await j(`/api/?op=selftest&token=${PUB}`);
t("selftest still answers a public credential", st.error, undefined);
t("and it reports no bundle titles", JSON.stringify(st).includes("Sewer"), false);

console.log("\n--- an unauthenticated caller gets nothing either ---");
const anon = await j("/api/?op=index");
t("unauthenticated index is refused", anon.error, "unauthenticated");

await mf.dispose();
console.log(`\nfence: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
