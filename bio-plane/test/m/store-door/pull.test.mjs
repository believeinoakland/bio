/* store-door R7 (was control-plane R36's pull and its promotion; N364, DEC-78 item 1; DEC-88 (2), K1037): the store's
   pull, `pullAndFile` at the internal route `inboxpullfile`, pulls through capture's `pullKnock` with `by` as stamped and
   promotes the pulled document as a new information bundle at collected in the same act; a knock already pulled whose
   capture no bundle holds is promoted by the next pull; the `pulled` resolve takes capture R32's reason. Driven at the
   record store's door over a real record (`record.mjs`) and through `pullAndFile` with the promotion controlled. Moved from
   control-plane's `inbox-door.test.mjs` and `doorbell.test.mjs` at the split (K1974); the Worker's routing and the `by`
   stamp stay control-plane's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import "./harness.mjs";
const { record: fixture } = await import("./record.mjs");
const P = await import("../../../src/store-door/pull.mjs");
const { captureOf, REASON_MAX, PULL_WITHIN_FAILED_DETAIL } = await import("../../../src/capture/index.mjs");
const { CAPTURE_CHECKS } = await import("../../../src/capture/checks.mjs");
const { provenanceOf } = await import("../../../src/provenance/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");

const SESSION = "by=ann&identity=member:ann&viewer=member:ann";
async function record() {
  const r = await fixture();
  const knock = async (text = "material for the group", extra = {}) =>
    (await r.go("knock?source=203.0.113.9", "POST", { content: text, note: "please look", contact: "knocker@example.org", now: Date.now(), ...extra })).json.result;
  const state = (knockId) => captureOf(r.ctx).inboxGet(knockId).item;
  const held = (knockId, sha) => {
    const k = state(knockId);
    return { status: k.status, capture_sha: k.capture_sha ?? null, pulled_by: k.pulled_by ?? null,
             resolve_reason: k.resolve_reason ?? null, receipt: provenanceOf(r.ctx).registerHolds({ sha }).acquired,
             home: provenanceOf(r.ctx).homeOf(sha)?.bundleId ?? null, bundles: recordOf(r.ctx).listBundles().ids.length };
  };
  return { ...r, knock, state, held };
}
const UNTOUCHED = { status: "new", capture_sha: null, pulled_by: null, resolve_reason: null, receipt: false, home: null, bundles: 0 };
/* What capture R32 refuses: absent, not a string, blank, over REASON_MAX code points. */
const REASONLESS = [undefined, null, 7, "", "   \n\t", "x".repeat(REASON_MAX + 1)];
/* What the record holds of a knock's pull: the knock's row, its receipt, and a bundle holding its capture. */
const heldOf = (r, knockId, sha) => {
  const k = r.state(knockId);
  return { status: k.status, capture_sha: k.capture_sha ?? null, pulled_by: k.pulled_by ?? null,
           receipt: provenanceOf(r.ctx).registerHolds({ sha }).acquired, home: provenanceOf(r.ctx).homeOf(sha) };
};

test("R7 (capture R32, C-118.7; DEC-88 (2), K1037): the `pulled` resolve at the record store's door refuses a reason absent, not a string, blank or over 2,000 characters RESOLVE_NO_REASON at 400 with capture's own row, and nothing is written — the knock still new, no receipt, no capture, no bundle (negative control: 2,000 characters is a reason)", async () => {
  const r = await record();
  const k = await r.knock();
  assert.deepEqual(r.held(k.knockId, k.sha256), UNTOUCHED);
  const row = CAPTURE_CHECKS.RESOLVE_NO_REASON;
  for (const reason of REASONLESS) {
    const a = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST",
                         { knockId: k.knockId, status: "pulled", ...(reason === undefined ? {} : { reason }) });
    const x = a.json.result;
    assert.deepEqual([a.status, a.json.ok, x.ok, x.reason, x.code, x.check, x.translation, x.status],
                     [200, true, false, "RESOLVE_NO_REASON", "RESOLVE_NO_REASON", row.check, row.translation, 400], String(reason).slice(0, 20));
    assert.equal(row.check, "C-118.7");
    assert.deepEqual(r.held(k.knockId, k.sha256), UNTOUCHED, `nothing written for ${JSON.stringify(reason)?.slice(0, 20)}`);
  }
  /* a knock no knock answers to is refused first (capture's order), with nothing written */
  const none = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST", { knockId: "KNOCK-none", status: "pulled" });
  assert.equal(none.json.result.reason, "NO_SUCH_KNOCK");
  /* negative control: exactly REASON_MAX code points is admitted */
  const max = "é".repeat(REASON_MAX);
  const ok = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST", { knockId: k.knockId, status: "pulled", reason: max });
  assert.equal(ok.json.result.ok, true, JSON.stringify(ok.json).slice(0, 300));
  assert.equal(r.held(k.knockId, k.sha256).status, "pulled");
});

