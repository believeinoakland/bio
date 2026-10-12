# installer (T46)

**Status** · session_01JbscthhJabkciTjspMmhzL · depth 2 · WORKING · handled B1

## J1 · QUESTION

R49 'the bundled source hold no such name': my reading is the installer's own code. The test checks newgroup/src (index.mjs, ui.mjs, signers.mjs and the new images module) and newgroup/dist/newgroup.bundled.mjs with the embedded plane release's RELEASE_SOURCE literal taken out. From 0.83.0 the plane itself (ai-runs R78) reads CIVICSMITH_TEST_INSTANCE, so the signed release the installer embeds will carry the name, and that is the plane's text, not the installer's. I am going ahead on this reading; it does not block the rest of the job.
