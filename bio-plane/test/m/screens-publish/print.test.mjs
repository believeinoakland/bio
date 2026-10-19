/* screens-publish R39 (T51-121; DEC-330 A79): "Print the case" on `published`: the page redraws into its print layout (every finding open
 * with its sources listed, the signature line at the foot, the filtered view saying so), calls the kit's print once, and `printed`
 * draws the page as it was. No print rule: what is drawn is what prints. Nothing is sent or stored. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { until, open, main, text, drew, drewIn, day, word, ops, press, ok, C, F1, F2, FINDING, leg, publishedPlane, SIGNER_KEY } from "./fixtures.mjs";

const PUBLIC = { session: null };
const PATH = `/app/published/${C}`;
const pair = (capture, connection) => [{ axis: "capture", grade: capture }, { axis: "connection", grade: connection }];
const OTHER = { edition: 1, title: "Rents under the same lease, 2022 to 2024", ratified_at: "2026-06-01T10:00:00Z", case_id: "CASE-OTHER-1" };
const PLANE = () => publishedPlane([
  FINDING(F1, { strength: pair("B", "B"), basis: [leg("INFO-1", "supports", "B", "capture"), leg("INFO-2", "supports", "B", "capture"), leg("INFO-3", "cuts_against", "C", "capture"),
    leg("FND-OTHER-4", "supports", "B", "connection", { served: true, cited_edition: OTHER })] }),
  FINDING(F2, { strength: pair("C", "B"), role: "supporting", standing: { role: "supporting", bar: { capture: "B", connection: "B" }, meets: false }, basis: [leg("INFO-5", "supports", "C", "capture")] })]);
const FP = createHash("sha256").update(Buffer.from(SIGNER_KEY, "base64")).digest("hex");
const fingerprint = `${FP.slice(0, 4)} ${FP.slice(4, 8)}`;

/** The page with the kit's print stubbed: what was drawn at the moment of printing, and how many times it was asked. */
async function printing(p) {
  const asked = [];
  p.win.print = () => asked.push({ html: main(p).innerHTML, text: main(p).textContent, requests: p.requests.length });
  const done = () => { for (const f of p.win.listeners.afterprint || []) f(); };
  return { asked, done };
}

test("R39 printing the whole case draws every finding open with its sources and the signature line with the key's fingerprint and `printed in full`, then asks to print once; `printed` puts the page back", async () => {
  const p = await open(PATH, { boot: PUBLIC, plane: PLANE() });
  assert.ok(!main(p).querySelector("[data-print-layout]") && !main(p).textContent.includes(word("screen.published.cut.against.by.a.letter")), "on screen the details are collapsed: no sources listed");
  const { asked, done } = await printing(p);
  const before = p.requests.length;
  await press(p, "pubprint");
  await until(p, () => asked.length);
  assert.equal(asked.length, 1, "print asked once");
  assert.equal(p.requests.length, before, "the screen sends nothing");
  const sheet = main(p).querySelector('[data-print-layout="full"]');
  assert.ok(sheet, "the print layout");
  assert.equal(sheet.querySelectorAll("article.mk-finding").length, 2, "the whole case");
  assert.ok(drewIn(sheet, "screen.published.rests.on.the.council.minutes", { count: "2" }) && drewIn(sheet, "screen.published.cut.against.by.a.letter"), "each finding's sources, by what it only names");
  assert.ok(sheet.textContent.includes(OTHER.title), "a served leg is named by the title of the edition it cites");
  assert.ok(drewIn(sheet, "screen.published.rests.on.the.council.minutes.one", { count: "1" }) || sheet.textContent.includes(word("screen.published.rests.on.the.council.minutes.one")), "one document is said as one");
  assert.ok(!/INFO-\d/.test(sheet.textContent), "a document the case only names is not named");
  assert.ok(drewIn(sheet, "screen.published.sources.nonepublished", { count: "4" }), "the sources the case does not publish, counted");
  const foot = sheet.querySelector("[data-print-foot]");
  assert.ok(drewIn(foot, "screen.published.signed.for.lakeshore.tenants.by", { team: "River Town", member: "rosa", date: day("2026-11-18"), fingerprint }), "who signed for the team, when, with which key");
  assert.ok(drewIn(foot, "screen.published.check.the.signature.at.the") && drewIn(foot, "screen.published.printed.in.full.no.minimum"));
  assert.equal(main(p).querySelectorAll("button[data-act]").length, 0, "no control is printed: the note and the acts are on screen only");
  done();
  await p.settle();
  assert.equal(main(p).querySelector("[data-print-layout]"), null, "printed draws the page as it was");
  assert.ok(ops(p).includes("pubprint") && drew(p, "published.check.title"));
  assert.ok(![...p.store.values(), ...p.local.values()].some((v) => String(v).includes(fingerprint)), "nothing is stored");
});

test("R39 printing a filtered view says it is one and how many findings it leaves out; `printed` returns to the filtered view (controls)", async () => {
  const p = await open(PATH, { boot: PUBLIC, plane: PLANE() });
  await press(p, "pubfloorset", { values: { "pb-fl-capture": "B", "pb-fl-connection": "B" } });
  const { asked, done } = await printing(p);
  await press(p, "pubprint");
  await until(p, () => asked.length);
  assert.equal(asked.length, 1);
  const sheet = main(p).querySelector('[data-print-layout="filtered"]');
  assert.ok(sheet && sheet.querySelectorAll("article.mk-finding").length === 1);
  const foot = sheet.querySelector("[data-print-foot]");
  assert.ok(drewIn(foot, "screen.published.a.print.made.from.a") && drewIn(foot, "screen.published.this.is.part.of.the", { n: "1", total: "2", hidden: "1" }));
  assert.ok(!drewIn(foot, "screen.published.printed.in.full.no.minimum"), "never `printed in full`");
  done();
  await p.settle();
  assert.ok(main(p).querySelector("[data-filtered]") && main(p).querySelector('[data-print-layout]') === null, "the filtered view is back");
});

test("R39 a fact the answer does not state is left out of the footer, not guessed: no key, no signed-for sentence; no signing date, none either", async () => {
  const nokey = publishedPlane([FINDING(F1, { attestor: null })]);
  const p = await open(PATH, { boot: PUBLIC, plane: nokey });
  await printing(p);
  await press(p, "pubprint");
  await until(p, () => main(p).querySelector("[data-print-foot]"));
  const foot = main(p).querySelector("[data-print-foot]");
  assert.ok(foot && drewIn(foot, "screen.published.check.the.signature.at.the"));
  assert.ok(!foot.textContent.includes(word("screen.published.signed.for.lakeshore.tenants.by", { team: "River Town", member: "rosa", date: day("2026-11-18"), fingerprint })) && !/\{[a-z]+\}/.test(foot.textContent));
  assert.ok(!/\b[0-9a-f]{4} [0-9a-f]{4}\b/.test(foot.textContent), "no fingerprint is made up");
  const stated = publishedPlane([FINDING(F1, { attestor: { member: "rosa", key_b64: SIGNER_KEY, fingerprint: "ab12 34cd" } })]);
  const q = await open(PATH, { boot: PUBLIC, plane: stated });
  await printing(q);
  await press(q, "pubprint");
  await until(q, () => main(q).querySelector("[data-print-foot]"));
  assert.ok(drewIn(main(q).querySelector("[data-print-foot]"), "screen.published.signed.for.lakeshore.tenants.by", { team: "River Town", member: "rosa", date: day("2026-11-18"), fingerprint: "ab12 34cd" }), "a fingerprint the answer states is the one drawn");
});
