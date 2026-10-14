/* screens-investigate R9: the member's own ties, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press } from "./fixtures.mjs";

const at = "/app/ties";

test("R9 reads memberties (her own ties, seen only by her and the administrators) and says why she is asked and who sees the list", async () => {
  const p = await open(at);
  assert.equal(p.byOp("memberties").length, 1);
  assert.deepEqual(Object.keys(p.byOp("memberties")[0].query), ["op"], "her own, as the plane stamps her");
  const m = main(p);
  assert.match(m.textContent, /Why you are asked.*trusted only if readers know/s);
  assert.match(m.textContent, /Inside the group: only you and the group's administrators\. Other members never see this list\./);
  const rows = m.querySelectorAll("tr.cs-r");
  assert.equal(rows.length, 2);
  assert.match(rows[0].textContent, /Employer.*East Bay Transit.*"a member of the group who worked on this case has this tie"/s);
  assert.match(rows[1].textContent, /Relative.*naming you: "mai, who worked on this case/s);
});

test("R9 declaretie \"Add this tie\": its kind, who, her words, and whether a case names her by her handle or says \"a member of the group\", the disclosure stated either way", async () => {
  const p = await open(at, { plane: { declaretie: ok({ ok: true, tie_id: "MTI-2026-0003" }) } });
  assert.match(main(p).textContent, /Either way the tie is disclosed to readers of the case\./);
  fill(p, { "tie-kind": "business", "tie-who": "ENT-2026-0702", "tie-note": "member-owner of Lakeshore Hardware Co-op", "tie-says-0": true, "tie-says-1": false });
  await press(p, "declaretie");
  assert.deepEqual(p.byOp("declaretie")[0].body, { entity: "ENT-2026-0702", kind: "business", note: "member-owner of Lakeshore Hardware Co-op", attribution: "name" });
  const q = await open(at, { plane: { declaretie: ok({ ok: true }) } });
  fill(q, { "tie-who": "ENT-2026-0702", "tie-note": "an interest" });
  await press(q, "declaretie");
  assert.equal(q.byOp("declaretie")[0].body.attribution, "group", "by default a case says \"a member of the group\"");
});

test("R9 withdrawtie \"Remove a tie\" from its row, with a reason (control: an unnamed tie sends nothing)", async () => {
  const p = await open(at, { plane: { withdrawtie: ok({ ok: true }) } });
  const row = main(p).querySelectorAll("tr.cs-r")[0];
  await p.click(row.querySelector('[data-shell="row"]'));
  await press(p, "withdrawtie", { within: main(p).querySelectorAll("tr.cs-r")[0].nextElementSibling, reason: "I left that job" });
  assert.deepEqual(p.byOp("withdrawtie")[0].body, { tieId: "MTI-2026-0001", reason: "I left that job" });
  const q = await open(at);
  await press(q, "declaretie");
  assert.equal(q.byOp("declaretie").length, 0);
});