test("R7 (capture R32, R65; DEC-88 (2), K1037): a reasoned `pulled` resolve is the pull with its promotion — the knock pulled by the member, its receipt, one new information bundle at collected holding the capture, the puller its author; `op=inboxpull` asked directly takes no reason, whatever its body carries", async () => {
  const r = await record();
  const k = await r.knock("the minutes they did not publish");
  const a = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST",
                       { knockId: k.knockId, status: "pulled", reason: "this is the agenda packet we asked for" });
  const x = a.json.result;
  assert.deepEqual([x.ok, x.existed], [true, false], JSON.stringify(a.json).slice(0, 300));
  assert.match(x.bundle.bundleId, /^INFO-\d{4}-0001-doorbell-knock$/);
  const { resolve_reason: _recorded, ...held } = r.held(k.knockId, k.sha256);   /* the row's reason: the test below */
  assert.deepEqual(held, { status: "pulled", capture_sha: k.sha256, pulled_by: "ann", receipt: true, home: x.bundle.bundleId, bundles: 1 });
  const head = recordOf(r.ctx).head(x.bundle.bundleId);
  assert.deepEqual([head.type, head.currentState], ["information", "collected"]);
  assert.match(recordOf(r.ctx).readFile(x.bundle.bundleId, "bundle.md").text, / \| Collected \| ann$/m);
  /* the direct pull: no resolve stamp, so a reason in its body is not the resolve's and is not recorded */
  const e = await r.knock("another");
  const d = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: e.knockId, status: "pulled", reason: "smuggled" });
  assert.equal(d.json.result.ok, true);
  assert.deepEqual([r.held(e.knockId, e.sha256).status, r.held(e.knockId, e.sha256).resolve_reason], ["pulled", null]);
  /* negative control: and the direct pull needs none — a reasonless direct pull is admitted */
  const f = await r.knock("a third");
  assert.equal((await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: f.knockId })).json.result.ok, true);
});

test("R7 (capture R32; DEC-88 (2); N499, K1117): an admitted `pulled` resolve's reason is recorded on the knock's row with the pull, through capture's `inboxResolve` (negative control: a direct pull records none)", async () => {
  const r = await record();
  const k = await r.knock("the reason's row");
  const a = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST", { knockId: k.knockId, status: "pulled", reason: "worth a look" });
  assert.equal(a.json.result.ok, true);
  assert.deepEqual([r.held(k.knockId, k.sha256).status, r.held(k.knockId, k.sha256).resolve_reason], ["pulled", "worth a look"]);
  /* the reason is the row's, written with the pull: the knock's bundle is the one filed in the same act */
  assert.equal(r.held(k.knockId, k.sha256).home, a.json.result.bundle.bundleId);
  /* negative control: a direct pull of another knock records no reason */
  const e = await r.knock("pulled directly");
  assert.equal((await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: e.knockId, reason: "not taken" })).json.result.ok, true);
  assert.deepEqual([r.held(e.knockId, e.sha256).status, r.held(e.knockId, e.sha256).resolve_reason], ["pulled", null]);
});

test("R7 (capture R65's `within`; DEC-88 (2)): the reasoned `pulled` resolve and its promotion are one act — a promotion that refuses, or throws, leaves neither written: the knock new, no reason on its row, no receipt, no bundle", async () => {
  for (const fault of [{ ok: false, reason: "PROMOTE_REFUSED_HERE", detail: "raced" }, "throw"]) {
    const r = await record();
    const k = await r.knock(`one act ${JSON.stringify(fault)}`);
    let asked = 0;
    const promotion = { promote() { asked++; if (fault === "throw") throw new Error("a store fault"); return fault; } };
    const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: provenanceOf(r.ctx) };
    const out = await P.pullAndFile(deps, { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann",
                                            resolve: true, reason: "worth a look" });
    assert.equal(out.ok, false, JSON.stringify(out).slice(0, 300));
    assert.equal(asked, 1, "the promotion is asked once, inside the pull");
    assert.equal(JSON.stringify(out).includes("a store fault"), false);
    assert.deepEqual(r.held(k.knockId, k.sha256), UNTOUCHED, "the resolve was rolled back with its promotion");
  }
});

