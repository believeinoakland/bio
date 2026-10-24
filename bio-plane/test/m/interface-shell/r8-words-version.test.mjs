/* interface-shell R128 (fix round 8, G114; K4814 (1), K4817): the words request names the release, the viewer's language and the team's
   adoptions stamp in `v`, as `<release>~<language>~<stamp>`. `loadWords` is sent at `whoami`'s answer and `bootstrap` (which carries the
   language and the stamp, instance-setup R103) after the screen's first reads (R122), so a load before `bootstrap` has answered names
   the release alone, and the shell keeps what `bootstrap` answered on the device (`cs-words:<member>`) for the loads that follow. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refused, ADMIN, MEMBER } from "./harness.mjs";

const held = { id: "held", words: [], reads: () => ({ h: { op: "heldcaptures", query: { limit: "5" } } }), acts: [],
  render: (cs, view) => cs.state("h", view, () => '<p id="seen">held</p>') };
const REL = "0.86.0";
const plane = (more = {}) => ({ heldcaptures: ok({ items: [{ id: "h1" }] }), ...more });
const page = (more = {}, o = {}) => boot({ screens: [held], path: "/app/held", version: REL, plane: plane(more), ...o });
const vs = (p) => p.byOp("interfacewords").map((r) => r.query.v);
const boots = (language, words_version) => ({ bootstrap: ok({ ok: true, test_instance: false, language, words_version }) });
const NOTE = (member, l, s) => ({ ["cs-words:" + member]: JSON.stringify({ l, s }) });

test("R128 a first load of a member the device holds no note of names the release alone; once bootstrap answers, the full v is asked and the note kept", async () => {
  const p = await page(boots("es", "st1"));
  assert.deepEqual(vs(p), [REL, REL + "~es~st1"], "the release alone first, then all three");
  assert.deepEqual(JSON.parse(p.local.get("cs-words:mai")), { l: "es", s: "st1" });
  assert.ok(p.byOp("interfacewords").every((r) => r.query.language === undefined), "never a `language` field: that asks every word");
});

test("R128 a load whose device holds the member's note names the release, the language and the stamp at once, and asks no second time", async () => {
  const p = await page(boots("es", "st1"), { local: NOTE("mai", "es", "st1") });
  assert.deepEqual(vs(p), [REL + "~es~st1"]);
});

test("R128 a language change or a changed stamp changes v; a null language is an empty part", async () => {
  const a = await page(boots("fr", "st1"), { local: NOTE("mai", "es", "st1") });
  assert.deepEqual(vs(a), [REL + "~es~st1", REL + "~fr~st1"], "the language changed");
  const b = await page(boots("es", "st2"), { local: NOTE("mai", "es", "st1") });
  assert.deepEqual(vs(b), [REL + "~es~st1", REL + "~es~st2"], "the stamp changed");
  const c = await page(boots(null, "st1"));
  assert.deepEqual(vs(c), [REL, REL + "~~st1"], "no language is an empty part");
  assert.deepEqual(JSON.parse(c.local.get("cs-words:mai")), { l: "", s: "st1" });
});

test("R128 another member's note is not used; control: a bootstrap that names no stamp, fails or answers no session keeps the release alone and writes no note", async () => {
  const other = await page(boots("es", "st1"), { local: NOTE("rosa", "de", "zz"), plane: { whoami: ok(MEMBER) } });
  assert.equal(vs(other)[0], REL, "rosa's note is not mai's");
  for (const [name, more] of [["no stamp", { bootstrap: ok({ ok: true, test_instance: false }) }], ["refused", { bootstrap: refused("X") }]]) {
    const p = await page(more);
    assert.deepEqual(vs(p), [REL], name);
    assert.ok(!p.local.has("cs-words:mai"), name);
  }
});

test("R128 a page that names no release sends no v, with or without a note; storage that denies every use renders and asks the release alone", async () => {
  const bare = await boot({ screens: [held], path: "/app/held", local: NOTE("mai", "es", "st1"), plane: plane(boots("es", "st1")) });
  assert.deepEqual(vs(bare), [undefined]);
  const denied = await page(boots("es", "st1"), { localThrows: true, local: {} });
  assert.equal(denied.doc.getElementById("seen").textContent, "held");
  assert.equal(vs(denied)[0], REL);
});
