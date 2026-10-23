/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G75, a document the record holds without a stored title is named by the chain a delivery names a
 * document by (R54): its host and the day it was captured, never "Untitled capture" (two such rows could not be told apart in Held captures, nor the copy
 * "Already in the record as ..." from the one before it). `held` and the address tab's already-held row both draw the row's source (`heldcaptures`' `source`
 * with `retrieved`) when the row has no title; a row with a stored title draws it; a row with neither a host nor a day is the word, as before. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, fill, press, says, word, dayOf, ok, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const SHA = "c".repeat(64);
const GOVINFO = "https://www.govinfo.gov/content/pkg/BUDGET-2022-APP/pdf/BUDGET-2022-APP.pdf";
const ROW = (id, more = {}) => ({ bundle_id: id, title: null, project: null, source: { address: GOVINFO, via: "fetch", retrieved: "2026-10-23T12:25:00Z" }, collected_since: "2026-10-23T12:25:00Z",
  capture: { sha256: SHA }, actor: null, whole: true, standing: "collected", ...more });
const site = (host, d) => ({ site: host, date: dayOf(d) });

test("R4 R54 (G75) Held captures names a row with no stored title by its host and the day it was captured; a stored title is drawn; neither host nor day is the word", async () => {
  const rows = [ROW("INFO-2026-0159"), ROW("INFO-2026-0160", { title: "Adopted budget 2022" }),
    ROW("INFO-2026-0161", { source: { address: "upload:abc", via: "upload", retrieved: null } })];
  const p = await openPage("/app/held", { plane: { heldcaptures: ok({ ok: true, held: rows, truncated: false }), projectlist: ok({ projects: [] }) }, screens: [...SCREENS, DOCUMENT_STUB] });
  const link = (id) => main(p).querySelector(`a[href*="${id}"]`);
  const chain = word("document.untitled.web", site("www.govinfo.gov", "2026-10-23T12:25:00Z"));
  assert.equal(link("INFO-2026-0159").textContent, chain, "the row is named by its host and the day it was captured");
  assert.equal(link("INFO-2026-0160").textContent, "Adopted budget 2022", "a stored title is drawn");
  assert.equal(link("INFO-2026-0161").textContent, word("screen.held.untitled"), "neither a host nor a day: the word");
  assert.notEqual(link("INFO-2026-0159").textContent, word("screen.held.untitled"));
});

test("R38 R54 (G75) the address tab's 'Already in the record as' names a copy with no stored title by its host and the day, not by Untitled capture", async () => {
  const COPY = { sha256: SHA, document: "INFO-2026-0159", project: null, retrieved: "2026-10-23T12:25:00Z", actor: "member:mai", address: GOVINFO };
  const p = await openPage("/app/capture/address", { plane: { opencaptures: ok({ ok: true, truncated: false, captures: [] }), heldcaptures: ok({ ok: true, held: [ROW("INFO-2026-0159")] }),
    memberlist: ok({ members: [{ member_id: "mai", handle: "mai-h", role: "member", status: "active" }] }),
    heldat: ok({ ok: true, held: true, copy: COPY, versions: 1, truncated: false, changed: { state: "unchanged" } }) }, screens: [...SCREENS, DOCUMENT_STUB] });
  fill(p, { "ci-address": GOVINFO });
  await press(p, "acquire");
  assert.ok(says(p, "document.untitled.web", site("www.govinfo.gov", COPY.retrieved)), "named by the chain a delivery uses");
  assert.equal(says(p, "screen.held.untitled"), false);
});
