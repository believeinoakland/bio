/* DIST-4 / DEC-43 (b) — the fleet-visibility report, driven over fixture fleets.
 *
 * The report answers WHICH instances still monitor on the ADMIN_TOKEN fallback,
 * from what each instance REPORTS (op=selftest's liveToken-checked
 * bindings.DAEMON_TOKEN), never from what an installer intended to bind. The
 * arms below present fleets that disagree with intent, echo credentials back,
 * refuse, and vanish — and require the exact honest answer for each.
 *
 * THE THREE NC SHAPES THE DIST-4 ROW NAMES, each an arm here:
 *   (1) an instance that never bound DAEMON_TOKEN appears BY NAME — a fallback
 *       instance reading as clean is the silence DEC-43 was raised about;
 *   (2) installer INTENT must not be readable: a fixture carries an
 *       `intendedBinding` field claiming DAEMON_TOKEN while the instance's own
 *       answer says "not configured" — the report must say admin-fallback;
 *   (3) a token VALUE in the output must be impossible: a hostile instance
 *       echoes the probe credential inside its version field, and the report
 *       must scrub it and flag the instance.
 *
 * NEGATIVE CONTROL: RUN 2026-09-14, two hand arms against the tool itself, each
 * on the real file with a pristine copy taken first and the restore verified by
 * sha256 both times (the git-checkout trap is why cp-aside is the protocol) —
 * (a) neuter the fallback NAMING (categorise "not configured" as "daemon") ->
 * 4 of 23 fail, the first naming shy-hall (NC shape 1) and the intent arm
 * failing with it (a mislabelled fallback satisfies intent exactly);
 * (b) neuter the scrub (return the string unscrubbed) -> 2 of 23 fail, both
 * arm-3 assertions: the credential reaches the report and the hostile instance
 * is not flagged. Restored byte-identically after each, 23/23 green.
 *
 * AND THE INSTRUMENT WAS CORRECTED MID-RUN, reported rather than smoothed:
 * arm (a)'s first firing CRASHED this suite instead of failing it — four
 * assertions read `.detail.includes(...)` / `.version.includes(...)` on fields
 * that are null exactly when the subject is broken, so the control arm turned
 * red by TypeError, not by count (D-93 inside a control, the same class the
 * CPDF lanes hit). All four now use `?.` with a named fallback value, and the
 * figures above are from the hardened suite. The header's first draft also
 * carried PREDICTED counts (5/25, 2/25) written before the arms ran; these are
 * the measured ones, and the difference is why numbers are not written down
 * before the instrument produces them.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { fleetPosture } from "../../tools/fleet-posture.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};

const selftest = (daemonField, version = "0.57.0", extra = {}) => ({
  ok: true, service: "bio-plane", version, tokenClass: "probe",
  bindings: { STORE: true, ADMIN_TOKEN: true, MEMBER_TOKEN: true, PROBE_TOKEN: true,
              DAEMON_TOKEN: daemonField },
  ...extra,
});
const answer = (obj, status = 200) => ({
  status, json: async () => obj,
});

/* A fixture fleet: each entry maps its instance name to how selftest answers. */
const fetchFor = (byName) => async (url) => {
  for (const [name, fn] of Object.entries(byName)) {
    if (url.includes(`//${name}.`)) return fn(url);
  }
  throw new Error(`no fixture answers ${url}`);
};

console.log("\n--- fleet-posture: the DEC-43 count, from what instances report ---");

