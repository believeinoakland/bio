/* store-assembly R90, R94, R1 (fix round 10; K5200 items 91, 99, 100 (3); SCREENS-ENTRY #13 J15; STORE-REQUEST #6 J17 (2), (3a), J18 (c)): the options
   `storeWorld` takes beyond the first: a network script that is its world's own, a first boot with no name bound, the owed-render delivery, and a test's own
   release keys. Each is driven through the world and its store, and each has a control on the default; each was red before the option existed (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { storeWorld, WORLD_NOW, WORLD_INSTANCE_NAME } = await import("./world.mjs");
const { schedulerOf } = await import("../../../src/scheduler/index.mjs");
const { instanceSetupOf, RELEASE_NOTICE_ADDRESS } = await import("../../../src/setup.mjs");
const { acquisitionOf } = await import("../../../src/acquisition/index.mjs");
const { captureOf } = await import("../../../src/capture/index.mjs");
const { releaseNoticeStatement, NS_RELEASE_NOTICE } = await import("../../../src/sshsig.mjs");
const { signSshsig, signerPublicLine } = await import("../../../scripts/sign-sshsig.mjs");
const { owedRunAnswer } = await import("../acquisition/fixtures.mjs");

const answer = async (res) => ({ status: res.status, json: await res.json() });
const sha = (b) => createHash("sha256").update(b).digest("hex");
const TSA = "https://tsa.world-options.example/";

test("R94 (K5200; SCREENS-ENTRY #13 J15): a world's network script answers that world alone: another world made after it is refused, its own scheduler's firing and `within` reach it, and a bare call reaches the latest world's", async () => {
  const a = await storeWorld();
  a.script(TSA, async () => new Response("a's answer"));
  const fetched = [];
  schedulerOf(a.ctx, a.env).register("world-options", { name: "fetcher", key: "fetcher", due: (now) => (fetched.length ? null : now), wake: () => null,
    tick: async () => { fetched.push(await (await fetch(`${TSA}tick`)).text()); return { fetcher: { ok: true } }; } });
  const b = await storeWorld();
  assert.equal(await a.within(async () => (await fetch(`${TSA}x`)).text()), "a's answer", "a call in a's context is a's");
  await assert.rejects(b.within(() => fetch(`${TSA}x`)), (e) => e instanceof TypeError && /fetch failed/.test(e.message), "b's context does not reach a's script");
  await assert.rejects(fetch(`${TSA}x`), TypeError, "a bare call reaches the latest world's network, b's, which scripts nothing");
  await a.tick(1);
  assert.deepEqual(fetched, ["a's answer"], "a's firing, run after b was made, reached a's script");
  const OTHER = "https://other.world-options.example/";
  b.script(OTHER, async () => new Response("b's answer"));
  assert.equal(await (await fetch(`${OTHER}y`)).text(), "b's answer", "a bare call reaches the latest world's script");
  await assert.rejects(a.within(() => fetch(`${OTHER}y`)), TypeError, "and b's script is not a's");
});

test("R94 (K5200; SCREENS-ENTRY #13 J15): no script of an earlier test answers a later test's world", async () => {
  const c = await storeWorld();
  await assert.rejects(fetch(`${TSA}x`), (e) => e instanceof TypeError && /fetch failed/.test(e.message));
  await assert.rejects(c.within(() => fetch("https://other.world-options.example/y")), TypeError);
});

test("R90 (K5200; STORE-REQUEST #6 J17 (2)): `instanceName: null` is a first boot with no name bound, as an older installation had: no producing team is recorded and a promote that names the team is refused GROUP_UNDETERMINED; the default world, and one that names its team, record it", async () => {
  const promote = (w) => {
    const now = new Date(WORLD_NOW).toISOString();
    const front = ["---", "id: INFO-2026-0001-minutes", "object_type: information", "schema: information@2", "title: \"minutes\"", "current_state: collected",
      "prior_state: null", `created: ${now}`, `last_updated: ${now}`, "criticality: supporting", "source_status: unchanged", "source:", "  locator: \"upload\"",
      "  authority: member-entered", "monitoring:", "  enabled: false", "---", "", "## Summary", "", "minutes", ""].join("\n");
    return w.send({ url: "http://x/promote", body: { bundleId: "INFO-2026-0001-minutes", base: null, snapKey: "20261001120000_abc",
      meta: { object_type: "information", title: "minutes", current_state: "collected", created: now, last_updated: now },
      files: [{ path: "bundle.md", text: front, bytes: front.length, sha256: sha(front) }], register: [] } }).then(answer);
  };
  const none = await storeWorld({ instanceName: null });
  assert.equal(none.env.INSTANCE_NAME, undefined);
  assert.equal(instanceSetupOf(none.ctx, none.env).producingGroup(), null, "no team is recorded");
  const refused = await promote(none);
  assert.equal(JSON.stringify(refused.json).includes("GROUP_UNDETERMINED"), true, JSON.stringify(refused.json).slice(0, 300));
  const named = await storeWorld();
  assert.equal(instanceSetupOf(named.ctx, named.env).producingGroup(), WORLD_INSTANCE_NAME, "control: the default world names the team");
  assert.equal((await promote(named)).json.result.ok, true);
  const own = await storeWorld({ instanceName: "harbor" });
  assert.equal(instanceSetupOf(own.ctx, own.env).producingGroup(), "harbor", "a name the test gives is the team");
  const again = await storeWorld({ instanceName: null });
  assert.equal(instanceSetupOf(again.ctx, again.env).producingGroup(), null, "and the base of one kind is not the base of another: a later world with no name is still unnamed");
});

test("R1 R90 (K5200; STORE-REQUEST #6 J17 (3a)): `storeWorld({deliver})` hands the delivery to the owed-work ledger as the class does: an owed render's run is handed it and it reaches the delivery with the answer and the session; a world given none hands the run none", async () => {
  const calls = [];
  const spy = async (a) => { calls.push(a); return { ok: true }; };
  const w = await storeWorld({ deliver: spy });
  let handed = null;
  acquisitionOf(w.ctx).owedRun = async (_cap, _e, o) => { handed = o; return owedRunAnswer({ kind: "outstanding" }); };
  await captureOf(w.ctx).owedLater({ kind: "subresources", sha: sha("shell"), session: "s-render" });
  await w.tick(1000);
  assert.equal(typeof handed.deliver, "function", "the world hands `deliver`");
  await handed.deliver({ answer: { ok: true }, session: "s-render" });
  assert.equal(calls.length, 1);
  assert.deepEqual([calls[0].answer, calls[0].session, calls[0].ctx === w.ctx, calls[0].env === w.env], [{ ok: true }, "s-render", true, true]);
  /* control: a world made with none hands the run none */
  const bare = await storeWorld();
  let bareHanded = null;
  acquisitionOf(bare.ctx).owedRun = async (_cap, _e, o) => { bareHanded = o; return owedRunAnswer({ kind: "outstanding" }); };
  await captureOf(bare.ctx).owedLater({ kind: "subresources", sha: sha("shell"), session: "s-render" });
  await bare.tick(1000);
  assert.ok(bareHanded, "the run was made");
  assert.notEqual(typeof bareHanded.deliver, "function", "and was handed no delivery");
});

