/* NEGATIVE CONTROL: (run 2026-08-09, REC-79) `civicos-ui/test/refusal-partition.control.mjs` — see that file's header. The arm that bites here is (4): revert `acquireWhy`'s `a.translation` line so the surface falls back to its own hand-authored wording, and ARM 2 below fails naming the capture-specific sentence. Arm (5) is the OVER-STRICTNESS arm: a canned translation in a voice this suite did not anticipate must still PASS. */
/* THE MEMBER ACTUALLY RECEIVES THE SENTENCE (REC-79 / C-38 / DEC-49).
 *
 * **A TRANSLATION WITH NO RENDERER IS THE HAND-COPY SHAPE THIS PROJECT HAS
 * MEASURED AGREEING FOR FREE FIVE TIMES.** REC-64 established that: it pinned
 * the eleven machine fences by DRIVING `machineFences()`, the pack's real
 * consumer, rather than by reading rows back out of the catalogue. This suite is
 * the same discipline for C-38 — the plane-side suite proves the wire carries
 * the sentence, and this one proves a member READS it.
 *
 * ----------------------------------------------- THE DEFECT IT CLOSES
 *
 * `acquireWhy` in `app.html` answered `NOT_CAPABLE` with a sentence it wrote
 * itself: *"This credential cannot write to the record. Capturing needs a member
 * holding contribute."* But `NOT_CAPABLE` is minted by the plane's capability
 * gate for WHATEVER capability the op needed — `create_projects` and `publish`
 * are not `contribute` — so a member refused for creating a project was told
 * about contributing, and a member refused for publishing was told about
 * capturing. **A surface had invented capture-specific wording for a plane-wide
 * refusal**, which is precisely what DEC-49's canned translations exist to
 * prevent and precisely the drift its option (b) was warned about: thirteen
 * surfaces each inventing wording. Found by PL-18.
 *
 * -------------------------------------------- WHAT THIS SUITE ASSERTS
 *
 *   1. The surface renders the plane's canned translation VERBATIM when the
 *      plane sent one — not paraphrased, not wrapped, not summarised.
 *   2. It no longer produces the capture-specific sentence for `NOT_CAPABLE`.
 *   3. It is GENERAL: a code this suite invents, with a translation this suite
 *      invents, is rendered too — so the next translated code needs no edit
 *      here, and the surface is not carrying a second copy of the catalogue.
 *   4. **THE OVER-STRICTNESS ARM.** A refusal the plane did NOT translate must
 *      still get the surface's own honest fallback rather than a blank or a
 *      machine word — DEC-8's floor, and UI-30's precedent that a fallback beats
 *      a blank for an older sovereign instance.
 *   5. The sentence is compared against the ROW, imported from the plane's
 *      catalogue. A string typed here would agree with itself for free.
 */
import { appScript } from "./extract.mjs";
import vm from "vm";
import { webcrypto } from "crypto";
import { ADMISSION_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0, bad = 0;
const ok = (label, cond) => {
  console.log(`  ${cond ? "ok  " : "FAIL"} ${label}`);
  cond ? n++ : bad++;
};

/* A context thin enough to evaluate the surface's own script and no thinner —
   the same shape the act suites use. Nothing here mocks `acquireWhy`; it is the
   real function out of the real file. */
function makeCtx(){
  const el = () => { const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{},
    dataset:{}, value:"", _html:"", textContent:"", disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){} };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; };
  const doc = { querySelector:()=>el(), querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp,
    Promise, Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
    requestAnimationFrame:fn=>fn(), document:doc, location:{ protocol:"https:" },
    history:{ pushState(){}, back(){} }, localStorage:{ getItem:()=>null, setItem(){} },
    window:{ addEventListener(){}, open:()=>null }, fetch:async()=>({ json:async()=>({}) }) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  return ctx;
}

const ctx = makeCtx();
vm.runInContext(appScript() + ";globalThis.__why = acquireWhy;", ctx);
const why = ctx.__why;

/* THE FIXTURE IS ASSERTED NON-EMPTY BEFORE ANYTHING IS JUDGED. A suite that
   renders an absent sentence and compares it to an absent sentence passes. */
