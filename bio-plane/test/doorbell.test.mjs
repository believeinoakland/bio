/* NEGATIVE CONTROL: (run 2026-07-31) disable the per-IP knock rate limit in the store (guard `cnt(ipBucket) >= perIpLimit` with `false`) so one source is never throttled -> 3 assertions fail (the 13th knock refused RATE_IP, and the 429 status); restored, 36 pass. */
/* The doorbell: the one door open to the public.
 *
 * Two halves. verify answers a hash question from the published
 * projection and nothing else. knock accepts material from a stranger
 * into quarantine. The suite's real subject is the blast radius: an
 * anonymous caller must be able to reach the inbox and nothing beyond
 * it, must not be able to read anything back, and must not be able to
 * fill the store faster than the rate limits allow.
 *
 * Negative-control detail: disable the per-IP knock rate limit in the store (guard `cnt(ipBucket) >= perIpLimit` with `false`) so one source is never throttled -> 3 assertions fail (the 13th knock refused RATE_IP, and the 429 status); restored, 36 pass.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const withR2 = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-door", MEMBER_TOKEN: "mem-door", PROBE_TOKEN: "prb-door", VERSION: "test" },
});
/* An instance with no card on file: same doorbell, smaller cap. */
const noR2 = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-door", MEMBER_TOKEN: "mem-door", PROBE_TOKEN: "prb-door", VERSION: "test" },
});

const sha = (b) => createHash("sha256").update(b).digest("hex");
const b64 = (u8) => Buffer.from(u8).toString("base64");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const call = (mfi) => ({
  GET: async (q) => (await mfi.dispatchFetch("http://x/api/?" + q)).json(),
  POST: async (q, body, ip) => (await mfi.dispatchFetch("http://x/api/?" + q, {
    method: "POST", body: typeof body === "string" ? body : JSON.stringify(body),
    headers: ip ? { "cf-connecting-ip": ip } : {},
  })).json(),
  RAW: async (q, body, ip) => mfi.dispatchFetch("http://x/api/?" + q, {
    method: "POST", body: typeof body === "string" ? body : JSON.stringify(body),
    headers: ip ? { "cf-connecting-ip": ip } : {},
  }),
});
const A = call(withR2), B = call(noR2);

console.log("\n--- the doorbell needs no credential ---");
const tip = { contentText: "The sewer fund transfers continued into FY24.", note: "council packet page 61", contact: "anon@proton.me" };
const k1 = await A.POST("op=knock", tip, "203.0.113.10");
t("a stranger can knock", k1.ok, true);
t("the receipt names the hash they left", k1.sha256, sha(tip.contentText));
t("the receipt is in plain words", /inbox awaiting member review/.test(k1.received), true);
t("a knock id comes back", /^KNOCK-\d{4}-\d{2}-\d{2}-/.test(k1.knockId), true);

console.log("\n--- what the doorbell refuses ---");
t("GET is not a knock", (await A.GET("op=knock")).error, "knock is a POST");
t("empty knock refused", (await A.POST("op=knock", { contentText: "" }, "203.0.113.11")).reason, "EMPTY");
t("bodyless knock refused", (await A.POST("op=knock", { note: "hi" }, "203.0.113.11")).error,
  "knock requires contentB64 or contentText, plus optional note and contact");
t("non-base64 refused", (await A.POST("op=knock", { contentB64: "!!!!not base64!!!!" }, "203.0.113.11")).error,
  "contentB64 is not valid base64");

console.log("\n--- size caps differ by what the instance can store ---");
const big = new Uint8Array(200_000).map((_, i) => i % 256);
t("R2 instance accepts a 200KB attachment", (await A.POST("op=knock", { contentB64: b64(big) }, "203.0.113.12")).ok, true);
const small = await B.POST("op=knock", { contentB64: b64(big) }, "203.0.113.12");
t("inline instance refuses it", small.reason, "TOO_LARGE");
t("and explains what is missing", /evidence storage configured/.test(small.detail), true);
t("inline instance still takes a note-sized knock", (await B.POST("op=knock", { contentText: "short tip" }, "203.0.113.12")).ok, true);
t("oversize body is rejected before it is parsed",
  (await A.RAW("op=knock", "x".repeat(8 * 1024 * 1024 + 8192), "203.0.113.13")).status, 413);

console.log("\n--- rate limits bound the damage ---");
const flood = [];
for (let i = 0; i < 14; i++) flood.push(await A.POST("op=knock", { contentText: "flood " + i }, "198.51.100.7"));
const accepted = flood.filter((r) => r.ok).length;
t("one source gets twelve and no more", accepted, 12);
t("the thirteenth is refused by name", flood[12].reason, "RATE_IP");
t("a different source is unaffected", (await A.POST("op=knock", { contentText: "unrelated" }, "198.51.100.8")).ok, true);
t("refusal is a 429, not a 500", (await A.RAW("op=knock", { contentText: "one more" }, "198.51.100.7")).status, 429);

console.log("\n--- nothing comes back out without a member ---");
t("inbox is not public", (await A.GET("op=inbox")).error, "unauthenticated");
t("a single knock is not public", (await A.GET(`op=inboxget&id=${k1.knockId}`)).error, "unauthenticated");
t("resolving is not public", (await A.POST("op=inboxresolve", { knockId: k1.knockId, status: "pulled" })).error, "unauthenticated");

console.log("\n--- members review the inbox ---");
const list = (await A.GET("op=inbox&token=mem-door")).result.inbox;
t("the first knock is listed", list.some((r) => r.knock_id === k1.knockId), true);
t("it arrives quarantined", list.find((r) => r.knock_id === k1.knockId).status, "new");
t("the note came through", list.find((r) => r.knock_id === k1.knockId).note, "council packet page 61");
t("the contact came through", list.find((r) => r.knock_id === k1.knockId).contact, "anon@proton.me");
const got = (await A.GET(`op=inboxget&token=mem-door&id=${k1.knockId}`)).result;
t("a member can read one knock", got.ok, true);
t("bytes over the R2 line are not inlined", got.item.in_r2, 1);
t("unknown knock id says so", (await A.GET("op=inboxget&token=mem-door&id=KNOCK-nope")).result.reason, "NOT_FOUND");

const res = await A.POST("op=inboxresolve&token=mem-door", { knockId: k1.knockId, status: "pulled" });
t("a member can disposition it", res.result.status, "pulled");
t("who dispositioned it is recorded",
  (await A.GET("op=inbox&token=mem-door")).result.inbox.find((r) => r.knock_id === k1.knockId).resolved_by, "token:member");
t("filtering by status works", (await A.GET("op=inbox&token=mem-door&status=pulled")).result.inbox.length, 1);
t("invented statuses refused", (await A.POST("op=inboxresolve&token=mem-door", { knockId: k1.knockId, status: "ratified" })).result.reason, "BAD_STATUS");
t("discarding is a disposition, not a delete",
  (await A.POST("op=inboxresolve&token=mem-door", { knockId: k1.knockId, status: "discarded" })).result.status, "discarded");

console.log("\n--- the fence holds around the doorbell ---");
t("knocked material is not published", (await A.GET(`op=verify&sha256=${k1.sha256}`)).published, false);
t("verify refuses a malformed hash", (await A.GET("op=verify&sha256=NOTAHASH")).error, "verify requires sha256=<64 lowercase hex>");
t("verify on an unknown hash is a clean no", (await A.GET(`op=verify&sha256=${"a".repeat(64)}`)).published, false);
t("the published list is not a public read", (await A.GET("op=publishedlist")).error, "unauthenticated");

await withR2.dispose(); await noR2.dispose();
console.log(`\ndoorbell: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
