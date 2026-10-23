/* R15, R77, RC-R7 C84 (fix round 4; seam owner S): the path from the press on Settings › Security to the words the administrator reads.
   Nothing between the button and the words is scripted: the press is the screen's own act (`scanmirror`), answered by the real
   `file-safety` over the real `file-scanner` handler (its `/mirror?async=1`, `/version` and cron tick, over a bucket and a
   freshclam stand-in), the invocation of the asynchronous run cancelled a few milliseconds after the response as the platform
   cuts `waitUntil`. The words are asserted by key (K3810): a member's own-language row is shown for each key, so a sentence drawn
   from the plane's English instead of the key would read as English here. Only the image's freshclam is a stand-in (no egress). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, has, lacks, open, said, squash, textOf } from "./kit.mjs";
import { ADMIN, env, securityTable } from "./fixtures.mjs";
import { world, T0 } from "../file-safety/fixture.mjs";
import { handle, scheduled } from "../../../../file-scanner/src/handler.mjs";
import { memoryBucket, depsWith, json } from "../../../../file-scanner/test/helpers.mjs";

const BOSS = "member:boss";
const MIN = 60_000;
const iso = (t) => new Date(t).toISOString();
const hang = () => new Promise(() => {});

/* freshclam, as the image's updater answers a run: refused with its lines, or never answering (a download that outlasts the invocation) */
const refusing = (detail) => async (path, init = {}) => ((init.method || "GET") === "POST" ? json({ ok: false, code: "MIRROR_REFUSED", detail }) : json({ ok: true }));
const stuck = async (path, init = {}) => ((init.method || "GET") === "POST" ? hang() : json({ ok: true }));

/* the plane: the real file-safety, whose scanner binding is the real file-scanner handler over one bucket; every request is its own
   invocation, and the asynchronous mirror's is cut `cutAfterMs` after its response (its bucket, updater and image then hang for good) */
function seam({ state = null, cutAfterMs = 20 } = {}) {
  const w = world({ now: T0 });
  const bucket = memoryBucket(state ? { "clamav/state.json": JSON.stringify(state) } : {});
  const env0 = { updater: stuck };
  const deps = (over = {}) => depsWith({ bucket, now: () => w.clock.now, updater: env0.updater, ...over });
  w.env.FILE_SCANNER = {
    async fetch(request) {
      const url = new URL(request.url);
      if (!(url.pathname === "/mirror" && url.searchParams.get("async") === "1")) return handle(request, deps());
      let cut = false;
      const guard = (fn) => (...a) => (cut ? hang() : fn(...a));
      const b = deps().bucket;
      const d = deps({ bucket: { ...b, head: guard(b.head), get: guard(b.get), put: guard(b.put), delete: guard(b.delete), list: guard(b.list) },
        updater: guard(env0.updater), waitUntil: () => {} });
      const res = await handle(request, d);
      setTimeout(() => { cut = true; }, cutAfterMs);
      return res;
    },
  };
  const table = (over = {}) => securityTable({
    scanstatus: async () => env(await w.fs.scanStatus({ viewer: BOSS })),
    scanmirror: async () => env(await w.fs.scanMirror({ viewer: BOSS })),
    // the administrator reads the interface in another language: only a sentence drawn by its key shows it
    interfacewords: { ok: true, language: "es", words: Object.entries(OWN).map(([key, text]) => ({ key, text, en: key, fallback: false })) },
    ...over,
  });
  const screen = () => open("security", { me: ADMIN, table: table() });
  const sigs = async () => (await handle(new Request("https://file-scanner/version"), deps()).then((r) => r.json())).signatures;
  return { w, bucket, env0, deps, screen, sigs, tick: (ms) => w.tick(ms), async settle(ms = 60) { await new Promise((r) => setTimeout(r, ms)); } };
}

/* the member's own words for each sentence under test; `{status}` is filled as the key's fills are */
const OWN = {
  "file-safety.index.signatures_refused": "ES rechazada ({status})",
  "file-safety.index.signatures_refused_unnumbered": "ES rechazada sin numero",
  "file-safety.index.signatures_run_seed": "ES revision en curso, preparando",
  "file-safety.index.signatures_run_download": "ES revision en curso, descargando",
  "file-safety.index.signatures_run_stopped": "ES revision detenida, se reanudara",
  "act.scanmirror.label.security": "ES Revisar ahora",
  "screen.security.mirror.started": "ES se ha pedido la revision",
};
const own = (key, fills = {}) => OWN[key].replace(/\{(\w+)\}/g, (m, k) => fills[k]);
const line = (o, state) => all(o.tree, (e) => e.attrs["data-state"] === state).map(textOf).map(squash)[0] || null;
const STALE = { last_attempt: iso(T0 - 15 * 60 * MIN), last_error: "REFUSED:main.cvd:403" };

