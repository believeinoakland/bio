# T33 measures: court registers, citation data, IronCalc on the corpus workbooks

**Status** · Desk research for BOB #114, 2026-10-05. Measures asked by `draft-T33-entries-A.md` §(b) COURTS (the C1 MEAS line) and `draft-T33-entries-C.md` §(c) ANALYSIS L3 / ladder §8 L3 ("measure first"). Scratch work (scripts, downloads, builds) stayed in the session scratchpad; nothing here is product code.

## Verdicts

| # | measure | verdict | plan consequence |
|---|---|---|---|
| 1a | Alameda Superior Court eCourt register | **NO-GO for an unattended fetch** | Case Number Search (the register of actions) is login-gated; the doctype is captured only by the member's own act in their own browser (K1449, C9 K1492). Build the doctype from a member capture, not a fetcher. |
| 1b | CourtListener docket page and API v4 | **GO (page) / PARTIAL (API)** | The docket page is static HTML, readable anonymously. The docket API needs a token. The optional token stays off by default and belongs to the group (K1449). |
| 1c | CPUC proceeding card | **GO** | Static, server-rendered APEX HTML. The reCAPTCHA covers only public-comment submission. |
| 1 | C1 core (doctypes, register row diff) in T33 | **GO, with conditions** | Two of the three registers can be fetched and parsed. The third (Alameda) enters as a member-captured page. The row diff is keyed per register (see row keys below). |
| 2 | reporters-db and courts-db as an L1 data module | **GO** | BSD-2-Clause JSON, about 3.6 MB raw. Python regexes need translating to JS at build time. Keep it out of `jurisdictions`, as already ruled. |
| 3 | `sheet-worker` (IronCalc) in T33 | **PARTIAL: NO-GO as an always-on recompute; GO only as an inert, measured, size-bounded worker** | See §3. The npm wasm cannot read XLSX. On workbooks without external links, 98.9 % of cells agree, but only 79 of 111 workbooks agree whole. The heaviest workbooks need 50–100 s of native CPU. |

## 1. Court registers

### (a) Alameda County Superior Court, eCourt Public Portal (Journal Technologies, Drupal)

- `https://eportal.alameda.courts.ca.gov/`: the home page and the Search page (`?q=node/388`) fetch anonymously (HTTP 200, static HTML).
- **Case Number Search (`?q=node/387`) and Public Reports (Filings) (`?q=node/405`) redirect to `?q=user/login`.** An account is needed. "About this Site" (`node/416`) states a JavaScript CAPTCHA requirement. Name search is paid ($45 for 75 credits, $300 for 30 days unlimited). Document downloads cost $1 per page (capped at $50), with a free half-page preview.
- Calendar Search (`node/389`) is an anonymous POST form, `ecp-searchform-form`. It may list case numbers per department and day, but it was not exercised.
- Covers civil, small claims, family, probate, mental health and adoptions. **No criminal, juvenile or traffic cases.**
- Register fields, as the portal states them (not observed, because the page is behind a login): parties, Register of Actions, minutes, future hearings, document images.
- **Case number forms:**
  - current: `^\d{2}CV\d{6}$` (e.g. `22CV013018`);
  - legacy: `^(RG|HG)\d{8}$` (e.g. `RG21105389`; RG = Oakland, HG = Hayward);
  - other legacy courthouse prefixes may exist and are unverified.
  - Sources: trellis.law Alameda coverage; the portal's `node/388` and `node/416`.

### (b) CourtListener (Free Law Project)

**Docket page** `https://www.courtlistener.com/docket/{id}/{slug}/`:
- Static server-rendered HTML (sample: docket 4214664, 634 KB, 72 entries on page 1 of 4, paginated with `?page=n`).
- **CloudFront returns 403 to curl's default User-Agent;** a browser-like User-Agent gets HTTP 200.
- Header fields: Last Updated, Assigned To, Citation (case name, docket number, court), Date Filed, Date of Last Known Filing, Cause, Nature of Suit, Jury Demand, Jurisdiction Type.
- Each row is `div#entry-{n}`: entry number, date filed, description (the PACER text, including "(Entered: mm/dd/yyyy)"), and RECAP documents (Main Document and attachments, each with a description and a `storage.courtlistener.com/recap/gov.uscourts.{court}.{pacer_case_id}.{n}.0.pdf` link, or "Buy on PACER").
- **Row key:** `entry_number`. Unnumbered minute entries need date and description.