/* ---- the mixed fleet: every posture at once, each named correctly -------- */
{
  const HOSTILE_TOKEN = "prb-hostile-value-9f3a";
  const fleet = [
    { name: "oak-green",  base: "https://oak-green.x.workers.dev",  token: "prb-a" },
    /* NC shape (2): the intent field LIES — the instance's own answer rules. */
    { name: "shy-hall",   base: "https://shy-hall.x.workers.dev",   token: "prb-b", intendedBinding: "DAEMON_TOKEN" },
    { name: "elm-dead",   base: "https://elm-dead.x.workers.dev",   token: "prb-c" },
    { name: "ivy-gone",   base: "https://ivy-gone.x.workers.dev",   token: "prb-d" },
    { name: "ash-refuse", base: "https://ash-refuse.x.workers.dev", token: "prb-e" },
    /* NC shape (3): a hostile instance echoes its credential in `version`. */
    { name: "fox-echo",   base: "https://fox-echo.x.workers.dev",   token: HOSTILE_TOKEN },
  ];
  const report = await fleetPosture(fleet, { fetchImpl: fetchFor({
    "oak-green":  () => answer(selftest(true)),
    "shy-hall":   () => answer(selftest("not configured")),
    "elm-dead":   () => answer(selftest(false)),
    "ivy-gone":   () => { throw new Error("connect timeout"); },
    "ash-refuse": () => answer({ ok: false, error: "NOT_PERMITTED" }, 403),
    "fox-echo":   () => answer(selftest(true, `0.57.0+${HOSTILE_TOKEN}`)),
  }) });

  const by = Object.fromEntries(report.instances.map((r) => [r.name, r]));
  t("a scoped instance reads daemon", by["oak-green"].posture, "daemon");
  /* NC shape (1): the arm this item exists for. */
  t("the fallback instance appears BY NAME, never as clean",
    report.instances.filter((r) => r.posture === "admin-fallback").map((r) => r.name), ["shy-hall"]);
  t("the fallback count is the STATED number DEC-43 waits on", report.fallbackCount, 1);
  t("the fallback row says what it costs",
    by["shy-hall"].detail?.includes("root-of-trust ADMIN_TOKEN") ?? "no detail", true);
  /* NC shape (2): intent is not a measurement. */
  t("the installer's intent field cannot overrule the instance's own answer",
    by["shy-hall"].posture, "admin-fallback");
  /* bound-but-revoked is BROKEN — never fallback, never clean (the DIST->RECORD
     delegation names the plane-side hole this categorises honestly). */
  t("a revoked daemon token reads daemon-revoked, not fallback",
    [by["elm-dead"].posture, report.brokenCount], ["daemon-revoked", 1]);
  t("daemon-revoked says monitoring is BROKEN, not degraded",
    by["elm-dead"].detail?.includes("BROKEN") ?? "no detail", true);
  t("an unreachable instance is a stated absence", by["ivy-gone"].posture, "unreachable");
  t("a refusal is a stated absence, not a guess", by["ash-refuse"].posture, "refused");
  t("absences make the report INCOMPLETE, loudly",
    [report.complete, report.summary.startsWith("INCOMPLETE")], [false, true]);
  /* NC shape (3): no token value in the output, structurally. */
  const serialised = JSON.stringify(report);
  t("no credential value anywhere in the report", serialised.includes(HOSTILE_TOKEN), false);
  t("the hostile echo is scrubbed AND flagged",
    [by["fox-echo"].version?.includes("[REDACTED-CREDENTIAL]") ?? "no version", by["fox-echo"].echoedCredential],
    [true, true]);
  t("no OTHER configured credential appears either",
    ["prb-a", "prb-b", "prb-c", "prb-d", "prb-e"].some((v) => serialised.includes(v)), false);
  /* D-116's other hat, same call. */
  t("versions are reported per instance", by["oak-green"].version, "0.57.0");
}

/* ---- the fleet DEC-43 is waiting for: measured zero, said plainly -------- */
{
  const fleet = [
    { name: "oak-a", base: "https://oak-a.x.workers.dev", token: "p1" },
    { name: "oak-b", base: "https://oak-b.x.workers.dev", token: "p2" },
  ];
  const report = await fleetPosture(fleet, { fetchImpl: fetchFor({
    "oak-a": () => answer(selftest(true)),
    "oak-b": () => answer(selftest(true)),
  }) });
  t("an all-daemon fleet counts ZERO", report.fallbackCount, 0);
  t("and is complete", report.complete, true);
  t("and the summary states the measured zero in DEC-43's terms",
    report.summary.includes("measured count is ZERO"), true);
  t("agreeing versions report no skew", report.versionSkew, false);
}

/* ---- version skew is VISIBLE, not judged (resolve-version judges trees;
        this reports what the field is actually serving) -------------------- */
{
  const fleet = [
    { name: "old-e", base: "https://old-e.x.workers.dev", token: "p3" },
    { name: "new-e", base: "https://new-e.x.workers.dev", token: "p4" },
  ];
  const report = await fleetPosture(fleet, { fetchImpl: fetchFor({
    "old-e": () => answer(selftest(true, "0.56.0")),
    "new-e": () => answer(selftest(true, "0.57.0")),
  }) });
  t("two live versions are both seen", report.versionsSeen.sort(), ["0.56.0", "0.57.0"]);
  t("and the skew is stated", report.versionSkew, true);
}

/* ---- an answer that presents no bindings cannot be categorised ----------- */
{
  const fleet = [{ name: "mut-h", base: "https://mut-h.x.workers.dev", token: "p5" }];
  const report = await fleetPosture(fleet, { fetchImpl: fetchFor({
    "mut-h": () => answer({ ok: true, version: "0.57.0" }),
  }) });
  t("no bindings presented reads refused — the report never guesses",
    report.instances[0].posture, "refused");
  t("and the detail says that saying so IS the report",
    report.instances[0].detail?.includes("cannot say") ?? "no detail", true);
}

/* ---- the prove-the-others-mean-something arm: a malformed daemon field --- */
{
  const fleet = [{ name: "odd-i", base: "https://odd-i.x.workers.dev", token: "p6" }];
  const report = await fleetPosture(fleet, { fetchImpl: fetchFor({
    "odd-i": () => answer(selftest("yes please")),
  }) });
  t("an unrecognised daemon shape is refused, not rounded to a posture",
    report.instances[0].posture, "refused");
}

console.log(`\nfleetposture: ${pass} passed, ${fail} failed`);
/* Unconditional, per the hygiene rule: a suite that only exits on failure can
   hang a green run on a lingering handle, and a hang reads as never-run. The
   stdio flush import above is what keeps this exit from eating the tally. */
process.exit(fail ? 1 : 0);
