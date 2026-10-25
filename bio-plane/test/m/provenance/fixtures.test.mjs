/* provenance's published fixtures (`fixtures.mjs`): each is made by the real code when this runs, and each test calls
   it and checks the real answer (K4990, K4995). Requirements: R4 (homeOf), R5 (registerHolds), R11 (registeredFor),
   R78 (partsOf), the version chain's C-24.2 refusal. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { heldParts, holdsOf, holdsWorld, holdsRegister, homeOf, homeOfEmpty, homeOfHomed, homeOfWorld, provenanceOver,
         registeredHomes, versionChainNoSuchVersion } from "./fixtures.mjs";

const S = sha("a capture"), T = sha("another capture");

test("fixtures heldParts: partsOf of a registered multi-part capture is its parts in order; null for an unregistered digest", () => {
  const parts = [{ sha256: sha("p0"), bytes: 8 }, { sha256: sha("p1"), bytes: 5 }];
  const h = heldParts(sha("whole"), parts);
  assert.deepEqual(h.partsOf(sha("whole")), parts);
  assert.equal(h.partsOf(sha("unregistered")), null);
  assert.equal(h.partsOf(sha("p0")), null, "a part is no capture");
});

test("fixtures holdsOf: registerHolds answers the stated state of registered and acquired", () => {
  for (const [registered, acquired] of [[false, false], [true, false], [false, true], [true, true]])
    assert.deepEqual(holdsOf({ sha: S, registered, acquired }), { ok: true, sha: S, asked: true, registered, acquired }, `${registered} ${acquired}`);
  assert.deepEqual(holdsWorld({ [S]: { registered: true }, [T]: { acquired: true } }).registerHolds({ sha: T }),
                   { ok: true, sha: T, asked: true, registered: false, acquired: true });
});

test("fixtures holdsRegister: registerHolds, registeredFor and containerResolver over seeded captures", () => {
  const h = holdsRegister({ registered: [S], acquired: [T] });
  assert.deepEqual(h.registerHolds({ sha: S }), { ok: true, sha: S, asked: true, registered: true, acquired: false });
  assert.deepEqual(h.registerHolds({ sha: T }), { ok: true, sha: T, asked: true, registered: false, acquired: true });
  assert.deepEqual(h.registeredFor("INFO-2026-0001-seeded").map((r) => r.capture_sha), [S]);
  const r = h.containerResolver();
  assert.deepEqual([r.holds(S), r.holds(T), r.holds(sha("none"))], [true, true, false]);
});

test("fixtures homeOf: the home of a registered capture, null where nothing registered it", () => {
  const home = homeOf({ capture: { sha: S, path: "snapshots/a.txt", bytes: 7, encoding: "utf8" }, bundleId: "INFO-2026-0007-x" });
  assert.deepEqual({ ...home, registered: typeof home.registered }, { bundleId: "INFO-2026-0007-x", path: "snapshots/a.txt", encoding: "utf8",
                                                                      bytes: 7, registered: "string", authored: false });
  assert.equal(homeOf({ capture: { sha: S }, registered: false }), null);
});

test("fixtures homeOfEmpty: homeOf answers null over an empty store", () => {
  assert.equal(homeOfEmpty().homeOf(S), null);
});

test("fixtures homeOfHomed: each named capture is homed in its bundle; an unnamed one is not", () => {
  const p = homeOfHomed({ [S]: "INFO-2026-0001-a", [T]: "INFO-2026-0001-a", [sha("third")]: "INFO-2026-0002-b" });
  assert.deepEqual([S, T, sha("third")].map((s) => p.homeOf(s)?.bundleId), ["INFO-2026-0001-a", "INFO-2026-0001-a", "INFO-2026-0002-b"]);
  assert.equal(p.homeOf(sha("unnamed")), null);
});

test("fixtures homeOfWorld: the real homeOf behind a call counter, with a home or none", () => {
  const homed = homeOfWorld({ sha: S, bundleId: "INFO-2026-0003-w" });
  assert.equal(homed.calls(), 0);
  assert.equal(homed.provenance.homeOf(S).bundleId, "INFO-2026-0003-w");
  assert.equal(homed.provenance.homeOf(T), null);
  assert.equal(homed.calls(), 2);
  assert.equal(homeOfWorld({ sha: S }).provenance.homeOf(S), null);
});

test("fixtures provenanceOver: the real provenance over the user's own record-core, membership and promotion", () => {
  const w = world();
  const p = provenanceOver({ host: { storage: w.st, other: true }, record: w.record, membership: w.membership, promotion: w.promotion,
                             now: () => w.clock.now });
  assert.notEqual(p, w.prov, "an instance of its own, over the user's modules");
  assert.equal(p.homeOf(S), null);
  assert.deepEqual(p.registerHolds({ sha: S }), { ok: true, sha: S, asked: true, registered: false, acquired: false });
  assert.equal(p.recordReceipt({ address: "https://e.org/a", addressNorm: "e.org/a", captureSha: S }).recorded, true);
  assert.equal(p.registerHolds({ sha: S }).acquired, true);
  assert.equal(p.receiptsOfCapture({ captureSha: S }).rows.length, 1);
  assert.deepEqual(p.capturesOf("INFO-none"), []);
});

test("fixtures registeredHomes: register promotes a bundle with a register document; homeOf and onTestimony are the real ones", () => {
  const h = registeredHomes();
  assert.equal(h.provenance.homeOf(S), null, "empty until registered");
  const r = h.register(S, { bundleId: "INFO-2026-0004-r", path: "snapshots/r.bin" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(h.provenance.homeOf(S).bundleId, "INFO-2026-0004-r");
  assert.deepEqual(h.provenance.onTestimony("capture", { check: () => null }), { ok: true, module: "capture" });
  /* the user's own record, membership and promotion */
  const w = world();
  const own = registeredHomes({ host: { storage: w.st, mine: true }, record: w.record, membership: w.membership, promotion: w.promotion,
                                now: () => w.clock.now });
  assert.equal(own.register(T, { bundleId: "INFO-2026-0005-o" }).ok, true);
  assert.equal(own.provenance.homeOf(T).bundleId, "INFO-2026-0005-o");
  assert.equal(w.record.head("INFO-2026-0005-o") !== null, true, "promoted into the user's record");
});

test("fixtures versionChainNoSuchVersion: VERSION_CHAIN_NO_SUCH_VERSION with its check C-24.2", () => {
  const r = versionChainNoSuchVersion();
  assert.deepEqual([r.ok, r.reason, r.check], [false, "VERSION_CHAIN_NO_SUCH_VERSION", "C-24.2"]);
  assert.equal(typeof r.translation, "string");
});