**API v4** `https://www.courtlistener.com/api/rest/v4/`:
- Anonymously, `dockets/`, `docket-entries/` and `opinions/` return **401 "Authentication credentials were not provided."**
- The root, `courts/` and `search/` answered **429, "Rate limit exceeded: 125/day"**: the anonymous quota, already spent on this egress IP.
- `recap-query/` is "only available to select users" (wiki.free.law v4 PACER data page).
- Docket object fields: `id`, `court`, `court_id`, `docket_number`, `docket_number_core`, `pacer_case_id`, `case_name`, `date_filed`, `date_terminated`, `assigned_to`, `source`, and others.
- **Plan:** use a token for everything beyond page capture.

**Coverage:** federal PACER/RECAP dockets, plus opinions. **Alameda Superior Court trial dockets are not in CourtListener.**

**Number forms:**
- federal district: `^\d:\d{2}-(cv|cr|mc|md|mj|bk|ap)-\d{5}(-[A-Z]{2,4})*$` (e.g. `1:16-cv-00745`, `3:20-cv-05640-EMC`);
- `docket_number_core`: `^\d{7,8}$`.

### (c) CPUC proceeding card (Oracle APEX app 401)

- Card URL: `https://apps.cpuc.ca.gov/apex/f?p=401:56:0::NO:RP,57,RIR:P5_PROCEEDING_SELECT:A2106021`. HTTP 200, 21 KB, static HTML, no login.
- Card fields: Proceeding (number), Filed By, Service Lists, Industry, Filing Date, Category (e.g. Ratesetting), Current Status (e.g. CLOSED), Description, and Staff (role: name, with "Assigned" date; ALJ and Commissioner).
- **Documents tab** (`f?p=401:57:...` with the same item): HTTP 200, 103 KB, server-rendered APEX interactive report, "1 - 100 of 590".
  - Row fields: **Filing Date, Document Type (EXPARTE, COMMENTS, REQUEST, REPORT, DECISION, PROPOSED DECISION, AMENDMENT...), Filed By, Description**.
  - Rows beyond 100 need APEX pagination within the session (the cookie session works with curl), or the report's Download (CSV).
  - Further tabs: Rulings (58), Decisions (59), Public Comments (65).
- The reCAPTCHA widgets (`pc_captcha`, `complaint_captcha`) apply only to submitting public comments and complaints.
- **No stable row id:** the row key is (date, type, filed by, description), plus the document link where there is one.
- **Number forms:**
  - proceedings: `^[ARICPK]\d{7}$`, displayed `A.21-06-021` (`^[ARICPK]\.\d{2}-\d{2}-\d{3}$`);
  - decisions: `^D\d{7}$` / `D.25-03-008`;
  - the prefix letters are Application, Rulemaking, Investigation, Complaint, Petition, and K, whose meaning is unverified.

### Consequence for C1 core in T33

- Three doctypes fit:
  - `ecourt-roa` (from a member capture);
  - `courtlistener-docket` (HTML, or API JSON with a token);
  - `cpuc-proceeding` (card plus documents report).
- The register row diff must be keyed per doctype:
  - CourtListener: entry number;
  - CPUC: composite key, because there is no stable id;
  - eCourt: date plus a sequence number within the date, assumed and still to be verified on a real capture.
- Recognising a number in the `id-spaces` recogniser needs the three regex families above, plus `docket_number_core`-style normalisation.
- The one open risk is the Alameda row shape, because no register was seen. The doctype stays provisional until a member captures one.

## 2. reporters-db and courts-db (Free Law Project)

PyPI wheels measured on 2026-10-05.

| package | version | licence | data files (JSON) | counts |
|---|---|---|---|---|
| `reporters-db` | 3.2.66 | BSD-2-Clause | `reporters.json` 908 KB, `laws.json` 212 KB, `journals.json` 265 KB, `regexes.json`, `case_name_abbreviations.json`, `state_abbreviations.json` | 1,236 reporter keys, 1,262 reporter entries, 1,368 editions, **2,369 variations**, 371 law keys, 797 journal keys |
| `courts-db` | 0.10.27 | BSD-2-Clause | `courts.json` 1.93 MB, `variables.json`, `states.json` | **2,809 courts, 5,574 name regexes**; fields `id, name, name_abbreviation, citation_string, type, level, system, jurisdiction, location(s), dates, case_types, examples, regex, sub_names` |

