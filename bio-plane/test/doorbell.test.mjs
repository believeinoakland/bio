/* NEGATIVE CONTROL (D-508, 2026-09-24): `node test/nc-d508.mjs` — SIX arms, each ALONE with the others held
   open, run against TWO instruments per arm (the DEC-49 guard `civicos-ui/check-refusal-codes.mjs --strict`
   and this suite, driven end to end through `op=knock`). Both baselines GREEN (guard exit 0 / 0 fails; suite
   57 pass, 0 fail, foot reached) and ALL SIX CAME BACK AS DECLARED on both instruments. Every restore verified
   by sha256 AND byte-for-byte against a uniquely-named per-arm pristine copy, with the byte count printed and
   a 6000-byte floor guarded (store.mjs 3,224,664 B; index.mjs 802,836 B; bio-checks.mjs 930,833 B).
     both-off      THE FALSIFIABILITY ARM and the one to read first -> suite 53/4: exactly the four
                   `per-source:` arms, with the four `instance-wide:` arms STANDING. It exists because of what
                   the two arms below measured.
     bare-reason   (src/store.mjs) mint the per-source refusal as the BARE STORE REASON this item removed ->
                   suite 57/0, FULLY GREEN. THAT GREEN IS A FINDING, not the arm working: `src/index.mjs`
                   already carries a GENERIC DEC-49 DECORATOR (`dec49Decorate`) that looks a refusal's `reason`
                   up across every `*_CHECKS` family by the reserved suffix and fills in `code`, `check` and
                   `translation`. So the catalogue rows ALONE put the sentence on the wire. The GUARD fails —
                   on the `outcomeReturns` FLOOR, and NOT as a codeless refusal, because arm C reads a `reason:`
                   literal as the code and `RATE_IP` has a row. "The guard goes red" and "the guard names it"
                   are two claims and the driver prints both flags.
     decorator-off (src/index.mjs) disable that decorator -> suite 57/0, guard green. The mirror image: with the
                   decorator gone the region still carries the paper. TWO INDEPENDENT MECHANISMS DELIVER THIS
                   SENTENCE, so no single behavioural arm can see either — the behaviourally-invisible-revert
                   class (kickoffs/WORKER.md), and only `both-off` and the structural pin below can see it.
     markers-off   (src/store.mjs) move the region's END marker above the two returns, leaving a well-formed,
                   non-trivial, correctly nested span with no refusal in it -> SUITE FULLY GREEN and the GUARD
                   fails FIVE ways, naming the region by name and its four region floors. That is the arm that
                   says a `where` which has drifted off its refusal is invisible to every behavioural assertion
                   in this repository.
     blank-translation (checks/bio-checks.mjs) empty RATE_GLOBAL's sentence -> guard fails BY NAME
                   ("KNOCK_CHECKS.RATE_GLOBAL has NO CANNED TRANSLATION"); suite 51/6, the two arms that name
                   the instance-wide refusal plus the four `instance-wide:` arms, the four `per-source:` arms
                   standing. It stops the catalogue comparison passing for free over two empty strings.
     overstrict    (src/store.mjs) the same mint in a spelling nobody anticipated — extra whitespace inside the
                   call, on ONE line -> guard green, suite 57/0. A first draft spread it over three lines and
                   the guard failed on the `regionLines` floor: THE GUARD WAS RIGHT AND THE ARM WAS WRONG, and
                   the arm was corrected rather than the floor loosened.
   AND ONE ARM OF THE FIRST DRAFT DID NOT ARM: `blank-translation` first replaced only the translation's FIRST
   concatenated line, leaving the remaining `+ '…'` continuations, so the sentence was never blank and the
   suite was green for the honest reason. An arm that did not arm is a finding; it is recorded here and the
   anchor now takes the whole value. A second non-arming was the same class one layer down — the subjects are
   read LATIN1 (byte-exact, CLAUDE.md §7) and the anchor's em dashes had to be encoded to match at all. */