test("R7, R1 (N364, N381): the pull is a route of the record store's door, beside capture's own — refused by capture (no puller, no such knock, a discarded knock), nothing is written; admitted, it files the knock end to end with the real capture, provenance and promotion: one new information bundle at collected, the puller its author, holding the capture, no contact in it", async () => {
  const r = await record();
  const k = await r.knock();
  assert.equal(k.ok, true);
  const before = heldOf(r, k.knockId, k.sha256);
  assert.deepEqual(before, { status: "new", capture_sha: null, pulled_by: null, receipt: false, home: null });
  const bundles = () => recordOf(r.ctx).listBundles().ids;
  /* capture's refusals: its own words, nothing written */
  for (const [path, body, reason] of [[`inboxpullfile?identity=member:ann&viewer=member:ann`, { knockId: k.knockId }, "NO_PULLER"],
                                      [`inboxpullfile?${SESSION}`, { knockId: "KNOCK-none" }, "NO_SUCH_KNOCK"]]) {
    const a = await r.go(path, "POST", body);
    assert.deepEqual([a.status, a.json.ok, a.json.result.ok, a.json.result.reason], [200, true, false, reason]);
    assert.deepEqual(heldOf(r, k.knockId, k.sha256), before);
  }
  const d = await r.knock("another");
  /* capture R32 (DEC-88 (2)): every resolve takes the member's reason */
  assert.equal(captureOf(r.ctx).inboxResolve({ knockId: d.knockId, status: "discarded", by: "ann", reason: "not for us" }).ok, true);
  const da = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: d.knockId });
  assert.equal(da.json.result.reason, "KNOCK_DISCARDED");
  assert.equal(heldOf(r, d.knockId, d.sha256).receipt, false);
  assert.deepEqual(bundles(), []);
  /* N381: the real promotion admits capture R65's own document, so one pull files the knock */
  const p = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: k.knockId });
  assert.equal(p.json.result.ok, true, JSON.stringify(p.json).slice(0, 400));
  const { bundle } = p.json.result;
  assert.match(bundle.bundleId, /^INFO-\d{4}-0001-doorbell-knock$/);
  assert.match(bundle.bundleSha, /^[0-9a-f]{64}$/);
  assert.equal("within" in p.json.result, false, "the seam's answer is carried as `bundle`, not beside it");
  assert.deepEqual(bundles(), [bundle.bundleId]);
  const held = heldOf(r, k.knockId, k.sha256);
  assert.deepEqual([held.status, held.capture_sha, held.pulled_by, held.receipt, held.home?.bundleId],
                   ["pulled", k.sha256, "ann", true, bundle.bundleId]);
  const head = recordOf(r.ctx).head(bundle.bundleId);
  assert.deepEqual([head.type, head.currentState, head.bundleSha], ["information", "collected", bundle.bundleSha]);
  const md = recordOf(r.ctx).readFile(bundle.bundleId, "bundle.md").text;
  assert.match(md, /^current_state: collected$/m);
  assert.match(md, / \| Collected \| ann$/m, "the puller is the bundle's author");
  const prov = JSON.parse(recordOf(r.ctx).readFile(bundle.bundleId, "data/provenance.json").text);
  assert.deepEqual([prov.documents[0].capture.actor, prov.documents[0].origin.kind, prov.documents[0].capture.sha256],
                   ["ann", "doorbell", k.sha256]);
  assert.deepEqual(recordOf(r.ctx).readFile(bundle.bundleId, prov.documents[0].file).blobSha, k.sha256);
  for (const f of ["bundle.md", "data/provenance.json"])
    assert.equal(recordOf(r.ctx).readFile(bundle.bundleId, f).text.includes("knocker@example.org"), false, `no contact in ${f}`);
  assert.equal(JSON.stringify(p.json).includes("knocker@example.org"), false, "no contact in the answer");
  /* a repeated pull answers the same bundle and files nothing more */
  const again = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: k.knockId });
  assert.deepEqual([again.json.result.ok, again.json.result.existed, again.json.result.bundle],
                   [true, true, { bundleId: bundle.bundleId, bundleSha: null, existed: true }]);
  assert.deepEqual(bundles(), [bundle.bundleId]);
  /* negative control: capture's own route, called directly, pulls a knock and files no bundle; the door's next pull of
     it promotes it, because no bundle holds its capture */
  const e = await r.knock("pulled around the door");
  const c = await r.go("inboxpull?by=ann", "POST", { knockId: e.knockId });
  assert.equal(c.json.result.ok, true);
  assert.deepEqual([heldOf(r, e.knockId, e.sha256).status, heldOf(r, e.knockId, e.sha256).home], ["pulled", null]);
  const f = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: e.knockId });
  assert.deepEqual([f.json.result.ok, f.json.result.existed], [true, true]);
  assert.equal(heldOf(r, e.knockId, e.sha256).home?.bundleId, f.json.result.bundle.bundleId);
  assert.equal(bundles().length, 2);
});

