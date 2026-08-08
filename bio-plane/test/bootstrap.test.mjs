/* NEGATIVE CONTROL: (run 2026-07-31) disable the bootstrap-credential match in the claim op (guard `body.bootstrapToken !== env.ADMIN_TOKEN` with `false`, accepting any token) -> 2 assertions fail (the wrong-secret refusal path); restored, 18 pass. */
/* NEGATIVE CONTROL for REC-41 IS NOT HERE, DELIBERATELY, and the reason is the one this project keeps re-learning: this suite claims a SINGLE admin, so an anonymous `op=bootstrap` answering an empty roster and one answering no roster at all are indistinguishable here — an outcome that costs nothing to produce is not evidence. The unauthenticated-disclosure sweep and its three controls live in `members.test.mjs`, which is the fixture that actually holds a roster (an `admin` credential plus `member:ruth` and `member:meilan`, three distinct password-set dates). The only REC-41 change in THIS file is the collapsed login reason code, pinned below. */
/* The bootstrap handover: a Worker cannot rotate its own secret, so ADMIN_TOKEN
   is spent once for an operator-chosen password stored in the DO.
   Negative-control detail: disable the bootstrap-credential match in the claim op (guard `body.bootstrapToken !== env.ADMIN_TOKEN` with `false`, accepting any token) -> 2 assertions fail (the wrong-secret refusal path); restored, 18 pass. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { mkdtempSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
/* M0-10/D-235: this was the literal "/tmp/mfp" — one persist root shared by every
   process on the machine, outside the $TMPDIR the import above owns. It had been
   accumulating real Durable Object and R2 SQLite there since 2026-07-31 (12 MB
   when M0-10 found it), and three concurrent runs of this suite were measured
   with two of them killed outright: they open the same SQLite files.

   The PERSISTENCE IS KEPT and is not incidental — it is this suite's subject. A
   Worker cannot rotate its own secret, so the claim must survive an instance
   restart under a DIFFERENT ADMIN_TOKEN, which is exactly what the second `mk()`
   below tests. What changes is only WHOSE ground it persists to: one directory
   per process, inside the sandbox, swept on exit. */
const PERSIST = mkdtempSync(join(tmpdir(), "bootstrap-persist-"));
const mk = (admin) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: admin, PROBE_TOKEN: "prb" },
  defaultPersistRoot: PERSIST,
});
let pass = 0, fail = 0;
const t = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok?"PASS":"FAIL"}  ${l}${ok?"":`  want ${JSON.stringify(w)} got ${JSON.stringify(g)}`}`); ok?pass++:fail++; };

let mf = mk("BOOT-SECRET-ONE");
const j = async (p, init) => (await (await mf.dispatchFetch("http://x" + p, init)).json());
const post = (p, b) => j(p, { method: "POST", body: JSON.stringify(b) });

console.log("\n--- the API answers under /api and the legacy root ---");
t("/api/?op=selftest", (await j("/api/?op=selftest&token=prb")).service, "bio-plane");
t("legacy /?op=selftest", (await j("/?op=selftest&token=prb")).service, "bio-plane");
t("both paths agree on bindings", JSON.stringify((await j("/api/?op=selftest&token=prb")).bindings), JSON.stringify((await j("/?op=selftest&token=prb")).bindings));

console.log("\n--- an unclaimed instance says so, without revealing anything ---");
const b0 = await j("/api/?op=bootstrap");
t("not yet claimed", b0.claimed, false);
t("reports a bootstrap secret exists", b0.bootstrapConfigured, true);
t("leaks no secret", JSON.stringify(b0).includes("BOOT-SECRET-ONE"), false);

console.log("\n--- claiming requires the bootstrap secret ---");
t("wrong secret refused", (await post("/api/?op=claim", { bootstrapToken: "nope", password: "correct-horse-battery" })).error, "bootstrap credential does not match");
t("short password refused", (await post("/api/?op=claim", { bootstrapToken: "BOOT-SECRET-ONE", password: "short" })).result.reason, "PASSWORD_TOO_SHORT");
t("claim succeeds", (await post("/api/?op=claim", { bootstrapToken: "BOOT-SECRET-ONE", password: "correct-horse-battery" })).result.ok, true);
t("now reports claimed", (await j("/api/?op=bootstrap")).claimed, true);

console.log("\n--- a spent bootstrap secret cannot re-claim ---");
t("second claim refused", (await post("/api/?op=claim", { bootstrapToken: "BOOT-SECRET-ONE", password: "another-long-password" })).result.reason, "ALREADY_CLAIMED");

console.log("\n--- login exchanges the password for a session ---");
/* CORRECTED 2026-08-05 (REC-41), NOT EXEMPTED: this pinned `BAD_PASSWORD`.
   op=login's two refusal codes are collapsed into one, because with
   op=bootstrap's roster closed (above) a distinguishable refusal becomes the
   enumeration surface that replaces it. The decision, its evidence and what it
   does NOT claim are recorded at store.mjs `Store.LOGIN_REFUSAL_DETAIL`; the
   four-arm equality and the D-57 wording pins live in members.test.mjs, which
   is the suite with a real roster behind it. */
t("bad password refused", (await post("/api/?op=login", { password: "wrong-but-long-enough" })).result.reason, "SIGN_IN_REFUSED");
const li = await post("/api/?op=login", { password: "correct-horse-battery" });
t("good password issues a token", li.result.ok, true);
t("token is not the password", li.result.token === "correct-horse-battery", false);
t("token is 64 hex chars", /^[0-9a-f]{64}$/.test(li.result.token || ""), true);
await mf.dispose();

console.log("\n--- rotating ADMIN_TOKEN in the dashboard re-arms recovery ---");
mf = mk("BOOT-SECRET-TWO");
const j2 = async (p, init) => (await (await mf.dispatchFetch("http://x" + p, init)).json());
t("a different secret re-arms", (await j2("/api/?op=bootstrap")).claimed, false);
t("and says why", (await j2("/api/?op=bootstrap")).rearmed, true);
t("re-claim works", (await j2("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: "BOOT-SECRET-TWO", password: "recovered-password-ok" }) })).result.ok, true);

console.log(`\n${fail?"FAILED":"OK"}  ${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
