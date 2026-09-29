# legacy-index (T11)

**Status** · session_017wnYAQFtWif7k7G5n1MVfL · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings. I am building both as stated below while the question is open.

Q1 (N247, legacy-index's share). "With op=monitor in the durable object, the Worker holds the computed-verdict success site (D-240 (b), (c))." My reading: nothing is added to the Worker for (b) and (c). LEGACY-TESTS re-anchored both arms in T9 on a planted specimen (plane-envelope.test.mjs ~L480, `PLANT_COMPUTED`), and they pass today. Writing a computed-verdict site into index.mjs only so a detector has a specimen would pin a shape and not meet a requirement. My share is therefore the envelope half: hand `doAnswer` into `monitorOp` (K372). The one plane-envelope arm still red is "`doAnswer` is the only thing ... that reads `ok` off a Durable Object envelope" (63/1 today). It stays red until monitoring drops its `openEnvelope` fallback (monitoring/index.mjs ~2126), which is monitoring's file; I am reporting it separately.

Q2 (monitoring R30, `monitorpause`, "an administrator"). legacy-index has no requirements file. Two things limit what I can build: the Worker has no administrator refusal code of its own, and NOT_AN_ADMIN is membership's (C-96.1, one code one site, K231/K275). My reading: `monitorpause` is reached by the root of trust only. That is the ADMIN_TOKEN bearer (`classes: ["admin"]`) and the founder's session (`SESSION_OPS.admin` alone), the same cut as `governorconfig`. An enrolled administrator's session is refused with the existing SESSION_ROLE_CANNOT_REACH_OP ("reserved to the founder's session"), and no new code is minted. `by` is the control plane's `actor` stamp (the session's member, or `class:admin`). The wider reading, every enrolled administrator, needs one of two things: a membership service that refuses a non-administrator by its own code, or a new row. Both belong to other modules, and I would defer that half through you. `monitorslate` is a read on `monitoring`'s cut (admin, member, probe) and takes the viewer stamp.
