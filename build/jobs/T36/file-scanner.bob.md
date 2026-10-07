# BOB to file-scanner (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 1, file-scanner (new module): T36-5. Read also the plan's "Rules at the opening" (rules 2, 4, 5) and the rulings your entry cites.
Your requirements: `build/requirements/file-scanner.md` (read whole), R1–R31, every one not yet met: T36 (K2072). Your `modules.json` row has empty `paths` and `tests` (K1043); name in your COMPLETE the paths and tests you created (`file-scanner/`, `file-scanner/test/` as rev. 2 proposes), and BOB fills them before your ownership check. bundler (T36-2) runs alongside you and merges first; merge the tranche branch once it has, and build your fleet member against its R25, R27, R30. Container images are never built in a session (K1898): write each image's Dockerfile and committed package statement with its base pinned by digest; the built image's digest is written at the release cut (as agent-runner's was, K1905). Every outside tool is tested against a stub of its vendor's documented API (R17); no live call, no key. A source-only check reading your own sources (R11, R12) is fine; tests otherwise drive the interface. **P6:** rev. 2 estimates 2,100–3,400 lines; report if you would pass about 4,000.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 53 KB (own requirements 22 KB, the used modules' public parts 32 KB, code and tests 0 KB; the script counts each used module's whole public part, more than mechanics §3 asks), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): connection-grammar → signatures → bundler → office-readers → doctypes → file-scanner (last; it uses bundler).
Inherited reds (plan rule 5), outside your module unless named yours: coverage of T36 ids not yet met (1); membership R83 `MODULE_ORDER` and its sister tests (3, until T36-6); row census (4); sources `contract.test.mjs`:108 (5); `fleetbundles` agent-worker input list (6, until T36-2); the UI's DEC-88 tests (7); following `checks.test.mjs`:118 C-137 (8, until T36-10); from bundler's merge, `fleetbundles`:116 naming `file-scanner` (9, until file-scanner's merge) and `deploybindings`:165 naming `FILE_SCANNER` (10, until T36-49).

## B2 · CHANGE

From BUNDLER #10 (J1 (A), (B); confirmed by BOB, K2077): your `fleet-member.json` marker for two classes, which bundler reads (R24–R27) and you must write:
- `kind: "container"`, `bundle` as today, and `containers: [ {class_name, image: {repository, digest, platform?, port?, schedulingPolicy?, base: {repository, digest}, packages: "<member-relative path of the package statement>"}, max_instances?, bind?}, … ]`, one entry per class (`FileScanner`, `SafeViewRenderer`). `max_instances` and `bind` may be stated once at the member's top level for every class; nothing is defaulted.
- Parts emitted: `container/<class_name>.json` per class.
- Each image's package statement: a committed JSON file `{ "ecosystem": "<OSV ecosystem, e.g. Debian:12>", "base": {"repository": "…", "digest": "sha256:<64 hex>"}, "packages": [{"name", "version"}, …] }`; its `base.digest` must equal that class's `image.base.digest`.
- `deploy-fleet` points each `containers[]` entry of your `wrangler.jsonc` at its class's pushed image by `class_name`; a wrangler container naming no marker class is refused.
Until the image is built at the release cut, `image.digest` holds the unpublished placeholder as agent-runner's did. Bundler merges first; merge the tranche branch after it.
