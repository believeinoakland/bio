/* screens-investigate R4: a money trail, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, TRAIL, P, MSR, M1, M2, M3, SHA, word, drew, dayOf } from "./fixtures.mjs";

const at = "/app/money/" + MSR;
const rowOf = (p, key) => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${key}"]`));
const panelOf = (p, key) => { const r = rowOf(p, key); return r && r.nextElementSibling; };
const openPanel = async (p, key) => { await p.click(rowOf(p, key).querySelector('[data-shell="row"]')); return panelOf(p, key); };

test("R4 reads the trail (moneyset) and each of its figures (moneyof's fact, by id): each a row with kind, from, to, when it moved, stage, period, amount, source grade and whether it is included, with its reason", async () => {
  const p = await open(at);
  assert.equal(p.byOp("moneyset")[0].query.id, MSR);
  assert.deepEqual(p.byOp("money").map((r) => r.query.id).sort(), [M1, M2, M3]);
  const heads = main(p).querySelectorAll("table.cs-rows thead th").map((h) => h.textContent).filter(Boolean);
  assert.deepEqual(heads, ["figure", "from", "to-where-it-went", "when-it-moved", "stage", "period", "amount", "source", "in-this-trail"].map((c) => word("column.money." + c + ".name")));
  const r1 = rowOf(p, M1).querySelectorAll("td").map((d) => d.textContent);
  const adopted = word("screen.money.phase.adopted");
  assert.ok(r1[1].startsWith(word("screen.money.kind.transfer")), "its kind");
  assert.deepEqual(r1.slice(2, 4), ["Sewer Fund 3100", "General Fund 1010"], "from and to, as the source writes them");
  assert.equal(r1[4], word("screen.money.didnotmove", { phase: adopted, date: dayOf("2021-07-01") }));
  assert.equal(r1[5].trim(), word("screen.money.stage", { phase: adopted, stage: "" }).trim());
  assert.equal(r1[6], "FY2021-22");
  assert.equal(r1[7], word("screen.money.amount", { sign: "", amount: "4200000.00", currency: "USD" }));
  assert.ok(r1[8].endsWith(word("mark.scale.capture.name") + "B"), "the source and its grade");
  assert.equal(r1[9], word("screen.money.included", { reason: "the transfer we ask about" }));
  const r2 = rowOf(p, M2).querySelectorAll("td").map((d) => d.textContent);
  assert.ok(r2[4].startsWith(dayOf("2022-06-30")), "when it moved: the event it is tied to, never its period");
  assert.ok(r2[5].includes(word("screen.money.stage", { phase: word("screen.money.phase.actual"), stage: word("screen.money.stage.paid") })));
  drew(rowOf(p, M3), "screen.money.excluded", { reason: "a different transfer" });
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Pothole repairs/);
});

test("R4 a value its source does not state is drawn undetermined and opens the row's panel at that item, with the evidence that would help", async () => {
  const p = await open(at);
  const gap = rowOf(p, M3).querySelector('td [data-shell="row"] .cs-gap[data-gap="undetermined"]');
  assert.ok(gap, "M3 states no payee");
  await p.click(gap.closest("button"));
  const panel = panelOf(p, M3);
  assert.equal(panel.hasAttribute("hidden"), false);
  drew(panel.querySelector('[data-gap-item="to"]'), "screen.money.evidence.to");
  assert.deepEqual(actsIn(panel).sort(), ["acquire", "actioncreate", "authoritychain", "checkrequest", "createevent", "findin", "gradenote", "hypothesishold", "include", "recordfact"].sort());
  assert.equal(rowOf(p, M1).querySelector('.cs-gap[data-gap="undetermined"]'), null, "a figure stating everything carries no such mark (control)");
});

test("R4 a filter keeps only the rows with something undetermined (its address), and back", async () => {
  const p = await open(at);
  const f = main(p).querySelector('a[href="/app/money/' + MSR + '/undetermined"]');
  assert.equal(f.textContent, word("screen.money.filter.gaps", { n: "1" }));
  await p.click(f);
  await p.settle();
  assert.deepEqual(main(p).querySelectorAll("tr.cs-r").map((r) => r.querySelector("[data-id]").getAttribute("data-id")), [M3]);
  assert.ok(main(p).querySelector(`a[href="/app/money/${MSR}"]`));
});

test("R4 each row's panel by its kind: reconcile (a budgeted figure beside a paid one), authoritychain, include/exclude with a reason, gradenote, acquire, findin, recordfact, actioncreate, createevent, checkrequest, hypothesishold", async () => {
  const p = await open(at, { plane: { moneyreconcile: undefined, reconcile: ok({ ok: true, consistent: false, amounts: "differ", differs: [{ dimension: "basis" }, { dimension: "phase or stage" }] }),
    authoritychain: ok({ ok: true, found: true, chains: [] }), exclude: ok({ ok: true }), include: ok({ ok: true }), gradenote: ok({ captureSha: SHA, note: "Grade B: bytes as fetched." }),
    acquire: ok({ ok: true }), checkrequest: ok({ ok: true, addressed: 2 }), hypothesishold: ok({ ok: true }), createevent: ok({ ok: true, event_id: "EVT-9" }) } });
  let panel = await openPanel(p, M1);
  fill(p, { ["money-with-" + M1]: M2 });
  await press(p, "reconcile", { within: panel });
  assert.deepEqual([p.byOp("reconcile")[0].query.a, p.byOp("reconcile")[0].query.b], [M1, M2]);
  panel = panelOf(p, M1);
  drew(panel, "screen.money.rec.differs", { dims: "basis, phase or stage" });
  await press(p, "authoritychain", { within: panel });
  assert.equal(p.byOp("authoritychain")[0].query.id, M1);
  drew(panelOf(p, M1), "screen.money.auth.none");
  await press(p, "exclude", { within: panelOf(p, M1), reason: "a budget figure, not a payment" });
  assert.deepEqual(p.byOp("exclude")[0].body, { setId: MSR, factId: M1, reason: "a budget figure, not a payment" });
  panel = await openPanel(p, M2);
  await press(p, "gradenote", { within: panel });
  assert.equal(p.byOp("gradenote")[0].query.capture, SHA);
  assert.ok(panelOf(p, M2).textContent.includes("Grade B: bytes as fetched."), "the grade note, as the capture holds it");
  fill(p, { "mf-address": "https://city.example/afr-2022.pdf" });
  await press(p, "acquire", { within: panelOf(p, M2) });
  assert.deepEqual(p.byOp("acquire")[0].body, { locator: "https://city.example/afr-2022.pdf", project: P });
  fill(p, { "mf-expertise": "municipal budget" });
  await press(p, "checkrequest", { within: panelOf(p, M2), reason: "how was it read?" });
  const cr = p.byOp("checkrequest")[0].body;
  assert.deepEqual([cr.target, cr.label, cr.reason], [P, "municipal budget", "how was it read?"]);
  fill(p, { "mf-question": "INQ-2026-0001-seven-days", "mf-hunch": "the Sewer Fund's share of citywide overhead" });
  await press(p, "hypothesishold", { within: panelOf(p, M2) });
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: "INQ-2026-0001-seven-days", kind: "flow", statement: "the Sewer Fund's share of citywide overhead", about: [M2] });
  panel = await openPanel(p, M3);
  fill(p, { "mf-sha": SHA, "mf-page": "214" });
  await press(p, "createevent", { within: panelOf(p, M3), reason: "the ledger dates it" });
  assert.deepEqual(p.byOp("createevent")[0].body.attestations, [{ captureSha: SHA, extent: { kind: "pdf-page", page: 213 } }]);
  await press(p, "findin", { within: panelOf(p, M3) });
  assert.equal(p.location.pathname, "/app/find-in/" + P);
});

test("R4 \"Ask the city for the record\" opens request for the project", async () => {
  const p = await open(at);
  const panel = await openPanel(p, M3);
  await press(p, "actioncreate", { within: panel, reason: "we need the cost-allocation plan" });
  assert.equal(p.location.pathname, "/app/request/" + P);
});

test("R4 the screen's own acts: Read a figure (recordfact), Start a money trail (createset, its name its words), committedagainstpaid", async () => {
  const p = await open(at, { plane: { recordfact: ok({ ok: true, fact_id: "MNY-2026-new", grade: { reading: "B" } }), createset: ok({ ok: true, set_id: "MSR-2026-0002" }),
    committedagainstpaid: ok({ ok: true, committed: { sum: { value: "1300000.00" } }, paid: { sum: { value: "1250000.00" } }, difference: { figure: { value: "50000.00" } } }) } });
  fill(p, { "mf-amount": "310,000", "mf-asread": "Overhead allocation … 310,000", "mf-kind": "allocation", "mf-phase": "actual", "mf-stage": "paid", "mf-basis": "undetermined",
    "mf-fiscal": "FY2022", "mf-payer": "Sewer Fund 3100", "mf-sha": SHA, "mf-page": "214" });
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0] });
  assert.deepEqual(p.byOp("recordfact")[0].body, { amount: "310,000", as_read: "Overhead allocation … 310,000", currency: "USD", sign: "+", precision: "exact", kind: "allocation",
    phase: "actual", basis: "undetermined", period: { fiscal: "FY2022" }, from: { as_written: "Sewer Fund 3100" }, to: null,
    source: { capture_sha: SHA, extent: { kind: "pdf-page", page: 213 } }, stage: "paid" });
  assert.ok(rowOf(p, "MNY-2026-new"), "the new figure is a row, not yet in the trail");
  fill(p, { "mf-contract": "ENT-2026-0005" });
  await press(p, "committedagainstpaid");
  assert.equal(p.byOp("committedagainstpaid")[0].query.contract, "ENT-2026-0005");
  drew(main(p), "screen.money.cap.diff", { committed: "1300000.00", paid: "1250000.00", difference: "50000.00" });
  fill(p, { "mf-label": "Overhead charges, FY2022" });
  await press(p, "createset");
  assert.deepEqual(p.byOp("createset")[0].body, { purpose: "trail", label: "Overhead charges, FY2022", concerns: P });
  assert.equal(p.location.pathname, "/app/money/MSR-2026-0002");
});

test("R4 Read a figure names its passage and amount (control: none sends nothing, the form kept)", async () => {
  const p = await open(at);
  fill(p, { "mf-asread": "something" });
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0] });
  assert.equal(p.byOp("recordfact").length, 0);
  assert.equal(p.doc.getElementById("mf-asread").value, "something");
});

test("R4 picked rows bring the hold strip with include, exclude (one reason for all), reconcile (exactly two picked) and checkrequest", async () => {
  const p = await open(at, { plane: { include: ok({ ok: true }), reconcile: ok({ ok: true, consistent: true, differs: [] }) } });
  const pick = async (k) => { const b = rowOf(p, k).querySelector('[data-shell="pick"]'); b.checked = true; p.fire(b, "change"); await p.click(b); await p.settle(); };
  await pick(M1);
  let hold = main(p).querySelector(".cs-hold");
  assert.ok(hold);
  assert.deepEqual(actsIn(hold).sort(), ["checkrequest", "exclude", "include"]);
  await pick(M3);
  hold = main(p).querySelector(".cs-hold");
  assert.deepEqual(actsIn(hold).sort(), ["checkrequest", "exclude", "include", "reconcile"]);
  await press(p, "include", { within: hold, reason: "both belong to the transfer" });
  assert.deepEqual(p.byOp("include").map((r) => [r.body.factId, r.body.reason]).sort(), [[M1, "both belong to the transfer"], [M3, "both belong to the transfer"]]);
});

test("R4 two sources that disagree are both drawn, in tension, never one picked; a project with no trail offers only Start a money trail", async () => {
  const p = await open(at);
  assert.ok(rowOf(p, M1) && rowOf(p, M2), "the adopted and the paid figure, both drawn");
  drew(main(p), "screen.money.tension");
  const q = await open("/app/money/" + P);
  assert.equal(q.byOp("moneyset").length, 0);
  assert.deepEqual(actsIn(main(q)), ["createset"]);
});

test("R4 a refused act is drawn beside it, nothing else changed (control)", async () => {
  const p = await open(at, { plane: { exclude: refusedIn("NO_SUCH_SET", "There is no such trail.") } });
  const panel = await openPanel(p, M1);
  await press(p, "exclude", { within: panel, reason: "x" });
  assert.ok(panelOf(p, M1).textContent.includes("There is no such trail."), "the refusal by its words");
});