- The data is pure JSON, so fetch-free and fit for an L1 data module.
- Both use **Python regex templates**: courts-db `${var}` from `variables.json`; reporters-db `regexes.json` with named groups `(?P<...>)`. These must be expanded and translated to JS at build time, and the build must be tested against each package's `examples`.
- The California entries are coarse:
  - `cal`, `calctapp`, `calsuperct`, `calappdeptsuper`, `calsuppctla`, `calsuppctsf`;
  - **no Alameda-specific court id**, so the county forum is an `entities` record, not courts-db's.
- This confirms the draft's figures (1,167 reporters and 2,102 variants were from an older version).

## 3. IronCalc on the corpus workbooks

### (a) The corpus

- The 288 workbooks are COFF-6/M-20's census of the public S3 bucket `cao-94612`, which backs `oaklandca.gov/files/assets`. The bucket was re-listed on 2026-10-05: 43,283 keys, **289 `.xlsx`** (171.6 MB). All were downloaded.
- 288 are OOXML. One, `Final_Impact_Fee_Zone-_-Revised-dlrv1_ACRP.xlsx`, is not a zip, which matches M-20's "undetermined".
- **131 of the 288 hold formulas: 645,886 formula cells** (shared-formula references counted as cells).
- 17 have external links; none has VBA.
- There are many near-duplicates (127 recomputed workbooks carry 120 distinct names, and the NOFA and APR families repeat).

### (b) Functions used

48 distinct functions. In the table, "cells" counts occurrences in formula text, so shared-formula children are not counted, and "wb" counts the workbooks that use the function.

| function | cells | wb | function | cells | wb | function | cells | wb |
|---|---|---|---|---|---|---|---|---|
| IF | 80,174 | 63 | DATE | 431 | 22 | AVERAGE | 48 | 11 |
| MATCH | 33,763 | 16 | MAX | 322 | 38 | COUNTIF | 47 | 23 |
| INDEX | 33,323 | 16 | ROUND | 278 | 26 | LEN | 22 | 10 |
| VLOOKUP | 21,839 | 40 | OR | 268 | 24 | EDATE | 20 | 5 |
| SUM | 21,325 | 109 | ADDRESS | 224 | 7 | PV | 18 | 8 |
| ISNUMBER | 3,506 | 33 | ROW | 224 | 7 | COUNT | 16 | 13 |
| IFERROR | 2,514 | 33 | MONTH | 118 | 18 | LOWER | 14 | 7 |
| AND | 2,428 | 21 | TRIM | 108 | 6 | ROUNDDOWN | 13 | 4 |
| SUMPRODUCT | 2,347 | 35 | **HYPERLINK** | 106 | 1 | COUNTA | 12 | 11 |
| ISBLANK | 2,194 | 27 | NOT | 100 | 5 | CONCAT | 12 | 6 |
| MIN | 2,143 | 10 | PROPER | 74 | 8 | CHOOSE | 5 | 5 |
| YEAR | 2,058 | 31 | SUBTOTAL | 71 | 5 | **SINGLE (`@`)** | 3 | 3 |
| SUMIF | 2,017 | 14 | HLOOKUP | 65 | 5 | ISTEXT | 2 | 2 |
| TRUNC | 1,044 | 1 | DAY | 63 | 13 | | | |
| PMT | 980 | 23 | SUMIFS | 61 | 8 | | | |
| CONCATENATE | 687 | 16 | INT | 60 | 5 | | | |
| TEXT | 510 | 7 | COUNTIFS | 53 | 5 | | | |
| LOOKUP | 508 | 5 | | | | | | |

### (c) IronCalc: package, size, function coverage

- **npm `@ironcalc/wasm` 0.8.4** (MIT/Apache-2.0, published 2026-08-01): `wasm_bg.wasm` is **1,974,495 B (668,065 B gzipped)**.
- **It has no XLSX import:** `Model.from_bytes` reads IronCalc's own format only.
- XLSX import (`fromXlsx` and `toXlsx`) is behind the Rust feature `xlsx` in `bindings/wasm` on `main`, for a future `@ironcalc/wasm-xlsx`, which is not on npm.
- Built locally (rustc 1.97, `cargo build --release --target wasm32-unknown-unknown`, with no wasm-bindgen or wasm-opt pass):

  | build | raw | gzipped |
  |---|---|---|
  | without `xlsx` | 3,259,191 B | 885,663 B |
  | with `xlsx` | 3,714,437 B | 1,039,301 B |

  The `xlsx` feature adds about 455 KB raw (+14 %). Scaled to the published optimisation, a `wasm-xlsx` build is an estimated 2.25 MB raw and 0.77 MB gzipped. That is within the Workers script-size limits, but **`sheet-worker` must build and vendor its own wasm** (a Rust toolchain in the bundler path).
