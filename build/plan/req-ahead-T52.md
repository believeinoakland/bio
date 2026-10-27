# Requirement lines written ahead (P18)

**Status** · Lines ruled by BOB for a layer or round not yet started; each is written into its module's requirement file right before that START (a live id with no test fails the coverage check at an earlier close, K5377), then removed from here.

## file-scanner (completion round; K5384)

- **R36** (T52 completion round; U5, FILE-SAFETY #1's finding; `file-safety` R59; amends R8) *(not yet met: T52)* **The renderer's version names its own code.** `renderer_version`, in `/version` (R8) and wherever a render's answer or failure carries it, changes whenever the `SafeViewRenderer`'s code or image changes, not only its packages: it carries the pinned packages' versions and the renderer image's digest (or a build id derived from its code), so `file-safety` R59 tries a render again once after a renderer fix. Test: two renderer builds that differ only in their code answer different `renderer_version`s; the same build answers the same one on every call; control: the packages' versions still appear in it.
