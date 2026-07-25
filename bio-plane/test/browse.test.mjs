/* The record browser's contract: a password sign-in yields a session that can
   READ everything and write NOTHING, capture downloads carry a filename, and
   the instance page ships the browsing sections. */
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
  bindings: { VERSION: "browse-test", ADMIN_TOKEN: "BOOT-browse-test-1", MEMBER_TOKEN: "mem-browse-test-1", PROBE_TOKEN: "prb-browse-test-1" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");
const raw = (p, init) => mf.dispatchFetch("http://x" + p, init);
const j = async (p, init) => (await raw(p, init)).json();
const post = (p, b) => j(p, { method: "POST", body: JSON.stringify(b) });

/* Seed: claim the instance, land one bundle with a capture via machine creds. */
await post("/api/?op=claim", { bootstrapToken: "BOOT-browse-test-1", password: "a-long-enough-password" });
const cap = new Uint8Array(256).map((_, i) => i);
const capSha = sha(cap);
await j(`/api/capture?token=mem-browse-test-1&sha256=${capSha}`, { method: "PUT", body: cap });
const md = `---\nid: INFO-2026-7001-x\nobject_type: information\ntitle: "Browse me"\ncurrent_state: verified\nlast_updated: "2026-07-24T00:00:00Z"\ncreated: "2026-07-20T00:00:00Z"\n---\n\n## Summary\n\nHello record.\n`;
await post("/api/?op=promote&token=mem-browse-test-1", {
  bundleId: "INFO-2026-7001-x", base: null, snapKey: "20260724T000000Z_seedseed", author: "seed",
  meta: { object_type: "information", group: "g", title: "Browse me", current_state: "verified", created: "2026-07-20T00:00:00Z", last_updated: "2026-07-24T00:00:00Z" },
  files: [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "snapshots/doc.bin", blobSha: capSha, bytes: cap.length, sha256: capSha },
  ],
  register: [{ path: "snapshots/doc.bin", sha256: capSha, bytes: cap.length, encoding: "binary" }],
});

console.log("\n--- a password sign-in yields a working read session ---");
const login = (await post("/api/?op=login", { role: "admin", password: "a-long-enough-password" })).result;
t("login issues a session token", /^[0-9a-f]{64}$/.test(login.token || ""), true);
const S = login.token;
const list = await j(`/api/?op=list&token=${S}`);
t("the session lists the record", list.result.map((b) => b.bundle_id), ["INFO-2026-7001-x"]);
t("session auth resolves to the signed-in role", list.tokenClass, "admin");
const img = await j(`/api/?op=image&token=${S}&id=INFO-2026-7001-x`);
t("the session reads a full bundle image", typeof img.result["bundle.md"], "string");

console.log("\n--- the session can read captures, with a download name ---");
const dlr = await raw(`/api/?op=capture&token=${S}&sha256=${capSha}&dl=doc.bin`);
t("capture answers a session", dlr.status, 200);
t("the filename travels", dlr.headers.get("content-disposition"), 'attachment; filename="doc.bin"');
t("bytes are exact", sha(Buffer.from(await dlr.arrayBuffer())), capSha);

/* The write arc opened intake to sessions, so the boundary moved rather than
   disappeared: a browser may add to the working record, and may not destroy
   anything or hand itself new powers. The refusals below are the boundary. */
console.log("\n--- a session writes intake and nothing else ---");
t("purge via session is refused, in plain words",
  (await j(`/api/?op=purge&token=${S}&confirm=bio`)).error.includes("machine credential"), true);
t("the live-fire battery is refused",
  (await j(`/api/?op=livefire&token=${S}`)).error.includes("machine credential"), true);
t("nothing was purged", (await j(`/api/?op=stats&token=${S}`)).result.bundles, 1);
t("a session may take a lease, which is intake",
  (await j(`/api/?op=lease&token=${S}&id=INFO-2026-7001-x`)).result.ok, true);

