# installer (T18)

**Status** · session_019U1PuTa7xa7HZ5P3tFmS5D · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

N336 / installer R20, read whole (requirements, plan entry, control-plane's entry, the code and both suites). Two points decide what I build; my best reading is stated for each, and I am preparing the change on it now.

**(1) The form in which the plane bundle states its limits (the contract with control-plane's N336 plane side).** The bundle is esbuild output, so a constant does not survive as written: measured here, `export const PLANE_LIMITS = Object.freeze({ subrequests: 10000 })` bundles as `var PLANE_LIMITS = Object.freeze({ subrequests: 1e4 })`, esbuild may rename it on a collision (`PLANE_LIMITS2`), changes quote style, and drops it entirely if nothing reachable from the entry uses it. The installer cannot execute the bundle (a Worker cannot import a string), so it must read the statement from the verified bytes' text.
*Best reading / proposal:* control-plane's constant is a string statement whose text survives bundling unchanged in any quote style: `PLANE_LIMITS_STATEMENT = "bio-plane-limits/1 subrequests=10000"` (the tag, then one `key=<positive integer>` per key of `bio-plane/wrangler.jsonc`'s `limits`, keys sorted, single spaces, no quotes or backslashes), pinned by its test to `wrangler.jsonc`, and exported from the plane's entry module (`bio-plane/src/index.mjs`) so the bundle keeps it. It may also export the parsed object for its own use. The installer reads it from the bundle R8 chose: exactly one distinct `bio-plane-limits/1 …` statement, every value a positive integer → those limits, sent as they are on every plane upload; none → refused "states no limits"; two different statements, or a malformed one → refused "states them unreadably". If you prefer another form, name it in the ANSWER and in control-plane's CHANGE; my side is ~10 lines either way.

**(2) What "refused" means while no signed release states limits.** Today `release/` (0.79.0, the built-in embed) states none. Read literally, R20 then refuses every install and every update until a release cut after control-plane's change is signed and embedded: the installer bundle regenerated at this layer's close (§14) would refuse everything if deployed, and the module's own suites, which mostly run on the built-in release, must instead serve a newer signed release that states limits.
*Best reading:* R20 refuses a release, not the act, when there is a better one: a repository release whose plane states no limits (or states them unreadably) is not used and is named on the page, exactly as R8 treats one that fails verification, and the built-in installs; when the built-in release states none either, the install or update is refused by name before any plane upload. To keep R4 ("a refusal before `install` says nothing was created, and nothing was"), the release is selected (step `rel`) before `plan` and `r2` on the install, so this refusal leaves no bucket or probe behind; on the update it stays where it is (an update creates buckets only to heal, R17). Until the next signed release is embedded, the installer built from this tree refuses every act, by name: the live installer is unaffected (deployment is a manual paste, `DEPLOY.md`), but the newgroup bundle you regenerate at the close should not be deployed before that release. The suites' arms that need an install to proceed will run on a newer fixture release that states limits; the built-in fallback arms will assert R8's sentence and then R20's refusal.
Please confirm (2), or say the literal reading (no fallback to the built-in) or another.

Not blocking: I carry on with everything that does not read control-plane.

## J2 · REPORT

B2 applied (tranche merged, R20 as amended). Pushed on `job/T18/installer`: `planeLimits` reads the one `bio-plane-limits/1 k=v …` statement (keys sorted, positive integers, any quote style) from the bytes R8 chose; a release stating none or unreadably is passed over and named, the built-in used; a built-in stating none refuses the act by name, on the install before anything is created (the release is now chosen before `plan` and `r2`). R20's test replaces its todo (with a negative control: a constant restored in the install upload fails R20 alone, 28/1). The fixture and the wizard suite now serve releases that state limits; the arms about the built-in fallback assert whichever holds, so they survive the cut that embeds a release stating them. `npm test`: embed 23/0, wizard 207/0, requirements 29 pass / 4 todo. format, architecture, coverage (33/33), ownership: 0 failures.

Left, waiting on your CHANGE that control-plane has merged: one pin that this tree's plane states its limits as R20 reads them, equal to `bio-plane/wrangler.jsonc`'s (read from control-plane's statement, not from a release). Then COMPLETE.

For the close (§14, not mine to write): `newgroup/dist/newgroup.bundled.mjs` is now stale against `newgroup/src/index.mjs`; per K724 the regenerated bundle is not to be deployed before a release stating limits is embedded (built from this tree it refuses every act, by name).

## J3 · QUESTION

B3 applied: tranche merged; the pin is pushed. It builds this tree's plane in memory with the bundler's own recipe (`buildMember(planeMember(), {write: false})` from `bio-plane/scripts/fleet-bundle.mjs`), the bytes a release would sign, and asserts `planeLimits` reads exactly `bio-plane/wrangler.jsonc`'s `limits` from them. It passes (requirements 29 pass / 0 fail / 4 todo; wizard 207/0; embed 23/0), and a control (the statement changed to 999 in control-plane's source, restored by checkout) fails it alone.

The architecture check now reports 1 failure: the test imports `bundler`, which installer does not declare in `uses`. (format, coverage 33/33, ownership: 0 failures.)

Best reading: add `bundler` (layer 1, earlier in the order) to installer's `uses` in `modules.json` — a test-only use, and the installer's own bundle is already built by it (manifest §14). I need that edit merged to pass the check; then I record completion and post COMPLETE. If you prefer the pin read the committed `bio-plane/dist/bio-plane.bundled.mjs` instead (no import, but red until you regenerate it at the close), or read control-plane's source text, say so and I change it.