test("R15 R77 C84 (S): the press on Security, through the real scanmirror and the real scanner cut after its response, then the words for the run under way, the dead run, and a refusal", async () => {
  const s = seam({ state: STALE });
  // before: the record the walker found (a stale refusal from before the redeploy, an old-format string): its status is accurate to it
  const before = await s.screen();
  assert.equal(line(before, "nosignatures-reason"), own("file-safety.index.signatures_refused", { status: "403" }), "REFUSED:main.cvd:403, by its key");
  const button = acts(before.tree).find((b) => b.attrs["data-act"] === "scanmirror");
  assert.ok(button && squash(textOf(button)) === own("act.scanmirror.label.security"), "the button is labelled by its own key, saying what it checks");

  // the press: the screen's act, the real file-safety, the real scanner; the run is cut 20 ms after the 202
  const pressed = await before.press("scanmirror");
  assert.deepEqual(pressed.sent.filter((x) => x.op === "scanmirror").map((x) => x.body), [{}], "asked once, with no field");
  assert.equal(before.refused, null, "the press was accepted, not refused");
  assert.equal(line(before, "mirror"), own("screen.security.mirror.started"), "the sentence for a check that was asked for");
  await s.settle();
  const trace = await s.sigs();
  assert.deepEqual([trace.last_attempt, trace.last_error, trace.stage], [iso(T0), "RUN_STARTED", "download"], "the cut run left its start and its stage (scanner R6)");

  // a run under way: worded as one, at its stage, never as the stale refusal
  const under = await s.screen();
  assert.equal(line(under, "nosignatures-reason"), own("file-safety.index.signatures_run_download"), "RUN_STARTED, by its key");
  assert.ok(!under.text.includes("403"), "the stale refusal is not drawn as this run's outcome");

  // a second press while it is alive is refused in words that say a check is under way, never "a few minutes ago" over a run that wrote nothing
  s.tick(5 * MIN);
  const again = await s.screen();
  await again.press("scanmirror");
  assert.equal(again.refused && again.refused.text, said("refusal.SIGNATURES_RUN_UNDER_WAY"), "alive: a check is under way");
  assert.notEqual(again.refused.text, said("refusal.SIGNATURES_RUN_RECENT"));

  // 20 minutes on with no later stage the run is dead: worded as stopped and to be resumed; the next press is allowed
  s.tick(20 * MIN);
  const dead = await s.screen();
  assert.equal(line(dead, "nosignatures-reason"), own("file-safety.index.signatures_run_stopped"), "a dead run, by its key");
  const next = await dead.press("scanmirror");
  assert.equal(dead.refused, null, "a dead run does not block the next press");
  assert.equal(next.sent.filter((x) => x.op === "scanmirror").length, 1);
  await s.settle();

  // the cron tick, long after, finishes the open request; freshclam is refused with a status: worded by its key with the status filled
  s.tick(40 * MIN);
  s.env0.updater = refusing("exit 1: ERROR: Can't download main.cvd from the mirror: HTTP status 403");
  const out = await scheduled(s.deps());
  assert.equal(out.ok, false);
  assert.match((await s.sigs()).last_error, /^MIRROR_REFUSED:exit 1: .*403/);
  const refused = await s.screen();
  assert.equal(line(refused, "nosignatures-reason"), own("file-safety.index.signatures_refused", { status: "403" }), "MIRROR_REFUSED:exit 1: ... 403, by its key with its status");
  assert.equal(all(refused.tree, (e) => e.attrs["data-state"] === "nosignatures-next").length, 0, "the administrator's step is said once");
});

test("R15 R77 C84 (S) control: a refusal with no status in it is worded by its unnumbered key; signatures held draw no state of a run", async () => {
  const s = seam({ state: STALE });
  s.tick(10 * 60 * MIN);
  s.env0.updater = refusing("exit 1: the mirror would not talk to us");
  await scheduled(s.deps());
  const o = await s.screen();
  assert.equal(line(o, "nosignatures-reason"), own("file-safety.index.signatures_refused_unnumbered"));
  lacks(o, "screen.security.files.on");
});