/* NEGATIVE CONTROL: (RE-RUN WHOLE AGAIN 2026-09-24 by D-508, because this item changed BOTH the suite these
   arms are measured against AND the `limiter-off` arm's own anchor — and a control whose figures were taken
   against a different suite is a claim about that day, which is this driver's own sentence.) `node
   test/nc-d487.mjs` — SIX arms, each ALONE, no sleep and no bet on the hour; both baselines 57 pass, 0 fail
   (open 34331ms, close 33810ms); EVERY ARM CAME BACK AS DECLARED and every restore verified by sha256 AND
   byte-for-byte against a per-arm pristine copy (store.mjs 3,224,664 bytes, this suite 31,261).
     D-508's FIGURES: limiter-off 47/10 (the six it always took down plus the four `per-source:` arms, the
     instance-wide four STANDING); fixed-bucket 43/14 (its six plus all eight paper arms, both bursts
     re-admitted); straddle 53/4, unchanged in shape and membership; the three over-strictness arms 57/0.
     `limiter-off`'s ANCHOR WAS RE-POINTED, not retired: the refusal is now minted through the region's
     `refusal` helper, so D-496's spelling occurs ZERO times and the arm would have printed "ANCHOR OCCURS 0
     TIMES — ARM DID NOT ARM". D-508's own subject has its own driver, `test/nc-d508.mjs`, recorded above.
   PRIOR (2026-09-24, D-496): both baselines 48 pass, 0 fail (open 25499ms, close 24715ms); EVERY ARM CAME
   BACK AS DECLARED, store.mjs 3166944 bytes, this suite 22654.
     fixed-bucket (D-496's SUBJECT, src/store.mjs) drop the previous bucket's weighted carry —
                  `const est = (cur, prev) => cnt(cur);`, the code as it stood before D-496 — so the count
                  restarts at the edge -> 42 pass, 6 fail: the straddling burst is re-admitted at fourteen
                  and the instance-wide one at 451, both per-source and instance-wide, with their two
                  refusal arms and their two published-sentence arms. The over-strictness arm and all ten
                  other rate arms STAND, which is what says this measures the window and not the limiter.
     limiter-off  (src/store.mjs) THE 2026-07-31 CONTROL, RE-ANCHORED by D-496 because the guard now reads
                  the estimate: `if (false) return { ok: false, reason: "RATE_IP" };` so one source is never
                  throttled -> 42 pass, 6 fail. It takes down the three per-source arms it always did plus
                  D-496's three per-source straddle arms; the instance-wide arms stand, which is the pair
                  this control separates.
     straddle     (D-487's SUBJECT) remove the edge guard, `EDGE_GUARD = false`, so the pinned clock steps
                  a bucket MID-FLOOD -> 44 pass, 4 fail. It took down THREE before D-496 and takes down a
                  FOURTH now — "a source served again a window on is carrying a decayed count, not a wiped
                  one" — and that fourth is a finding about the SUBJECT: the limiter now sees the straddle
                  it used to be blind to, so the six behind the edge still weigh three and the source is
                  refused where it used to be served from zero.
     edge-minus-1 / edge-exact / edge-plus-1  OVER-STRICTNESS: pin the run 1 ms BEFORE a bucket edge,
                  exactly ON one, and 1 ms after -> 48 pass, 0 fail in all three. That is D-487's row's
                  accepts-when, and it CAUGHT A REAL DEFECT IN D-496's first draft: an arm stepping to
                  `PIN + KNOCK_WINDOW_MS` had a verdict that depended on where inside its bucket PIN sat,
                  which is D-487's own defect re-entering through the fix for it. See NEXT_MID below. */
/* The doorbell: the one door open to the public.
 *
 * Two halves. verify answers a hash question from the published
 * projection and nothing else. knock accepts material from a stranger
 * into quarantine. The suite's real subject is the blast radius: an
 * anonymous caller must be able to reach the inbox and nothing beyond
 * it, must not be able to read anything back, and must not be able to
 * fill the store faster than the rate limits allow.
 *
 * Negative-control detail: every arm, what it must take down and what it must leave standing, is DECLARED
 * in `test/nc-d487.mjs` and the driver prints the actual set beside the declared one, so the two can be
 * compared without anyone remembering. The figures are on the NEGATIVE CONTROL line above.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
/* D-508: the doorbell's own DEC-49 family, read here so the arms below can ask whether the
   plane served the CATALOGUE's sentence rather than a second copy of it. */
import { KNOCK_CHECKS } from "../checks/bio-checks.mjs";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC_TEXT = readFileSync(SRC, "utf8");

