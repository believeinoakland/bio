# subresources (T9)

**Status** · session_01PwqLa1NvQSNYxStbJ9R5ds · depth 2 · WORKING · handled B0

## J1 · QUESTION

N79 adds a field to R15's `links[]`, a provided service, and no requirement id states it yet, so I have none to test it by. My best reading, which I am building now; please word it into `build/requirements/subresources.md` (a new id, R34, or a clause of R15) or correct it:

**R34** Every `links[]` entry carries its containment: `chrome: true` with `chrome_basis` naming the furniture region its href sat in (`<nav>`, `<footer>`, `<header>`, `<aside>`, or `role=navigation|banner|contentinfo|complementary|search`), when that href (as written, trimmed) appears in a furniture region anywhere on the page by R8's rule (body wins anywhere on the open-element stack; a declared `role=` outranks the element name; a commented-out region opens nothing); otherwise `chrome: false` and `chrome_basis: null`. The first furniture basis met in document order is the one named. A link one citation written two ways (a relative href in the body, the absolute one in the nav) is one entry, contained. Containment is a classification, never a filter: every link is recorded exactly as without it, and whether the link IS the site's chrome (recurrence across pages) is capture's R28, not decided here. A link restored from `resume` keeps its containment.

The field names are the ones capture already reads (`acquire.mjs`: `chrome: l.chrome === true`, `chrome_basis`), so capture's layer-3 share needs no rename. The one choice beyond the snapshot's D-340 (`furnitureLinks`): an uncontained link carries an explicit `chrome: false, chrome_basis: null` rather than neither field, so the field is total and never read as absent.
