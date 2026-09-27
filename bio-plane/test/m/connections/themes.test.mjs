/* connections: themes (R39–R48; C-81, R35) and the module's outward text (R37). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { THEME_CHECKS, THEME_ID_RE, THEME_WITHDRAW_CHECKS, themeLegFindings, THEME_READ_LIMIT_DEFAULT,
         THEME_READ_LIMIT_MAX } from "../../../src/connections/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const CAP = 131072;

function setup() {
  const w = world();
  w.member("alice"); w.member("bob"); w.member("root", { role: "admin" });
  const [a] = w.doc(A, ["a"]); w.doc(B, ["b"]);
  const t = w.k.declareTheme({ name: "Deferred maintenance", test: "the document names a repair put off", declarer: "alice" });
  return { w, a, t };
}

test("R39, R35: declare refuses C-81.2 machine or absent, C-81.3 no test, C-81.4 no name, C-81.5 over the cap; else a new theme, as written, with says", () => {
  const w = world();
  w.member("alice");
  const r2 = w.k.declareTheme({ name: "n", test: "t", declarer: MACHINE });
  assert.equal(r2.code, "THEME_NOT_A_MEMBER"); assert.equal(r2.check, "C-81.2");
  assert.equal(w.k.declareTheme({ name: "n", test: "t" }).check, "C-81.2");
  assert.equal(w.k.declareTheme({ name: "n", test: "   ", declarer: "alice" }).check, "C-81.3");
  assert.equal(w.k.declareTheme({ name: "", test: "t", declarer: "alice" }).check, "C-81.4");
  const big = w.k.declareTheme({ name: "n", test: "x".repeat(CAP + 1), declarer: "alice" });
  assert.equal(big.check, "C-81.5"); assert.equal(big.limit, CAP);
  assert.equal(w.count("themes"), 0, "each refusal writes nothing");
  const ok = w.k.declareTheme({ name: "  Two spaces ", test: "exactly\nas written", declarer: "alice" });
  assert.equal(ok.ok, true); assert.match(ok.theme_id, THEME_ID_RE);
  assert.equal(ok.name, "  Two spaces "); assert.equal(ok.test, "exactly\nas written");
  assert.equal(ok.declared_by_handle, "h_alice"); assert.equal(ok.evidence, false);
  assert.match(ok.says, /never the basis of a claim/);
  assert.equal(w.k.declareTheme({ name: "x".repeat(CAP), test: "t", declarer: "alice" }).ok, true, "at the cap is admitted");
  for (const c of Object.values(THEME_CHECKS)) assert.ok(c.translation && /^C-81\.\d+$/.test(c.check));
});

test("R40, R35: place refuses C-81.7, C-81.6, C-81.8, C-81.9 in order; records membership D, confirms a hunch keeping the proposal, already writes nothing", () => {
  const { w, a, t } = setup();
  assert.equal(w.k.placeInTheme({ theme: t.theme_id, target: A, placer: MACHINE, viewer: MACHINE }).check, "C-81.7");
  assert.equal(w.k.placeInTheme({ theme: "THEME-2026-0101-ff", target: A, placer: "bob", viewer: V("bob") }).check, "C-81.6");
  assert.equal(w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: "nobody" }).check, "C-81.6",
               "a viewer the gate does not recognise answers as no theme");
  assert.equal(w.k.placeInTheme({ theme: t.theme_id, target: "INFO-2026-0404-z", placer: "bob", viewer: V("bob") }).check, "C-81.8");
  assert.equal(w.k.placeInTheme({ theme: t.theme_id, target: A, note: "x".repeat(CAP + 1), placer: "bob", viewer: V("bob") }).check, "C-81.9");
  assert.equal(w.count("theme_placements"), 0);
  const cid = w.mint(A, a, { kind: "pdf-page", page: 1 });
  const p = w.k.proposeForTheme({ theme: t.theme_id, target: cid, note: "looks like it", proposer: MACHINE, viewer: MACHINE });
  assert.equal(p.state, "hunch"); assert.equal(p.grade, "C"); assert.equal(p.target_kind, "content"); assert.equal(p.document, A);
  const c = w.k.placeInTheme({ theme: t.theme_id, target: cid, note: "it does", placer: "bob", viewer: V("bob") });
  assert.equal(c.confirmed_hunch, true); assert.equal(c.state, "member"); assert.equal(c.grade, "D");
  assert.equal(c.proposed_by, MACHINE); assert.equal(c.proposal_note, "looks like it"); assert.equal(c.note, "it does");
  const d = w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: V("bob") });
  assert.equal(d.state, "member"); assert.equal(d.target_kind, "document"); assert.equal(d.confirmed_hunch, false);
  const again = w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "alice", viewer: V("alice") });
  assert.equal(again.already, true); assert.equal(again.placed_by_handle, "h_bob", "the first placer stands");
  assert.match(again.says, /nothing changed/);
});

test("R41: propose refuses C-81.10 with no proposer, then as R40; records a hunch C; never demotes membership", () => {
  const { w, t } = setup();
  const r = w.k.proposeForTheme({ theme: t.theme_id, target: A, viewer: MACHINE });
  assert.equal(r.code, "THEME_NO_PROPOSER"); assert.equal(r.check, "C-81.10");
  assert.equal(w.k.proposeForTheme({ theme: "THEME-2026-0101-ff", target: A, proposer: MACHINE, viewer: MACHINE }).check, "C-81.6");
  assert.equal(w.k.proposeForTheme({ theme: t.theme_id, target: "x", proposer: MACHINE, viewer: MACHINE }).check, "C-81.8");
  const h = w.k.proposeForTheme({ theme: t.theme_id, target: A, proposer: "class:ai/tok1", viewer: MACHINE });
  assert.equal(h.hunch, true); assert.equal(h.membership, false); assert.equal(h.already, false);
  assert.equal(w.k.proposeForTheme({ theme: t.theme_id, target: A, proposer: "bob", viewer: V("bob") }).already, true);
  w.k.placeInTheme({ theme: t.theme_id, target: B, placer: "bob", viewer: V("bob") });
  const m = w.k.proposeForTheme({ theme: t.theme_id, target: B, proposer: MACHINE, viewer: MACHINE });
  assert.equal(m.already, true); assert.equal(m.state, "member");
});

test("R42: the list reads every theme for any recognised viewer, narrowed by q, newest first, bounded (default 200, max 2,000)", () => {
  const w = world();
  w.member("alice");
  const ids = [];
  for (let i = 0; i < 3; i++) ids.push(w.k.declareTheme({ name: `Theme ${i}`, test: i === 1 ? "Mentions PARKING" : "t", declarer: "alice" }).theme_id);
  const all = w.k.readThemes({ viewer: V("zed") });
  assert.equal(all.themes.length, 3); assert.equal(all.limit, THEME_READ_LIMIT_DEFAULT); assert.equal(all.truncated, false);
  assert.deepEqual(Object.keys(all.themes[0]).sort(), ["at", "declared_by_handle", "name", "test", "theme_id"]);
  assert.deepEqual(w.k.readThemes({ q: "parking", viewer: V("zed") }).themes.map((t) => t.theme_id), [ids[1]]);
  const one = w.k.readThemes({ limit: 1, viewer: V("zed") });
  assert.equal(one.themes.length, 1); assert.equal(one.truncated, true);
  assert.equal(w.k.readThemes({ limit: 0, viewer: V("zed") }).limit, 200);
  assert.equal(w.k.readThemes({ limit: "x", viewer: V("zed") }).limit, 200);
  assert.equal(w.k.readThemes({ limit: -5, viewer: V("zed") }).limit, 1);
  assert.equal(w.k.readThemes({ limit: 99999, viewer: V("zed") }).limit, THEME_READ_LIMIT_MAX);
  const shut = w.k.readThemes({ viewer: null });
  assert.deepEqual(shut.themes, []); assert.equal(shut.truncated, false);
  const sorted = [...all.themes].sort((x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : x.theme_id < y.theme_id ? -1 : 1));
  assert.deepEqual(all.themes.map((t) => t.theme_id), sorted.map((t) => t.theme_id));
});

test("R43: the placer or an administrator withdraws a membership, any member rejects a hunch, with a reason; kept with who, when, why; a later placement is afresh", () => {
  const { w, t } = setup();
  w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: V("bob") });
  w.k.proposeForTheme({ theme: t.theme_id, target: B, note: "maybe", proposer: MACHINE, viewer: MACHINE });
  const base = { theme: t.theme_id, target: A, reason: "not a repair after all", viewer: V("alice") };
  assert.equal(w.k.withdrawFromTheme({ ...base, actor: MACHINE }).check, THEME_WITHDRAW_CHECKS.THEME_WITHDRAW_NOT_A_MEMBER.check);
  assert.equal(w.k.withdrawFromTheme({ ...base, theme: "THEME-2026-0101-ff", actor: "alice" }).check, "C-81.6");
  assert.equal(w.k.withdrawFromTheme({ ...base, target: "INFO-2026-0404-z", actor: "alice" }).check, "C-81.8");
  assert.equal(w.k.withdrawFromTheme({ ...base, reason: "", actor: "alice" }).code, "THEME_WITHDRAW_NO_REASON");
  assert.equal(w.k.withdrawFromTheme({ ...base, reason: "x".repeat(CAP + 1), actor: "alice" }).check, "C-81.9");
  assert.equal(w.k.withdrawFromTheme({ ...base, actor: "alice" }).code, "THEME_WITHDRAW_NOT_THE_PLACER");
  assert.equal(w.count("theme_placement_acts"), 0);
  const byAdmin = w.k.withdrawFromTheme({ ...base, actor: "root", administer: "1" });
  assert.equal(byAdmin.ok, true); assert.equal(byAdmin.state, "withdrawn");
  assert.equal(byAdmin.membership, false); assert.equal(byAdmin.hunch, false);
  assert.equal(byAdmin.reason, "not a repair after all"); assert.equal(byAdmin.ended_by, "root"); assert.ok(byAdmin.ended_at);
  assert.equal(byAdmin.placed_by, "bob", "the acts before it are kept");
  assert.equal(w.k.withdrawFromTheme({ ...base, actor: "root", administer: "1" }).code, "THEME_WITHDRAW_NOTHING_STANDING");
  const rej = w.k.withdrawFromTheme({ theme: t.theme_id, target: B, reason: "wrong", actor: "alice", viewer: V("alice") });
  assert.equal(rej.state, "rejected"); assert.equal(rej.proposal_note, "maybe");
  const read = w.k.readThemes({ id: t.theme_id, viewer: V("alice") });
  assert.equal(read.members.length, 0); assert.equal(read.hunches.length, 0);
  assert.deepEqual(read.withdrawn.map((x) => [x.target, x.state]).sort(), [[A, "withdrawn"], [B, "rejected"]]);
  const re = w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "alice", viewer: V("alice") });
  assert.equal(re.already, false); assert.equal(re.state, "member");
  assert.equal(w.k.readThemes({ id: t.theme_id, viewer: V("alice") }).withdrawn.length, 2, "recorded afresh beside it");
  /* The placer may withdraw their own. */
  assert.equal(w.k.withdrawFromTheme({ ...base, actor: "alice" }).ok, true);
  for (const c of Object.values(THEME_WITHDRAW_CHECKS)) assert.ok(c.translation && c.check.startsWith("C-81."));
});

