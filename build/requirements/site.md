# site — requirements

**Status** · New in T49 (T49-31; K657, K1043; registered at T49's opening act, layer 11 after `installer`; `uses` `interface-assets`, K3334): a module built fresh, carrying civicsmith.org as the design stream draws it (N1011; DEC-206, DEC-223; Bob's K3060 D6, D14, K3296). Drafted in `build/plan/draft-T49-fold-L11-b.md` §13, worded here by BOB (P5), with K3334's settlements: the look read from `interface-assets` (one copy of the faces), the places ready now read from the released `jurisdictions` profiles at generation, the installer's and the stewards' addresses held as deploy values. Not yet met (T49).

**Size (P6).** Estimated 400–700 lines of code and generated text; the visual language's files are `interface-assets`' (K3334); measured at its START (K617).

## Public

### Purpose

Civicsmith's own website, civicsmith.org, kept by its stewards: what Civicsmith is, how a group starts its own, and the groups that chose to be listed. A static Cloudflare Worker that serves fixed pages and files. It holds no accounts, reads no group's record, sends nothing anywhere and stores nothing.

### Provides

**The Worker: `fetch(request, env)`** (a Workers module's default export)

- **R1** (DEC-223) **Three pages joined by one menu.** `GET /` serves "What Civicsmith is", `GET /start` serves "Start a group", and `GET /groups` serves "Groups at work". Each is one HTML document, and each opens with the same menu (`mk-sitenav`: the three pages in that order, the current one marked `aria-current="page"`) under the wordmark. `HEAD` answers as `GET` with no body. Any other path answers 404 with a page in the same frame and a link to `/`. Any other method answers 405. Test: each page and its marked menu item. Control: `/nonesuch` answers 404 with the link.
- **R2** (DEC-206 (1), DEC-223; `installer` R42) **The front page** draws, in the design's order: "Hold your government to its own word" over the design's two lines, exactly (`SITE_LINE1`, `SITE_LINE2`); "Start a group's Civicsmith" (to `/start`) and "See what groups have published" (to `/groups`); "How a group uses it" (five steps); "What a group gets"; "What Civicsmith does not do"; "One group's work" (R5); "Already a member of a group?" (civicsmith.org holds no accounts); and "Questions" (R6). Test: the page against the design's state `a`, element by element. Control: no form and no field is drawn.
- **R3** (DEC-206 (2), DEC-223) **Start a group** draws, in the design's order: "Is it right for your group?"; "What you need"; "Decide first: who holds the Cloudflare account"; "What happens, step by step"; and "What it costs". Then come "Create your group", a link to the installer's address (R7), and "Back to the front page". Test: the page against the design's state `b`. Control: "Create your group" opens exactly `INSTALLER_ADDRESS`.
- **R4** (DEC-206 (3), DEC-132 (3), DEC-223) **Groups at work** draws the heading and its sentence, then one row per group in `LISTED_GROUPS`, in its order. Each row has the group's name, its place, its focus and its published cases as listed, and "Visit" linking the group's own public page. Then comes the note that a group chooses whether it is listed. With no group listed, the page draws its empty state (the heading, its sentence, the note, and no rows), never a sample group. Test: two listed groups draw two rows. Control: an empty list draws no row and no made-up group.
- **R5** **One group's work.** The front page's section is drawn only while `FEATURED_CASE` names a real published edition: its title, edition, group, signer and date, linking that edition's public page (`/app/published/<case>` on the group's own address). Otherwise the section is not drawn. Test: a set value draws its row and link. Control: `null` draws no section.
- **R6** (K3060 D14; N923, K2799) **The stewards' address** is one marked value, `STEWARDS_ADDRESS`, drawn in "Questions" as a `mailto:` link. While it is unset, the page draws the design's marked placeholder, and the Worker answers every page with a header saying it is not yet public (`X-Robots-Tag: noindex`). It does not go public without the address (K3296). Test: unset draws the placeholder and the header. Control: set draws the link and no header.
- **R7** **The installer hand-off.** `INSTALLER_ADDRESS` is one value, the `https:` address of the released installer's first page (`installer` R50), set at deploy. "Create your group" is a plain link to it in the same browsing context. Nothing about the visitor is passed: no query, fragment or referrer (`Referrer-Policy: no-referrer`). Test: the link equals the value. Control: the link carries no query or fragment.
- **R8** (DEC-122 (3), principle 9.6) **Served from itself.** Every page links only the site's own stylesheet, faces and icons, served at the paths `interface-assets` gives them (`/app/assets/…`, its R1, R2), so the stylesheet's own font addresses resolve unchanged (R9; K3339). It loads no resource from another origin and runs no script, and every response carries a `Content-Security-Policy` of `default-src 'self'` with no script source. Test: a scan of every page finds no outside `src`, `href` for a resource, `@import` or `url()`, and no `<script>`. Control: the outside links drawn (the installer, a group's page, `mailto:`) are anchors only.
- **R9** **The text and the look are the design's, at a named commit.** `SITE_COMMIT` names the `main` commit the pages are generated from (`f498560a37`, or a later `main` commit named at START). Two things come from it:
  - **The pages.** Each page's words and structure are `mock-screens.js`' `SCR.site` at that commit (states `a`, `b` and `c`), with the mock's controls removed (`mk-mockctl`, the `onclick` page switching), the menu's links made real (R1), and R4's to R7's values put in place of the mock's samples and placeholder.
  - **The look.** The stylesheet holds the visual language's rules (`civicsmith.css`) and the design page's rules the pages draw (`mk-sitenav`, `mk-setuphead`, `mk-wordmark`, `mk-list`, `mk-acts`, `mk-links`), with the faces and icons. These are read from `interface-assets`' files (`ASSET_FILES`: `civicsmith.css`, `shell.css`, `icons.svg` and the faces), never from the design commit directly, so the site carries no second copy of the faces (K3334).

  Both are generated, never edited by hand, and a later design is a re-generation. Test: each page against the design's drawing of its state at `SITE_COMMIT`, at 1280 and 390 px, pair by pair (`journey-check` R6's method). Control: no page is wider than the viewport at 390 px.