- Functions on `main`: the `Function` enum has **496** functions (`base/src/functions/mod.rs`).
- Probing 0.8.3 for each corpus function: **two of the 48 are missing, `HYPERLINK` (106 cells, 1 wb) and `SINGLE` / the implicit-intersection `@` (3 wb).**
- Further gaps found in recompute:
  - `@` over a multi-cell range returns `#VALUE!`;
  - array-lifting of scalar functions inside `SUMPRODUCT` (e.g. `TRIM(range)=x`, `YEAR(@range)`) returns `#N/IMPL!`;
  - no iterative calculation: a workbook built to iterate gives `#CIRC!`.

### (d) Recompute against cached values

Method:
- Engine: the `ironcalc` 0.8.3 Python wheel, the same Rust engine as the wasm.
- `load_from_xlsx`, then `evaluate`.
- Each formula cell is compared with its cached `<v>` read from the sheet XML: numbers to a relative 1e-9, strings and booleans exactly.
- Run on all 131 formula workbooks, with 240 s per workbook.

| group | workbooks | cells compared | agree | rate | workbooks agreeing whole |
|---|---|---|---|---|---|
| all completed | 127 | 426,955 | 334,786 | 78.4 % | 81 |
| **no external links** | **111** | **196,604** | **194,421** | **98.9 %** | **79 (71 %)** |
| with external links | 16 | 230,351 | 140,365 | 60.9 % | 2 |

- 5 workbooks timed out at 240 s: three C-26 Sites Inventory files and two Oakland2022 APR files.
- In the externally linked group the disagreement is almost all `#NAME?` (81,685 cells): defined names point at `[n]Book!range`. The design refuses external links, so these are expected "not recomputed".
- Among workbooks without external links, the 2,183 disagreements break down as:

  | IronCalc result | cells | cause |
  |---|---|---|
  | `#N/A` | 1,088 | NOFA 2024 workbooks, a cascade from `@` ranges |
  | `#VALUE!` | 510 | implicit intersection `@'Sheet'!B4:F4` |
  | `#CIRC!` | 313 | Zoning-Fees, iterative calculation |
  | `#NAME?` | 98 | HYPERLINK |
  | `#N/IMPL!` | 84 | array-lifted TRIM/YEAR in SUMPRODUCT |
  | stale cache error | 22 | the cache holds `#N/A` while IronCalc computes a value: the cached value was stale, not IronCalc's error |
  | numeric differences | 5 | |
  | other | 52 | |

  True numeric disagreement is negligible. Every other failure is a **loud error value**, never a silently wrong number.
- **Time** (native, single thread): p50 0.02 s, p90 1.5 s per workbook. 4 workbooks took over 30 s (max 102 s). `Oakland2023_Online.xlsx` (1.5 MB zipped, 10.4 MB unzipped, about 20k formulas) took 27 s to load and 27 s to evaluate, with a peak RSS of 76 MB. Wasm is typically slower than native, so the heavy APR and C-26 files exceed a Worker's default 30 s CPU and need the 5-minute paid limit, or must be refused by size.

### Consequence for `sheet-worker` in T33

- **Safe to enter T33 only as specified:**
  - inert until DIST deploys it;
  - built from IronCalc `main` with the `xlsx` feature (pinned commit), because npm has no XLSX-capable package;
  - every error value a disclosure of "not recomputed here", with the reason (external link, `@` range, iterative, unsupported function), never a disagreement verdict;
  - an input bound by unzipped size or cell count, with "not recomputed here" above it;
  - external links refused before load (17 of 288 have them).
- The agreement figure for the method note is "98.9 % of cells and 71 % of workbooks whole, on 111 link-free corpus workbooks". The 18 non-whole workbooks fail visibly.
- **Not safe:** treating recompute as a gate, or promising recompute for every member workbook.
- The bundler gains a Rust/wasm build step (or a vendored, hashed wasm), which is a new generated artifact under PROCESS-MECHANICS §14.