test("R44: one theme — C-81.6 for an unknown id or viewer; members and hunches apart, each by target and bounded, gated per placement, never counted when hidden", () => {
  const { w, t } = setup();
  assert.equal(w.k.readThemes({ id: "THEME-2026-0101-ff", viewer: V("bob") }).check, "C-81.6");
  assert.equal(w.k.readThemes({ id: t.theme_id, viewer: "nobody" }).check, "C-81.6");
  w.k.placeInTheme({ theme: t.theme_id, target: B, placer: "bob", viewer: V("bob") });
  w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: V("bob") });
  w.k.proposeForTheme({ theme: t.theme_id, target: "INFO-2026-0404-z", proposer: MACHINE, viewer: MACHINE });
  const [c3] = w.doc("INFO-2026-0003-c", ["c"]);
  w.k.proposeForTheme({ theme: t.theme_id, target: "INFO-2026-0003-c", proposer: MACHINE, viewer: MACHINE });
  const r = w.k.readThemes({ id: t.theme_id, viewer: V("bob") });
  assert.deepEqual(r.members.map((m) => m.target), [A, B]);
  assert.deepEqual(r.hunches.map((m) => m.target), ["INFO-2026-0003-c"]);
  assert.deepEqual(Object.keys(r.members[0]).sort(), ["document", "grade", "hunch", "membership", "note", "placed_at",
    "placed_by_handle", "proposal_note", "proposed_at", "proposed_by_handle", "state", "target", "target_kind"].sort());
  const lim = w.k.readThemes({ id: t.theme_id, limit: 1, viewer: V("bob") });
  assert.equal(lim.members.length, 1); assert.equal(lim.members_truncated, true); assert.equal(lim.hunches_truncated, false);
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, B);
  const hid = w.k.readThemes({ id: t.theme_id, viewer: V("bob") });
  assert.deepEqual(hid.members.map((m) => m.target), [A]);
  assert.equal(JSON.stringify(hid).includes(B), false);
  assert.match(hid.says, /1 member\(s\) you can see/); assert.match(hid.says, /hunches|hunch\(es\)/);
  assert.ok(c3);
});