const withR2 = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: SRC_TEXT,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-door", MEMBER_TOKEN: "mem-door", PROBE_TOKEN: "prb-door", VERSION: "test" },
});
/* An instance with no card on file: same doorbell, smaller cap. */
const noR2 = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: SRC_TEXT,
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

/* ---- D-508: THE RATE REFUSAL CARRIES ITS DEC-49 CODE AND ITS TRANSLATION ----
 *
 * THE ROW'S ACCEPTS-WHEN, and it is asked ON THE WIRE at both rate refusals
 * rather than at the store, because a store-level test is not evidence a caller
 * can reach the feature (CLAUDE.md §5; `op=invitelook` shipped with a
 * ReferenceError while 1,276 assertions passed). The knock is the ONE door open
 * to the public, so the caller this is asserted for is a stranger with no
 * account and no other way to find out what happened.
 *
 * FOUR ASSERTIONS PER CODE, AND EACH ANSWERS A DIFFERENT WAY OF BEING WRONG:
 *   `code` and `check` are LITERALS here — a fence taken from its subject is a
 *   fence the subject can widen (D-487's line, which governs this as it governs
 *   the published bound below), so a renumbered check must come and edit this
 *   suite.
 *   The translation is asserted BOTH against a floor on its length AND against
 *   `KNOCK_CHECKS`' own row. The second is the one that catches an INLINE COPY:
 *   the wire value is composed inside a Miniflare isolate from `src/`, this
 *   comparison reads the catalogue directly, and they agree only if the plane
 *   served the catalogue's sentence rather than a second copy of it — which is
 *   the drift every DEC-49 header in `bio-checks.mjs` defends against. The
 *   length floor is what stops that comparison from passing for free over a row
 *   somebody blanked: two empty strings agree on nothing (CLAUDE.md §5).
 *
 * WHAT THIS CANNOT SEE: whether the sentence is a GOOD one. That is not a thing
 * a suite can judge, and the DEC-49 guard's totality arms are what establish
 * that every code has one at all. */
const ratePaper = (label, r, code, check) => {
  const row = KNOCK_CHECKS[code];
  t(`${label}: the refusal carries its DEC-49 code`, r?.code, code);
  t(`${label}: it names the check the code belongs to`, r?.check, check);
  t(`${label}: the canned translation is a real sentence, not an empty string`,
    typeof r?.translation === "string" && r.translation.length >= 120, true);
  t(`${label}: and it is the CATALOGUE's sentence, not an inline copy in the plane`,
    r?.translation, row.translation);
};

/* ---- D-487: THE RATE ARMS RUN ON A PINNED CLOCK ---------------------------
 *
 * The plane bins knocks into fixed ten-minute buckets — `win = floor(Date.now()
 * / KNOCK.windowMs)` in `src/index.mjs`, and the per-source count is a row
 * NAMED for that bucket. So a flood of fourteen that STRADDLES a bucket edge is
 * counted twice from zero, every knock is accepted, and the limiter is behaving
 * correctly while this suite goes red. Before this the arms below were a bet on
 * the wall clock, and the stake is a full gate round.
 *
 * THE FIX IS NOT A WIDER TOLERANCE. A suite that accepts twelve OR fourteen has
 * stopped measuring the limiter, and widening the limit is the first thing a
 * false green would do. The fix is that the window CANNOT ROLL: these arms run
 * against an isolate whose `Date.now()` is PINNED, so the whole flood lands in
 * one bucket by construction, at every hour of the day. That is the store's own
 * `nowMs = Date.now()` injection idiom applied one layer out, because the
 * doorbell's window is computed in the worker with no seam to inject and this
 * row does not change the limiter.
 *
 * WHAT THE PIN CAN AND CANNOT SEE, measured rather than assumed. It replaces
 * `Date.now`, which is what `win` reads. It does NOT move `new Date()` — V8
 * takes the host clock there — so this instance's knock ids and `received`
 * stamps are the real ones and nothing that parses them is skewed. The pin sits
 * in the middle of the CURRENT real window, so any code comparing a pinned
 * `Date.now()` against a real timestamp is at most five minutes out, never
 * months; a fixed epoch would have been more deterministic and less honest.
 *
 * ONE ISOLATE, so every arm still drives the op end to end. The clock moves by
 * `setOptions`, which reloads the worker and KEEPS the Durable Object's state
 * (measured on this suite: the inbox still held all fourteen rows after a
 * reload). Nothing under `src/` is edited and no test-only knob is added to the
 * plane — the injection is one line PREPENDED to the script this suite already
 * hands Miniflare. */
