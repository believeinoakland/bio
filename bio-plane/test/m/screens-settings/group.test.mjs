/* Settings › Your group at the module's interface (R18): every member reads it; an administrator's acts each send their
   owner's arguments; a member is drawn none. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, open, said } from "./kit.mjs";
import { ADMIN, MEMBER, env, groupTable } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const ALL = ["courtnoticeset", "groupdomainset", "grouplanguagesset", "grouplogoset", "groupnameset", "hostingaccessset", "strengthbarset"];

test("R18 group: what the group chose is drawn to every member; the acts only to an administrator (control: a member is drawn none)", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  for (const op of ["groupidentity", "grouplanguages", "courtnotice", "hostingaccess", "strengthbarof"]) assert.ok(a.p.all.some((r) => r.op === op), op);
  has(a, "screen.group.name.now", { name: "East Oakland Watch" });
  has(a, "screen.group.domain.verified", { domain: "eastoak.example", date: day("2026-10-03") });
  has(a, "screen.group.languages.now", { languages: "en, es" });
  has(a, "screen.group.court.tell");
  assert.ok(a.text.includes("Rosa and Lu"));
  assert.ok(a.text.includes("Most of our sources are records."));
  assert.deepEqual(ops(a), ALL);
  const m = await open("group", { me: MEMBER, table: groupTable() });
  assert.deepEqual(ops(m), [], "absent, not greyed");
  has(m, "screen.group.admins");
  has(m, "screen.group.name.now", { name: "East Oakland Watch" });
});

test("R18 group: groupnameset, groupdomainset, grouplanguagesset, courtnoticeset, hostingaccessset and strengthbarset (reasoned) send their owners' arguments", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  // a reason given wherever the shell asks one (its R11, by op-grades' rung)
  const body = async (op, values, data = {}) => { const r = await a.press(op, { values, data, reason: "as agreed" }); if (!r.sent.length) return null; const { reason, ...b } = r.sent[0].body; return op === "strengthbarset" ? r.sent[0].body : b; };
  assert.deepEqual(await body("groupnameset", { "gr-name": " East Oakland Watch Collective " }), { name: "East Oakland Watch Collective" });
  assert.equal(await body("groupnameset", { "gr-name": " " }), null);
  assert.equal(a.refused.key, "screen.group.name.empty");
  assert.deepEqual(await body("groupdomainset", { "gr-domain": "watch.example" }), { domain: "watch.example" });
  assert.deepEqual(await body("grouplanguagesset", { "gr-langs": "en es, vi" }), { languages: ["en", "es", "vi"] });
  assert.equal(await body("grouplanguagesset", { "gr-langs": "" }), null, "one at least");
  assert.equal(await body("grouplanguagesset", { "gr-langs": Array.from({ length: 21 }, (_, i) => "x" + i).join(" ") }), null, "twenty at most");
  assert.deepEqual(await body("courtnoticeset", { "gr-court-dont": true }), { choice: "dont" });
  assert.deepEqual(await body("courtnoticeset", { "gr-court-tell": true }), { choice: "tell" });
  assert.deepEqual(await body("hostingaccessset", { "gr-holders": "Rosa", "gr-hnote": "" }), { holders: "Rosa" });
  assert.deepEqual(await body("hostingaccessset", { "gr-holders": "Rosa", "gr-hnote": "vault" }), { holders: "Rosa", note: "vault" });
  assert.deepEqual(await body("strengthbarset", { "gr-cap": "A", "gr-con": "", "gr-why": "We publish only firsthand records." }), { capture: "A", connection: null, reason: "We publish only firsthand records." });
  assert.equal(await body("strengthbarset", { "gr-cap": "A", "gr-con": "", "gr-why": "" }), null, "reasoned: no reason, nothing sent");
  assert.equal(a.refused.key, "screen.group.bar.noreason");
  assert.equal(await body("strengthbarset", { "gr-cap": "", "gr-con": "", "gr-why": "x" }), null);
  assert.equal(a.s.acts.find((x) => x.op === "strengthbarset").reasonField, "reason");
});

test("R18 group: grouplogoset sends the chosen PNG or JPEG's own bytes as the body with its type, nothing in the address; another type sends nothing", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  const spec = a.s.acts.find((x) => x.op === "grouplogoset");
  const png = { type: "image/png", size: 1200, name: "logo.png" };
  const cs = { file: () => png };
  assert.deepEqual(spec.send({}, {}, cs), { raw: png, rawType: "image/png" });
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/jpeg", size: 1 }) }).rawType, "image/jpeg");
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/gif", size: 1 }) }), { refuse: "screen.group.logo.type" });
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/png", size: 200 * 1024 + 1 }) }), { refuse: "screen.group.logo.size" });
  assert.deepEqual(spec.send({}, {}, { file: () => null }), { refuse: "screen.group.logo.nofile" });
  const set = await open("group", { me: ADMIN, table: groupTable({ groupidentity: env({ group: "g", display_name: "G", logo: true }) }) });
  has(set, "screen.group.logo.set");
});