test("R45: every reading and says shows the handle, never the member id or cover, except with the affirmative administer stamp; a machine is itself", () => {
  const { w, t } = setup();
  w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: V("bob") });
  w.k.proposeForTheme({ theme: t.theme_id, target: B, proposer: MACHINE, viewer: MACHINE });
  for (const administer of [null, "0", "true", false]) {
    const r = w.k.readThemes({ id: t.theme_id, viewer: V("alice"), administer });
    const text = JSON.stringify(r);
    assert.equal(r.declared_by_handle, "h_alice"); assert.equal("declared_by" in r, false);
    assert.equal(text.includes("Cover "), false); assert.equal(/"(placed_by|declared_by)":"(alice|bob)"/.test(text), false);
    assert.equal(r.hunches[0].proposed_by, MACHINE); assert.equal(r.hunches[0].proposed_by_handle, null);
  }
  const adm = w.k.readThemes({ id: t.theme_id, viewer: V("root"), administer: "1" });
  assert.equal(adm.declared_by, "alice"); assert.equal(adm.declared_by_cover, "Cover alice");
  assert.equal(adm.members[0].placed_by, "bob"); assert.equal(adm.members[0].placed_by_cover, "Cover bob");
  const says = w.k.placeInTheme({ theme: t.theme_id, target: "INFO-2026-0002-b", placer: "bob", viewer: V("bob") }).says;
  assert.match(says, /h_bob/); assert.doesNotMatch(says, /on bob's/);
  const w2 = world();
  w2.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('nh','c','member','active','t','t')`);
  const nh = w2.k.declareTheme({ name: "n", test: "t", declarer: "nh" });
  assert.equal(nh.declared_by_handle, null); assert.match(nh.says, /whose handle is not recorded/);
});

test("R46: themeLegFindings — a leg naming a theme, a membership in one, or carrying theme/themes gets one C-81.1 error and true; any other leg false; never throws", () => {
  const cases = [
    [{ target: "THEME-2026-0927-abc123" }, true], [{ content_id: "THEME-2026-0927-abc123" }, true],
    [{ target: "THEME-2026-0927-abc123#INFO-2026-0001-a" }, true], [{ target: "THEME-2026-0927-abc123/x" }, true],
    [{ target: "THEME-2026-0927-abc123:x" }, true], [{ target: "THEME-2026-0927-abc123?x" }, true],
    [{ target: A, theme: "THEME-2026-0927-abc123" }, true], [{ target: A, themes: ["x"] }, true],
    [{ target: A }, false], [{ target: A, theme: "" }, false], [{ target: A, themes: [] }, false], [null, false], ["x", false],
  ];
  for (const [leg, expected] of cases) {
    const findings = [];
    assert.equal(themeLegFindings("basis[0]", leg, findings), expected, JSON.stringify(leg));
    assert.equal(findings.length, expected ? 1 : 0);
    if (expected) {
      assert.equal(findings[0].check, "C-81.1"); assert.equal(findings[0].severity, "error");
      assert.equal(findings[0].code, "THEME_NOT_EVIDENCE"); assert.ok(findings[0].repairs && findings[0].repairs.length);
    }
  }
});

test("R47: a theme is never evidence or an entity — its id is no bundle, content or entity id; no theme act writes a bundle, content, entity, edge or connection", () => {
  const { w, t } = setup();
  assert.match(t.theme_id, THEME_ID_RE);
  assert.doesNotMatch(t.theme_id, /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS)-/); assert.doesNotMatch(t.theme_id, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(t.theme_id, /^ENT-/);
  const watched = ["bundles", "files", "content", "entities", "resolutions", "refs", "connections", "asserted_connections"];
  const before = w.snapshot(watched);
  w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: V("bob") });
  w.k.proposeForTheme({ theme: t.theme_id, target: B, proposer: MACHINE, viewer: MACHINE });
  w.k.withdrawFromTheme({ theme: t.theme_id, target: B, reason: "no", actor: "bob", viewer: V("bob") });
  w.k.declareTheme({ name: "n2", test: "t2", declarer: "bob" });
  assert.deepEqual(w.snapshot(watched), before);
  assert.equal(w.k.derive({ entityId: t.theme_id }).count, 0, "no derivation runs through a theme");
});

test("R48: a theme is never rewritten; at most one placement stands per (theme, target); only a member's placement makes a hunch membership", () => {
  const { w, t } = setup();
  const before = w.row(`SELECT * FROM themes WHERE theme_id=?`, t.theme_id);
  w.k.proposeForTheme({ theme: t.theme_id, target: A, proposer: MACHINE, viewer: MACHINE });
  w.k.proposeForTheme({ theme: t.theme_id, target: A, proposer: "bob", viewer: V("bob") });
  assert.equal(w.row(`SELECT state FROM theme_placements WHERE target=?`, A).state, "hunch", "no proposal makes membership");
  w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "bob", viewer: V("bob") });
  w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "alice", viewer: V("alice") });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM theme_placements WHERE theme_id=? AND target=?`, t.theme_id, A).n, 1);
  assert.deepEqual(w.row(`SELECT * FROM themes WHERE theme_id=?`, t.theme_id), before);
  assert.equal(typeof w.k.renameTheme, "undefined");
});

