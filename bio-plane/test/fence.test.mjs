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

console.log("\n--- and it is not readable through op=index, which carried the hole ---");
/* op=index is the one that carried the hole: it reads the `bundles` table, which
   is working corpus, and it was granted to the public class. */
const pubIdx = await j(`/api/?op=index&token=${PUB}`);
t("op=index returns no bundle metadata to it", pubIdx.result, undefined);
t("so the title does not appear anywhere in the response", JSON.stringify(pubIdx).includes("Sewer"), false);

/* A shared credential handed to the public is not a credential: to be public it
   must be widely distributed, and once distributed it bounds nothing. The class
   bought two ops and cost one real defect, because its existence invited
   `op=index` onto its list (D-30). The published surface is protected
   STRUCTURALLY instead, by the unauthenticated ops that read only the published
   projection, which has never held unratified material. Safety comes from WHERE
   an op reads, not from who holds a token.
   PUBLIC_TOKEN is still bound in this suite's env, so these assert the binding
   is INERT: the value is present and authenticates nothing. */
for (const op of ["index", "projection", "list", "image", "file", "stats", "dangling",
                  "audit", "publishedlist", "selftest"]) {
  const r = await j(`/api/?op=${op}&token=${PUB}&id=INFO-2026-7100-fence`);
  t(`op=${op} does not accept a PUBLIC_TOKEN value`, r.error, "unauthenticated");
}

/* The projection carries source.locator, which Bob made searchable. Searchable
   to a MEMBER. It must not become a public list of every source the group has
   touched, so it sits behind the same fence as op=index. */
t("op=projection returns nothing to an unauthenticated caller",
  (await j("/api/?op=projection")).error, "unauthenticated");
const memProj = await j(`/api/?op=projection&token=${MEM}&id=INFO-2026-7100-fence`);
t("but a member reads the projected row", memProj.result.bundle_id, "INFO-2026-7100-fence");

console.log("\n--- the unauthenticated surface still answers, and still leaks nothing ---");
/* verify is the model the retired class should have followed: no credential, and
   safe because it reads only the published projection. An unratified bundle's
   hash is indistinguishable from one that never existed. */
const vf = await j(`/api/?op=verify&sha256=${sha(md)}`);
t("verify answers with no credential at all", vf.ok, true);
t("and reports the unratified bundle as not published", vf.published, false);
t("and names no title", JSON.stringify(vf).includes("Sewer"), false);

console.log("\n--- the unauthenticated surface answers, and says nothing it should not ---");
{
  /* EVERY classes:null op is reached through the control plane and must
     actually WORK there. The burner lookup shipped in 0.21.0 with a
     ReferenceError in this exact branch: its suite drove the Durable Object
     directly and never the control plane, so 1276 assertions passed while the
     deployed op answered a worker exception. Found on the live instance, not
     here, which is why the assertion is here now. */
  const look = await post(`/api/?op=invitelook`, { invite: "0".repeat(32) });
  t("invitelook answers unauthenticated rather than throwing", look.ok, true);
  t("with the uniform miss inside", look.result.reason, "NO_SUCH_INVITATION");
  /* And the invitation ops must reach the store the invitation was CREATED in.
     Pinned to `bio`, an invitation made in `scratch` was unredeemable while
     `memberadd` still answered ok, which is a silent dead end. The token is the
     authority and lives in exactly one store, so naming the store grants a
     caller nothing. Found against the deployed plane, not here. */
  const looks = await post(`/api/?op=invitelook&store=scratch`, { invite: "0".repeat(32) });
  t("invitelook reaches the scratch namespace rather than refusing", looks.ok, true);
  t("and answers with the same uniform miss", looks.result.reason, "NO_SUCH_INVITATION");
  const bad = await post(`/api/?op=invitelook`, { invite: "nope" });
  t("a malformed token gets the same answer", bad.result.reason, "NO_SUCH_INVITATION");
  t("and the two results are byte-identical",
    JSON.stringify(look.result), JSON.stringify(bad.result));
}

console.log("\n--- an unauthenticated caller gets nothing from the working corpus ---");
t("unauthenticated index is refused", (await j("/api/?op=index")).error, "unauthenticated");
t("unauthenticated publishedlist is refused", (await j("/api/?op=publishedlist")).error, "unauthenticated");

/* STRUCTURAL, not a list. Every op naming a class must refuse an unauthenticated
   caller, and the set is read from the module rather than retyped here, so an op
   added later cannot pass this suite by not being mentioned in it. `cite` was
   the op that showed the gap: it is mutating and it reads the working corpus,
   and it would have passed a fixed-list fence suite without a single assertion
   touching it. */
console.log("\n--- and that holds for every guarded op, read from the module ---");
{
  const src = readFileSync(SRC, "utf8");
  const block = src.slice(src.indexOf("const OPS = {"), src.indexOf("\n};", src.indexOf("const OPS = {")));
  const guarded = [...block.matchAll(/^\s*([a-z]+):\s*\{\s*classes:\s*\[/gm)].map((m) => m[1]);
  t("the module actually yielded a set of guarded ops", guarded.length > 20, true);
  t("cite is among them", guarded.includes("cite"), true);
  /* The extraction must DISCRIMINATE, or the loop below is asserting over a set
     that happens to be everything. The classes:null ops are the public surface
     and each enforces its own gate, so none of them may appear here. */
  t("and the unauthenticated surface is excluded",
    ["verify", "bootstrap", "login", "knock", "claim", "enroll"].filter((o) => guarded.includes(o)), []);
  const leaked = [];
  for (const op of guarded) {
    const r = await j(`/api/?op=${op}`);
    if (r.error !== "unauthenticated") leaked.push(`${op}:${r.error ?? "ANSWERED"}`);
  }
  t("no guarded op answers an unauthenticated caller", leaked, []);
}

await mf.dispose();
console.log(`\nfence: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