test("R1 R90 (K5200; STORE-REQUEST #6 J18 (c)): `storeWorld({releaseKeys})` is the list of keys instance-setup verifies a release notice against: a notice signed with the test's key is stored by the daily check, one signed with another key is refused, and a world with no keys verifies against the product's, which refuse both", async () => {
  const b64 = (bytes) => Buffer.from(bytes).toString("base64");
  const seed = (n) => `BIOKEY-RAW1.bio-release.${b64(new Uint8Array(32).map((_, i) => (i * n + 9) % 256))}`;
  const KEY = seed(41), OTHER = seed(43);
  const keys = [signerPublicLine(KEY)];
  const notice = { version: "0.85.0", date: "2026-10-14", manifest: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", security: false,
    notes: { members: "Searching is faster.", administrators: "You decide when to update.", must_do: "" } };
  const feed = (priv) => JSON.stringify({ ...notice, sig: signSshsig(priv, releaseNoticeStatement(notice), NS_RELEASE_NOTICE), signer: signerPublicLine(priv) });
  const stored = async (world, priv) => {
    world.script(RELEASE_NOTICE_ADDRESS, async () => new Response(feed(priv), { status: 200 }));
    await world.tick(2 * 86_400_000);
    return [...world.sql.exec("SELECT version FROM release_notices")].map((r) => r.version);
  };
  const env = { VERSION: "0.84.0" };
  assert.deepEqual(await stored(await storeWorld({ env, releaseKeys: keys }), KEY), ["0.85.0"], "signed with the test's key: stored");
  assert.deepEqual(await stored(await storeWorld({ env, releaseKeys: keys }), OTHER), [], "control: signed with another key: refused");
  assert.deepEqual(await stored(await storeWorld({ env }), KEY), [], "control: with no keys handed, the product's keys judge, and refuse the test's");
});