const ROW = ADMISSION_CHECKS.NOT_CAPABLE;
console.log("\n--- the corpus, floored ---");
ok(`C-38.5 exists and carries a real sentence (${ROW && ROW.translation ? ROW.translation.length : 0} chars)`,
   !!ROW && typeof ROW.translation === "string" && ROW.translation.trim().split(/\s+/).length >= 8);
ok("acquireWhy was extracted from app.html and is callable", typeof why === "function");

console.log("\n--- ARM 1 · the member reads the PLANE's sentence, verbatim ---");
{
  /* The wire shape the plane now sends, C-38.5 exactly as `index.mjs` builds it. */
  const answer = { ok:false, reason:"NOT_CAPABLE", code:"NOT_CAPABLE", check:ROW.check,
                   translation: ROW.translation, op:"acquire", needs:"contribute", held:[] };
  const rendered = why(answer);
  ok("the surface renders the canned translation BYTE FOR BYTE", rendered === ROW.translation);
  ok("and adds nothing around it — no prefix, no wrapper, no summary",
     rendered.length === ROW.translation.length);
}

console.log("\n--- ARM 2 · and the capture-specific sentence is GONE ---");
{
  const answer = { ok:false, reason:"NOT_CAPABLE", check:ROW.check, translation: ROW.translation,
                   op:"promote", needs:"create_projects", held:["contribute"] };
  const rendered = why(answer);
  /* **THE ASSERTION THAT BITES.** A member refused for `create_projects` must
     not be told about capturing or about contribute — that is the whole defect.
     Asserted on the RENDERED sentence rather than on which branch ran, because
     an equality that costs nothing to produce is not evidence. */
  ok("a member refused for create_projects is NOT told 'Capturing needs a member holding contribute'",
     !/Capturing needs a member holding contribute/i.test(rendered));
  ok("and is not told about capturing at all", !/\bcaptur/i.test(rendered));
  ok("and gets the plane's own sentence instead", rendered === ROW.translation);
}

console.log("\n--- ARM 3 · it is GENERAL, not a NOT_CAPABLE special case ---");
{
  /* A code and a sentence this suite invents. If the surface only knew about
     NOT_CAPABLE, this would fall through to "The document could not be
     captured: …" and the arm would fail. That is what makes this arm the one
     proving no second copy of the catalogue is being grown in app.html. */
  const invented = "A condition this suite invented, in a sentence nothing in app.html has ever seen.";
  ok("a code app.html has never heard of renders its plane-sent translation",
     why({ ok:false, reason:"A_CODE_APP_HTML_HAS_NEVER_SEEN", translation: invented }) === invented);
}

console.log("\n--- ARM 4 · OVER-STRICTNESS: an UNTRANSLATED refusal still gets an honest fallback ---");
{
  /* The direction that would flood a member with blanks. A sovereign instance on
     an older plane sends the code with no translation; DEC-8's floor and UI-30's
     precedent say a fallback beats a blank, and the machine word must not be all
     the member sees. */
  const bare = why({ ok:false, reason:"NOT_CAPABLE" });
  ok("an older plane's untranslated NOT_CAPABLE still yields a sentence", bare.length > 40);
  ok("and that fallback no longer names capture either — it was corrected, not deleted",
     !/\bcaptur/i.test(bare));
  const unknown = why({ ok:false, reason:"SOMETHING_NOBODY_TRANSLATED" });
  ok("and a code nobody translated is still explained rather than blanked", unknown.length > 20);
  /* An empty-string translation must NOT be treated as a sentence — that is the
     `translation: undefined` defect one shape over, and it would blank a member. */
  ok("an EMPTY translation is not rendered as the answer; the fallback runs",
     why({ ok:false, reason:"NOT_CAPABLE", translation:"" }).length > 40);
  ok("a NON-STRING translation is not rendered either",
     typeof why({ ok:false, reason:"NOT_CAPABLE", translation:{ text:"x" } }) === "string"
     && !/\[object/.test(why({ ok:false, reason:"NOT_CAPABLE", translation:{ text:"x" } })));
}

console.log(`\nadmission-translation: ${n} passed, ${bad} failed`);
if (bad) process.exit(1);