console.log("\n--- garbage and expiry stay outside ---");
t("a made-up 64-hex token is refused", (await j(`/api/?op=list&token=${"a".repeat(64)}`)).error, "unauthenticated");
t("no token is refused", (await j(`/api/?op=list`)).error, "unauthenticated");

console.log("\n--- the page ships the record browser ---");
const page = await (await raw("/")).text();
t("browse section present", page.includes('id="s-browse"'), true);
t("bundle section present", page.includes('id="s-bundle"'), true);
t("the door from the panel exists", page.includes('id="go-browse"'), true);
t("history is explained as append-only", page.includes("append-only"), true);

console.log("\n--- the page ships the intake surface ---");
for (const [what, id] of [["create", "s-new"], ["revise", "s-edit"], ["inbox", "s-inbox"],
                          ["members", "s-members"], ["enrolment", "s-enroll"]])
  t(`the ${what} section is present`, page.includes(`id="${id}"`), true);
t("publishing is presented as needing a signature", page.includes("Paste the signature from the signing page."), true);
t("members can sign in by name", page.includes('id="lwho"'), true);
t("the key box says where a key comes from", page.includes("Where a key comes from"), true);
t("and links to the signing page the instance serves", page.includes('href="/sign"'), true);

console.log("\n--- the served script is real JavaScript that really runs ---");
/* The page is generated from a template that eats backslashes and backticks,
   which once shipped a page whose script died on its first parse. So: the
   script must parse, must execute top to bottom under a stub document, and
   its pure functions must behave, proving the regexes survived generation. */
const scriptSrc = /<script>([\s\S]*)<\/script>/.exec(page)[1];
let parses = true; try { new Function(scriptSrc); } catch { parses = false; }
t("served script parses", parses, true);

const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
  textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
const sandbox = {
  document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el() },
  window: {}, location: { hash: "", pathname: "/" }, history: { replaceState() {} },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true, claimed: false, bootstrapConfigured: true }) }),
  URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array,
};
sandbox.window = sandbox;
let ran = true, hooks = null;
try {
  const fn = new Function(...Object.keys(sandbox),
    scriptSrc + "\n;return { splitFm, mdRender, describeKey };");
  hooks = fn(...Object.values(sandbox));
  await new Promise((r) => setTimeout(r, 10));
} catch (e) { ran = false; console.log("    execution error:", e.message); }
t("served script executes under a stub document", ran, true);
if (hooks) {
  const doc = "---\ntitle: \"A title\"\ncurrent_state: verified\n---\n\n## Heading\n\nBody **bold** and `code`.\n\n- one\n- two\n";
  const { fm, body } = hooks.splitFm(doc);
  t("frontmatter splits (the regex survived generation)", fm.title, "A title");
  const html = hooks.mdRender(body);
  t("headings render", html.includes("<h2>Heading</h2>"), true);
  t("lists render", html.includes("<li>one</li>"), true);
  t("bold and code render", html.includes("<b>bold</b>") && html.includes("<code>code</code>"), true);
  t("html in the record is escaped, never executed", hooks.mdRender("<img src=x>").includes("&lt;img"), true);


/* describeKey reads a pasted public key back to the person in words. It is
   tested through the SERVED script, not the source, because the page is
   generated: an eaten backslash produces valid JavaScript that silently does
   the wrong thing, which is how the 0.3.8 defect shipped. */
{
  const dk = hooks.describeKey;
  t("the served page exposes the key reader", typeof dk, "function");
  const ratify = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKGAY test-ratify";
  t("a ratification key is accepted", dk(ratify).ok, true);
  t("its label is read back", dk(ratify).label, "test-ratify");
  t("spacing does not matter", dk("  ssh-ed25519   AAAAC3Nz   lbl  ").ok, true);
  t("the release key is refused by name", /RELEASE key/.test(dk("ssh-ed25519 AAAAC3Nz bio-release").why || ""), true);
  t("a private key is refused", dk("BIOKEY-RAW1.bio-ratify.abc").ok, false);
  t("prose is refused", dk("here is my key").ok, false);
  t("an empty box is refused", dk("").ok, false);
}}

await mf.dispose();
console.log(`\nbrowse: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