test("R37: no place is named in this module's behaviour or outward text", async () => {
  const { w, a, t } = setup();
  w.entity("ENT-2026-0001", "The Ordinance");
  w.resolve(a, A, "Ord. 1", "ENT-2026-0001", "A");
  const [b] = [w.rows(`SELECT capture_sha FROM register WHERE bundle_id=?`, B)[0].capture_sha];
  w.resolve(b, B, "Ord. 1", "ENT-2026-0001", "B");
  const out = [
    w.k.derive({ entityId: "ENT-2026-0001" }), w.k.read({ entityId: "ENT-2026-0001", viewer: V("bob") }),
    w.k.portionGrade({ contentId: w.mint(A, a, { kind: "pdf-page", page: 1 }), viewer: V("bob") }),
    w.k.choose({ capture: a, other: b, entity: "ENT-2026-0001", ref: "nope", author: "bob", viewer: V("bob") }),
    w.k.readThemes({ id: t.theme_id, viewer: V("bob") }), w.k.projectLinks({ sourceCapture: a, viewer: MACHINE }),
    w.k.backlinks({ target: A, viewer: V("bob") }), w.k.asserted({ bundleId: A, viewer: V("bob") }),
    w.k.derivationStatement("ENT-2026-0001"),
  ];
  const text = JSON.stringify(out) + JSON.stringify(THEME_WITHDRAW_CHECKS);
  for (const place of ["Oakland", "Alameda", "California", "Legistar", "Granicus"]) assert.equal(text.includes(place), false, place);
});