const KNOCK_WINDOW_MS = 10 * 60 * 1000;
const PIN = Math.floor(Date.now() / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + KNOCK_WINDOW_MS / 2;
const pinnedOpts = (at) => ({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: `Date.now = () => ${at};\n` + SRC_TEXT,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-door", MEMBER_TOKEN: "mem-door", PROBE_TOKEN: "prb-door", VERSION: "test" },
});
const pinnedMf = new Miniflare(pinnedOpts(PIN));
const C = call(pinnedMf);

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
/* D-487: the window read off the PLANE's own source, so raising KNOCK.windowMs
   cannot leave this suite pinning a bucket the plane no longer bins into. It
   fails here, by name, instead of passing over a pin that means nothing. The
   per-source LIMIT is deliberately NOT read that way and stays the literal 12
   below: a limit taken from the subject is a limit the subject can widen. */
const winLit = /windowMs:\s*([0-9*\s]+?),/.exec(SRC_TEXT);
t("the pin uses the plane's own knock window",
  winLit ? winLit[1].split("*").map(Number).reduce((a, b) => a * b, 1) : null, KNOCK_WINDOW_MS);

/* D-487's EDGE GUARD. It is one flag because the negative control has to be
   able to take it away DETERMINISTICALLY: with the guard the whole flood runs
   at one pinned instant; without it the clock steps to the next bucket
   mid-flood, which is precisely the straddle the wall clock used to hand this
   suite at random. `node test/nc-d487.mjs` flips it and names what must fail. */
const EDGE_GUARD = true;
const pinFor = (i) => (EDGE_GUARD ? PIN : PIN + (i < 6 ? 0 : KNOCK_WINDOW_MS));
const flood = [];
let clockAt = PIN;
for (let i = 0; i < 14; i++) {
  if (pinFor(i) !== clockAt) { clockAt = pinFor(i); await pinnedMf.setOptions(pinnedOpts(clockAt)); }
  flood.push(await C.POST("op=knock", { contentText: "flood " + i }, "198.51.100.7"));
}
const accepted = flood.filter((r) => r.ok).length;
t("one source gets twelve and no more", accepted, 12);
t("the thirteenth is refused by name", flood[12].reason, "RATE_IP");
t("a different source is unaffected", (await C.POST("op=knock", { contentText: "unrelated" }, "198.51.100.8")).ok, true);
t("refusal is a 429, not a 500", (await C.RAW("op=knock", { contentText: "one more" }, "198.51.100.7")).status, 429);
/* THE ARM THAT PROVES THE PIN ARMED, and an arm that did not arm is a finding:
   a frozen clock nothing read would leave every assertion above green for the
   ordinary reason, and this suite would be back to betting on the hour without
   anyone able to tell. Step the pinned clock one bucket on and the source
   refused a line ago is served — the count is bound to the WINDOW, which is the
   whole reason the flood above is held inside one. */
/* D-496: the step is to the MIDDLE of the next bucket, computed from the bucket
   rather than from PIN + one window. Under the fixed bucket the two were the
   same thing; under the sliding window they are not, and `PIN + W` would have
   made this arm's verdict depend on where inside its bucket PIN happened to sit
   — at a PIN pinned exactly ON an edge the previous bucket weighs 1.0, the
   twelve behind it weigh twelve, and the correct answer flips to refused. That
   is D-487's own defect (a rate arm betting on the clock) re-entering through
   the fix for it, and it was caught by D-487's three over-strictness arms before
   it could be believed. Half a window on, the weight is 0.5 at every pin. */
const NEXT_MID = Math.floor(PIN / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + KNOCK_WINDOW_MS * 1.5;
await pinnedMf.setOptions(pinnedOpts(NEXT_MID));
/* D-496 CORRECTED THIS ARM'S NAME RATHER THAN EXEMPTING IT, and the old name was
   describing the defect. Under the fixed bucket the next window really did start
   a new count FROM ZERO, which is exactly what let a caller take the limit twice
   inside one ten-minute span. Under the sliding window the count CARRIES, decayed
   by how far into the new bucket we are: this pin sits half a window on, so the
   twelve behind it weigh six, and the source is served because six is under the
   limit and not because the record was wiped. The assertion is unchanged — it is
   still "the source is served" — and what moved is the reason, which is the thing
   a reader of this suite has to have right. */
t("a source served again a window on is carrying a decayed count, not a wiped one",
  (await C.POST("op=knock", { contentText: "next window" }, "198.51.100.7")).ok, true);

/* ---- D-496: THE PUBLISHED LIMIT IS A BOUND -------------------------------
 *
 * The arms above hold the limiter INSIDE one bucket. They cannot see the defect
 * this section is for, and neither could the wall clock: `win = floor(now/W)`
 * names a bucket and the count is a row named for it, so a caller who sends the
 * limit in the last millisecond of one bucket and the limit again in the first
 * millisecond of the next takes TWENTY-FOUR knocks inside two milliseconds while
 * every count stays under twelve. Nothing was broken and the record's claim was
 * false — BOB #32's ruling of 2026-09-24 04:28Z is that a published limit is a
 * BOUND, so the code holds it or the text stops claiming it.
 *
 * These arms drive the straddle DELIBERATELY, on D-487's pinned clock, at a
 * bucket edge this file computes rather than waits for. A sleep would be a bet
 * and a ten-minute one at that.
 *
 * WHAT THE PINS ARE, and why EDGE exactly rather than EDGE + 1. The estimate is
 * `prev x (1 - elapsed/W) + cur`, so one millisecond past the edge the previous
 * bucket is weighted 0.9999983 and seven knocks behind the line weigh 6.999988 —
 * which admits one more knock than the stated twelve. That is the estimator
 * being approximate, not the limiter failing, and it is why the published
 * sentence says "estimated by a sliding window". Pinning at the edge exactly
 * makes the weight 1 and the arithmetic exact, so this arm measures the WINDOW
 * rather than a rounding; the approximation is stated in words instead of being
 * hidden inside a tolerance, because a suite that accepts twelve OR thirteen has
 * stopped measuring the limiter (D-487's line, and it holds here). */
const EDGE = Math.floor(PIN / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + KNOCK_WINDOW_MS;
/* No R2 and tiny bodies: the instance-wide arm below drives 301 knocks through
   the op and an R2 put on each is a cost that buys this arm nothing. The knock
   path is the same one either way — the size caps above are what differ, and
   they are measured on their own instances. */
const slideOpts = (at) => ({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: `Date.now = () => ${at};\n` + SRC_TEXT,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-door", MEMBER_TOKEN: "mem-door", PROBE_TOKEN: "prb-door", VERSION: "test" },
});

console.log("\n--- D-496: a burst straddling a bucket edge is held to the published limit ---");
const slideMf = new Miniflare(slideOpts(EDGE - 1));
const D = call(slideMf);
const STRADDLER = "198.51.100.30";
const preEdge = [];
for (let i = 0; i < 7; i++) preEdge.push(await D.POST("op=knock", { contentText: "pre " + i }, STRADDLER));
t("seven knocks land in the last millisecond of a bucket", preEdge.filter((r) => r.ok).length, 7);
await slideMf.setOptions(slideOpts(EDGE));
const postEdge = [];
for (let i = 0; i < 7; i++) postEdge.push(await D.POST("op=knock", { contentText: "post " + i }, STRADDLER));
/* THE ROW'S ACCEPTS-WHEN. Fourteen knocks two milliseconds apart across the
   edge: the fixed bucket admitted all fourteen, the window admits twelve. */
t("the straddling burst is held to twelve, not twenty-four",
  preEdge.filter((r) => r.ok).length + postEdge.filter((r) => r.ok).length, 12);
t("the knock over the line is refused by name", postEdge.find((r) => !r.ok)?.reason, "RATE_IP");
/* THE LIMIT IS NOW STATED TO THE CALLER, which it was not before this row: the
   429 carried a bare code and the number was published to nobody, so a record
   holding a bound named it only to whoever hit it. The sentence is asserted as a
   LITERAL and not read off the plane — a limit taken from its subject is a limit
   the subject can widen (D-487's line, and it governs the words as well as the
   number). It says "estimated" because the two-bucket count is an estimate. */
t("the refusal publishes the bound in words",
  postEdge.find((r) => !r.ok)?.stated,
  "at most 12 knocks from one source in any 10 minutes, estimated by a sliding window");
/* D-508. The published NUMBER above and the canned SENTENCE here are two
   different things arriving in one 429, and the arms are kept apart for that
   reason: `stated` moves when this instance's limits move, the translation does
   not, and collapsing either into the other would give the bound two authorities. */
ratePaper("per-source", postEdge.find((r) => !r.ok), "RATE_IP", "C-85.1");

console.log("\n--- D-496: the instance-wide bound straddles the edge too ---");
/* 300 is the instance's bound, so this arm costs 301 knocks and there is no
   cheaper honest way to reach it: an arm that drove a smaller number would be
   measuring a limit this plane does not have. Ten per source keeps every source
   under the per-source twelve, so what refuses here is the instance-wide guard
   and not the one the arms above already measured. */
const wideMf = new Miniflare(slideOpts(EDGE - 1));
const E = call(wideMf);
const drive = async (from, sources, each) => {
  const out = [];
  for (let s = 0; s < sources; s++)
    for (let i = 0; i < each; i++)
      out.push(await E.POST("op=knock", { contentText: "w" }, `198.51.100.${from + s}`));
  return out;
};
const wideBefore = await drive(100, 15, 10);
t("150 knocks from fifteen sources land before the edge", wideBefore.filter((r) => r.ok).length, 150);
await wideMf.setOptions(slideOpts(EDGE));
const wideAfter = [...await drive(200, 15, 10), await E.POST("op=knock", { contentText: "w" }, "198.51.100.250")];
t("the instance is held to 300 across the edge, not 450",
  wideBefore.filter((r) => r.ok).length + wideAfter.filter((r) => r.ok).length, 300);
t("the instance-wide refusal is named", wideAfter.at(-1).reason, "RATE_GLOBAL");
t("it publishes the instance-wide bound in words", wideAfter.at(-1).stated,
  "at most 300 knocks to this instance in any 10 minutes, estimated by a sliding window");
/* D-508, and the instance-wide sentence is a DIFFERENT sentence from the
   per-source one on purpose: what a refused knocker can usefully do about "you
   are sending too fast" and about "this whole instance is full" is not the same
   thing, and one sentence serving both would tell half of them something false. */
ratePaper("instance-wide", wideAfter.at(-1), "RATE_GLOBAL", "C-85.2");
t("the two rate refusals do not share one sentence",
  KNOCK_CHECKS.RATE_IP.translation === KNOCK_CHECKS.RATE_GLOBAL.translation, false);

console.log("\n--- D-496 OVER-STRICTNESS: a steady caller well under the rate is never refused ---");
/* THE ARM THE ROW DEMANDS, and it is the one a sliding window is most likely to
   get wrong: a source that spreads twelve knocks evenly over TWENTY minutes is
   sending at half the published rate and must never be refused. One every 100
   seconds, six in each of two consecutive buckets. At each knock the decayed
   carry and the current count sum to six, which is the caller's real rate, so
   the estimate tracks the rate rather than the bucket — a limiter that refused
   here would be tighter than its own published rule, and a fence tighter than
   its rule is an undeclared interface change wearing the costume of caution. */
const STEADY_MS = 100_000;
const steadyMf = new Miniflare(slideOpts(EDGE));
const F = call(steadyMf);
const steady = [];
for (let k = 0; k < 12; k++) {
  if (k) await steadyMf.setOptions(slideOpts(EDGE + k * STEADY_MS));
  steady.push(await F.POST("op=knock", { contentText: "steady " + k }, "198.51.100.60"));
}
t("twelve knocks spread evenly over twenty minutes are all accepted",
  steady.filter((r) => r.ok).length, 12);
t("and none of them was refused for any reason",
  steady.filter((r) => r.reason).map((r) => r.reason), []);

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

await withR2.dispose(); await noR2.dispose(); await pinnedMf.dispose();
await slideMf.dispose(); await wideMf.dispose(); await steadyMf.dispose();
console.log(`\ndoorbell: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
