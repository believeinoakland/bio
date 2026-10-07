/* public-read — R30 (DEC-146 (1)–(3); K1774, N660): the credit page, `creditPage()` and `op=credit` through the door.
   Its answer is exactly `{ok: true, name: "Civicsmith", description, who}` with DEC-146's two lines; it is served with no
   credential, asks no store and reads nothing of the group's record, so every group and every caller gets the same
   bytes; no other line describing Civicsmith is served on the public path; it names no place and writes nothing.
   Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, publishedSix } from "./fixture.mjs";
import { creditPage, CIVICSMITH_DESCRIPTION, CIVICSMITH_WHO } from "../../../src/public-read/credit.mjs";
import { publicReadDoorOp, PUBLIC_READ_DOOR_OPS } from "../../../src/public-read/door.mjs";
import { PUBLIC_READ_OWN_OPS } from "../../../src/public-read/reads.mjs";

const DESCRIPTION = "Free software for groups that check whether government keeps its own rules and promises.";
const WHO = "Neighbourhood and issue groups, newsrooms, professional associations, and public offices checking their own work.";
const EXPECTED = { ok: true, name: "Civicsmith", description: DESCRIPTION, who: WHO };

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const fail = () => { throw new Error("the credit page asked the store"); };
const HELPERS = { json, requiredArgument: fail, storeSilent: fail, storeRefusal: fail, doAnswer: fail };
/* A store that refuses to be asked: any fetch of it fails the test. */
const untouchable = () => { const s = { asked: 0, async fetch() { s.asked++; throw new Error("the store was asked"); } }; return s; };
const door = (q, env, stub, helpers = HELPERS) => {
  const url = new URL("https://plane/?op=credit");
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publicReadDoorOp("credit", url, env, stub, helpers);
};

test("R30 creditPage answers exactly {ok, name: Civicsmith, description, who} with DEC-146's two lines, held once as constants", () => {
  assert.deepEqual(creditPage(), EXPECTED);
  assert.deepEqual(Object.keys(creditPage()), ["ok", "name", "description", "who"], "no other key");
  assert.equal(CIVICSMITH_DESCRIPTION, DESCRIPTION);
  assert.equal(CIVICSMITH_WHO, WHO);
  assert.equal(creditPage().description, CIVICSMITH_DESCRIPTION, "the answer serves the one held line");
  assert.equal(creditPage().who, CIVICSMITH_WHO, "and the one held second line");
  /* negative control: a caller altering its copy changes nothing the next caller is served */
  const mine = creditPage();
  mine.description = "civic groups and other organisations";
  assert.deepEqual(creditPage(), EXPECTED);
});

test("R30 R10 op=credit is served by the door at 200 with no credential, asking no store, the same bytes for every group and every caller", async () => {
  assert.ok(PUBLIC_READ_DOOR_OPS.includes("credit"), "the door answers op=credit");
  assert.ok(PUBLIC_READ_OWN_OPS.includes("credit"), "no registered read may take its name");
  const groups = [world(), world()];
  groups[0].member("olive");
  groups[0].project("Parks", "olive");
  const bodies = [];
  for (const [env, stub] of [[{}, untouchable()], [{ PUBLISHED: null }, untouchable()],
                             [{ GROUP: "another" }, stubOf(groups[0])], [{}, stubOf(groups[1])]]) {
    for (const q of [{}, { token: "secret-token" }, { store: "scratch" }, { case: "CASE-2026-0001", name: "x" }]) {
      const r = await door(q, env, stub);
      assert.equal(r.status, 200);
      assert.match(r.headers.get("content-type"), /^application\/json/);
      const text = await r.text();
      assert.deepEqual(JSON.parse(text), EXPECTED);
      bodies.push(text);
    }
    if (typeof stub.asked === "number") assert.equal(stub.asked, 0, "no store was asked");
  }
  assert.equal(new Set(bodies).size, 1, "one answer, byte for byte, for every group and every caller");
  /* negative control: the door answers no other op this way, and an op not its own is null */
  const other = await publicReadDoorOp("credits", new URL("https://plane/?op=credits"), {}, untouchable(), HELPERS);
  assert.equal(other, null);
});

test("R30 no other line describing Civicsmith is served on the public path: the store side's public answers carry neither the narrow nor the vague wording", () => {
  const { w, CASE, F } = publishedSix();
  const outward = JSON.stringify([creditPage(), w.read("publishedmanifest"), w.read("publishedlist"),
    w.read("publishedcase", { id: CASE }), w.read("publishededitions", { id: F }), w.read("publishedcase", { id: "X" }), w.read("verify", { sha256: "0".repeat(64) }),
    w.read("publicread", { name: "nothing" }), w.read("publishededitions", {})]);
  assert.doesNotMatch(outward, /civic groups/i, "never \"civic groups\"");
  assert.doesNotMatch(outward, /and other organi[sz]ations/i, "never \"and other organisations\"");
  const lines = outward.match(/Free software[^"]*/g) || [];
  assert.deepEqual(lines, [DESCRIPTION], "the one description line, once, on the credit page");
  /* negative control: the matcher sees a narrow wording when one is served */
  assert.match(JSON.stringify({ d: "Free software for civic groups" }), /civic groups/i);
});

test("R30 R15 the credit page names no place and writes nothing", async () => {
  const text = JSON.stringify(creditPage());
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(text.includes(place), false, `names ${place}`);
  const w = world();
  w.member("olive");
  const before = JSON.stringify(w.snapshot());
  creditPage();
  await door({}, {}, stubOf(w));
  assert.equal(JSON.stringify(w.snapshot()), before, "the database is byte-identical");
  /* negative control: the snapshot does see a write */
  w.member("pat");
  assert.notEqual(JSON.stringify(w.snapshot()), before);
});