#### T49: words by key (K3366, K3368; DEC-257, DEC-258)

- **R12** (T49; K3366; DEC-257, DEC-258; `setup-words` R11–R13; amends every requirement here that quotes a member-facing sentence) **Words by key.** This module holds no member-facing English: every sentence it draws or answers is read through `setup-words` `word(key, vars)`, and the module holds only keys. Its keys are the keys its requirements name, each held in `words.json` (it had no source when DEC-258 listed the reads). A sentence an earlier requirement here quotes means the key whose English it is: the quotation identifies the key and binds no wording, so a word changed in `words.json` changes no requirement and no code here. Test: each key it reads is asserted with `setup-words` `hasWord`; over fixtures, what it draws for a sample of its keys equals `word(key, vars)`; no test holds a sentence's English. *(not yet met: T49)*

## Private

### Uses

- `setup-words.word`, `setup-words.hasWord` (K3366, K3368): every member-facing sentence, by key.

- `interface-assets` (K3334): its served faces, icons and visual-language stylesheet (`ASSET_FILES`, its R1, R7, R8), for R8 and R9's look, so the site carries no second copy of the faces. Its tests read the design's files at `SITE_COMMIT` from git (`SCR.site`, R9's pages), as `interface-assets`' do.

### Invariants

- **R10** No request is logged, counted or stored, and no cookie or browser storage is written: the site holds nothing about who visited (K1888). Test: no `Set-Cookie`, and no binding beyond the Worker's own.
- **R11** No place is named in the site's code or its behaviour. The places ready now (the "Start a group" page's sentence that lists them) are read from the released `jurisdictions` profiles at generation, never written into the site's code (K3334). Otherwise a place appears only in the listed groups' data (R4) (`build/requirements/README.md` rule 7).

### Satisfies

- N1011; DEC-206 (1)–(3), DEC-223 (R1–R4); DEC-132 (3) (R4); Bob's K3060 D6 (the founding journey starts on civicsmith.org) and D14 (the stewards' address, R6); K3296 (built and tested before Bob's domain is set up); DEC-122 (3) and principle 9.6 (R8).

### Suggestions

- **Deployment.** It is a static Worker on Believe in Oakland's Cloudflare account (`20b533579290b9b93168345edd3b7f72`), on its `workers.dev` address until Bob's domain is set up (K3296). Each deploy is Bob's approval in session (K1715). `STEWARDS_ADDRESS`, `INSTALLER_ADDRESS`, `FEATURED_CASE` and `LISTED_GROUPS` are plain-text bindings or a data file set at deploy, never secrets.
- **Generation.** A script beside the module (not imported, so not bundled) turns `SCR.site`'s three states into the pages, with the places ready now read from the released `jurisdictions` profiles (R11); the stylesheet, faces and icons are `interface-assets`' files, not regenerated here (R9, K3334). Its header names R9 and its test.
- **Listed groups.** Until a directory exists, the stewards keep `LISTED_GROUPS` by hand from groups' submissions (`network-notices` R23), each with the group's consent as it chose (DEC-132 (3)).
- **Tests.** Under Miniflare, as `journey-check`'s local arm runs the installer; the design pairs as `journey-check` R6 makes them.