/* The promotion's answer controlled, capture and record-core real: what reaches the promotion, and when. */
function promotionStandIn(r, decide) {
  const seen = [];
  return {
    seen,
    promote(pkg) {
      const at = seen.length;
      seen.push(pkg);
      const verdict = decide(at, pkg);
      if (verdict === "throw") throw new Error("a store fault");
      if (verdict !== true) return verdict;
      /* a write the promotion makes, so its rollback in a dry run is seen */
      r.db.prepare("CREATE TABLE IF NOT EXISTS standin_writes (id TEXT)").run();
      r.db.prepare("INSERT INTO standin_writes VALUES (?)").run(pkg.bundleId);
      return { ok: true, bundleId: pkg.bundleId, bundleSha: "b".repeat(64) };
    },
  };
}
const standinWrites = (r) => { try { return r.db.prepare("SELECT id FROM standin_writes").all().map((x) => x.id); } catch { return []; } };

test("R7 (N364, N380, N386): one pull files the capture and promotes its document as a new information bundle at collected, the puller its author — the promotion asked once, inside the pull; the instant is the second the pull was made; no contact reaches the bundle", async () => {
  const r = await record();
  const k = await r.knock("the minutes they did not publish");
  const promotion = promotionStandIn(r, () => true);
  let homes = 0;
  const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: { homeOf: () => { homes++; return null; } } };
  const now = () => Date.parse("2026-09-30T12:34:56.789Z");
  const a = await P.pullAndFile(deps, { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann", now });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(a.existed, false);
  assert.deepEqual(a.capture, { sha256: k.sha256, bytes: k.bytes });
  /* N380: one promotion, the one inside the pull; no dry run */
  assert.equal(promotion.seen.length, 1);
  const [real] = promotion.seen;
  assert.deepEqual(standinWrites(r), [real.bundleId]);
  assert.deepEqual(a.bundle, { bundleId: real.bundleId, bundleSha: "b".repeat(64) });
  assert.match(real.bundleId, /^INFO-2026-0001-doorbell-knock$/);
  /* N386: the pull's instant, to the second (record-core R47's "second" spelling) */
  assert.deepEqual([a.pulled_at, real.meta.created, r.state(k.knockId).pulled_at], Array(3).fill("2026-09-30T12:34:56Z"));
  /* the package: a creation, the puller its author, collected, capture's own document, the bytes as a blob, one register row */
  assert.deepEqual([real.base, real.author, real.actorMemberId, real.actorIdentity, real.actorViewer], [null, "ann", "ann", "member:ann", "member:ann"]);
  assert.deepEqual([real.meta.object_type, real.meta.current_state], ["information", "collected"]);
  const md = real.files.find((f) => f.path === "bundle.md").text;
  assert.match(md, /^object_type: information$/m);
  assert.match(md, /^current_state: collected$/m);
  assert.match(md, new RegExp(`^id: ${real.bundleId}$`, "m"));
  assert.match(md, new RegExp(`^content_hash: sha256:${k.sha256}$`, "m"));
  const prov = JSON.parse(real.files.find((f) => f.path === "data/provenance.json").text);
  assert.deepEqual(prov, { documents: [a.document] });
  assert.equal(a.document.capture.actor, "ann");
  assert.deepEqual(real.files.find((f) => f.path === a.document.file), { path: a.document.file, blobSha: k.sha256, sha256: k.sha256, bytes: k.bytes });
  assert.deepEqual(real.register, [{ sha256: k.sha256, path: a.document.file, encoding: "binary", bytes: k.bytes }]);
  assert.equal(JSON.stringify(promotion.seen).includes("knocker@example.org"), false, "no contact reaches the bundle (capture R70)");
  /* the knock is pulled by the puller, with its receipt */
  assert.deepEqual([r.state(k.knockId).status, r.state(k.knockId).pulled_by], ["pulled", "ann"]);
  assert.equal(provenanceOf(r.ctx).registerHolds({ sha: k.sha256 }).acquired, true);
  assert.equal(homes, 0, "a fresh pull promotes; it does not look for a home");
});

test("R7 (N380, K559; capture R65): the pull and its promotion are one act — a promotion that refuses, or throws, leaves neither written (the knock as it was, no receipt, no actor, no bundle, no id drawn), and the next pull files it; a fault's message is not carried", async () => {
  for (const [fault, reason, status] of [[{ ok: false, reason: "PROMOTE_REFUSED_HERE", detail: "raced" }, "PROMOTE_REFUSED_HERE", undefined],
                                         ["throw", "PULL_WITHIN_FAILED", 500]]) {
    const r = await record();
    const k = await r.knock(`one act ${JSON.stringify(fault)}`);
    /* the first promotion fails; every later one lands */
    const promotion = promotionStandIn(r, (i) => (i === 0 ? fault : true));
    const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: provenanceOf(r.ctx) };
    const who = { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann" };
    const first = await P.pullAndFile(deps, who);
    assert.deepEqual([first.ok, first.reason, first.status, first.knockId], [false, reason, status, k.knockId]);
    assert.equal(JSON.stringify(first).includes("a store fault"), false, "a fault's message is not carried");
    /* N419: a fault answers capture's fixed sentence (capture R65), never the thrown message */
    if (fault === "throw") assert.equal(first.detail, PULL_WITHIN_FAILED_DETAIL);
    assert.deepEqual(heldOf(r, k.knockId, k.sha256), { status: "new", capture_sha: null, pulled_by: null, receipt: false, home: null },
                     "the pull was rolled back with its promotion");
    assert.deepEqual(standinWrites(r), [], "no bundle filed");
    /* a pull made again is a new pull: it files the knock, and the id the failed promotion drew was rolled back with it */
    const again = await P.pullAndFile(deps, who);
    assert.deepEqual([again.ok, again.existed], [true, false], JSON.stringify(again).slice(0, 300));
    assert.equal(again.bundle.bundleId, promotion.seen.at(-1).bundleId);
    assert.match(again.bundle.bundleId, /-0001-doorbell-knock$/);
    assert.deepEqual(standinWrites(r), [again.bundle.bundleId]);
    assert.deepEqual([r.state(k.knockId).status, provenanceOf(r.ctx).registerHolds({ sha: k.sha256 }).acquired], ["pulled", true]);
  }
});

test("R7 (N364, K559): a pulled knock no bundle holds (pulled through capture's own route) is promoted by the door's pull — a promotion that fails then says so and leaves the knock pulled, the next pull files it; once a bundle holds the capture, a pull answers that bundle and promotes nothing", async () => {
  for (const fault of ["throw", { ok: false, reason: "PROMOTE_FAILED", detail: "raced" }]) {
    const r = await record();
    const k = await r.knock(`residue ${JSON.stringify(fault)}`);
    const pulledAround = await captureOf(r.ctx).pullKnock({ knockId: k.knockId, by: "bea" });
    assert.equal(pulledAround.ok, true);
    let home = null;
    const promotion = promotionStandIn(r, (i) => (i === 0 ? fault : true));
    const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: { homeOf: () => home } };
    const who = { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann" };
    const first = await P.pullAndFile(deps, who);
    assert.deepEqual([first.ok, first.reason, first.knockId], [false, "PROMOTE_FAILED", k.knockId]);
    assert.match(first.detail, /already brought in/);
    assert.equal(JSON.stringify(first).includes("a store fault"), false, "a fault's message is not carried");
    assert.deepEqual(standinWrites(r), [], "no bundle filed");
    assert.deepEqual([r.state(k.knockId).status, r.state(k.knockId).pulled_by], ["pulled", "bea"], "the earlier pull stands");
    /* a repeated pull: capture answers existed with its document, no bundle holds the capture, so it is promoted */
    const again = await P.pullAndFile(deps, who);
    assert.deepEqual([again.ok, again.existed], [true, true]);
    assert.equal(again.bundle.bundleId, promotion.seen.at(-1).bundleId);
    assert.deepEqual(standinWrites(r), [again.bundle.bundleId]);
    assert.deepEqual(JSON.parse(promotion.seen.at(-1).files.find((f) => f.path === "data/provenance.json").text).documents[0], again.document);
    /* negative control: once a bundle holds the capture, a pull answers it and promotes nothing */
    home = { bundleId: again.bundle.bundleId };
    const asked = promotion.seen.length;
    const third = await P.pullAndFile(deps, who);
    assert.deepEqual([third.ok, third.existed, third.bundle], [true, true, { bundleId: again.bundle.bundleId, bundleSha: null, existed: true }]);
    assert.equal(promotion.seen.length, asked);
  }
});
