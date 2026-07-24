/**
 * BIO promotion-service.gs v0.12.10 (Product D): the standard off-kernel accelerator.
 *
 * v0.12.10: refusal records are keyed the way the reference twin keys them.
 *   core/promote-reference.js is the definition and keys a discarded package
 *   <manifest.created>_<manifestHash8>; the verify_failed and gate_failed call
 *   sites here passed the FULL 64-character digest into the parameter named
 *   manHash8, so the two implementations wrote different filenames for the same
 *   refusal. The conformance assertion matched /refused_.*\.json/ and could not
 *   tell them apart. Live consequence, observed on INFO-2026-5460 on 2026-07-22:
 *   the artifact matched no key C-12.2 could resolve, and since C-12.2 required
 *   every history file to carry a manifest entry, one refused package froze the
 *   bundle permanently. That bundle holds migration_instant, so the fence became
 *   unchangeable, which is the C-12.1 deadlock shape by a second route.
 *   bio-checks 1.16.4 re-seats the accounting (the refusal class is
 *   self-describing and is not indexed by the version manifest); this change
 *   restores twin parity, and conformance now pins the exact key shape.
 *
 * v0.12.9: abandonment aging, at the sweep layer. An INCOMPLETE package (the
 *   manifest names files that are not there) reads as mid-race consumption,
 *   which is right for seconds and wrong for hours: an interrupted write leaves
 *   exactly that shape and then wedges the queue forever (INFO-2026-0946 sat
 *   six hours). The core cannot tell the two apart without a clock, and a clock
 *   there would break twin determinism, so it reports `incomplete` and the
 *   sweep decides on age: 30 minutes for incomplete (longer than the 6-minute
 *   execution ceiling, so no real race survives it), 7 days for diverged. Both
 *   discard through the same preserve-then-remove path as core refusals. A
 *   marker now separates the clock-free core from the sweep layer and a battery
 *   assertion enforces it.
 * v0.12.8: terminal refusals self-clean. verify_failed, gate_failed and an
 *   unreadable manifest now discard the pending package instead of leaving it
 *   "for repair or discard": nobody repairs .pending files by hand, and the
 *   retained package wedged the queue until an operator cleaned Drive. The
 *   payload is PRESERVED into _history/refused_<stamp>/ before removal and the
 *   reason recorded alongside it, so a refusal stays fully reversible from the
 *   store alone. Live bytes are still never touched. DIVERGED is exempt: its
 *   sanctioned repairs need those bytes, and aging it out is sweep policy, not
 *   part of this clock-free core. The sweep uses listAllPaths, since a real
 *   package's pendings sit under data/ and snapshots/.
 * v0.12.7: reads refuse a bundle folder holding duplicate file names.
 *   Every read resolves by name and Drive permits duplicates, so the old
 *   behaviour served one file's bytes under another's listed size with a
 *   sha256 that correctly described the wrong content. Observed live on
 *   2026-07-22. Refusal is the only safe answer; verification cannot catch it.
 * v0.12.6: status reports the resolved key registry (loaded or not, its
 *   hash, signer count, pinned root key count, and both fence values). The
 *   gate calls releaseRegistry_ on every run, but while both fences are off
 *   a registry that silently failed to resolve is indistinguishable from a
 *   working one, and would only announce itself later, when every release
 *   depends on it. No key material is reported, only whether it loaded.
 *
 * v0.12.5 (D2.3): the gate is handed SHA-512 (native here) and the release
 *   key registry, read from the store by releaseRegistry_ with the bundle id
 *   in Script Properties and the pinned root keys in BIO_ROOT_KEY_n. Root
 *   keys deliberately do NOT come from the registry bundle: pinning them
 *   inside the artifact they protect would let anyone who can edit it swap
 *   key and signature together. An unreadable registry reports itself as
 *   unavailable rather than being omitted, because omission would turn it
 *   into a pass. The TEMPORARY dedupe op is removed here.
 *
 * v0.12.4 (DEFECT-CREATION-FOLDER-RACE): bundle-folder creation is
 *   serialized under a script lock and RE-CHECKED inside it. The client
 *   posts package files concurrently, so on a creation every simultaneous
 *   post found no folder and every one created it; Drive permits duplicate
 *   names, so five files produced four folders and a bundle id stopped
 *   denoting one thing. The re-check is what makes the fix correct rather
 *   than merely narrower. Only the create branch locks. status reports
 *   duplicateBundleIds so the condition is visible without being asked
 *   for. op=dedupe was the TEMPORARY remediation for the folders this
 *   defect already created; it was used once, the store reported
 *   duplicateBundleIds 0, and it was removed at 0.12.5 per its own
 *   admission. The prevention above is permanent; the remediation was not
 *   meant to outlive the event.
 *
 * v0.12.3 (D2.1 support): status reports gateVersion and gateSha, the
 *   bio-checks version and hash the DEPLOYED code actually carries. Without
 *   them an operator who pastes a new build has no remote way to confirm the
 *   paste landed: selftest passes on any coherent embed, old or new, so it
 *   proves integrity but never freshness. Read from the same constants the
 *   embed's integrity check uses, so they cannot drift from what is running.
 *   Embedded gate refreshed to bio-checks 1.15.0 (the release-signature
 *   primitives; no check calls them yet, C-18.8 is D2.3).
 *
 * v0.12.2 (B2 live fix 2): the TIME budget. Apps Script kills any
 * execution at six minutes, and the first publish pass (the whole
 * released backlog) stacked behind the daemon chain does not fit.
 * publisherCore_ now honors a deadline: past it, remaining documents
 * defer and the pass still finishes (index included); skip-if-exists
 * makes resumption free. timeTick caps its publish slice at two
 * minutes. publishNow() is the operator entry point, runnable from the
 * editor dropdown (trailing-underscore functions are not), with a wide
 * deadline and the result in the execution log: run it repeatedly to
 * drain a backlog.
 *
 * v0.12.1 (B2 live fix): two UrlFetchApp transport realities the fake-
 * adapter battery could not see. (1) UrlFetchApp has no HEAD: the
 * presence probe is now a one-byte ranged GET (200/206 exists, 404
 * absent). The 0.12.0 probe threw on the first exists() and aborted
 * every publish pass before anything uploaded. (2) Byte-array payloads
 * now wrap in Utilities.newBlob: a raw number array coerces to a comma-
 * joined string in UrlFetchApp, which would have corrupted every binary
 * document silently. Structural conformance now pins both.
 *
 * v0.12.0 (P2M8 B2): the CDN publisher. A trigger-side single writer
 * pushing the PUBLIC subset to Cloudflare R2 (S3 API, SigV4 over
 * UNSIGNED-PAYLOAD via UrlFetchApp): released (verified) information
 * bundles' registered documents, content-addressed at doc/<sha256> with
 * immutable cache-forever headers, then index.json at a 60s TTL,
 * documents first, index last, every pass. Skip-if-exists idempotence;
 * per-cadence byte budget with deferred resume; multipart part-by-part
 * for split documents (peak residency one part); legacy base64-at-rest
 * decodes per part so the edge serves true bytes. Config is four Script
 * Properties (R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY); unconfigured is a recorded no-op. No new op;
 * no kernel change; the register hash remains the trust root.
 *
 * v0.11.7 (P2M8 A3 live measurement): op=readindex, the client's cheap
 * index poll (one Drive read of the stored derived artifact), and a
 * timeTick step regenerating that artifact each cadence after promotions
 * land. The 0.11.6 force-and-fetch measured 40-45s per poll live (a full
 * 29-bundle rebuild per call); the cadence-regenerated read is the CDN
 * model applied to Phase A, and B3 moves this exact artifact to a static
 * edge read. op=reindex remains the on-demand force (and still returns
 * the index it builds).
 *
 * v0.11.6 (P2M8 A3): op=reindex returns the index it just built (the
 * `index` field), the client's fresh-by-construction one-call docket
 * fetch. Response-shape extension of an existing op, no registry change;
 * op=read's selector rail correctly rejects the index folder, and the
 * Phase B CDN replaces this poll with a static edge read of the same
 * artifact. Nothing else changes from 0.11.5.
 *
 * v0.11.5 (P2M8 A1): bio-checks embed refreshed to 1.13.0, which adds the
 * elidedPaths presence declaration for tier-scoped callers (the client
 * mirror). The endpoint passes nothing and stays byte-complete: gate
 * behavior here is unchanged. This revision carries no endpoint op or
 * kernel change; the A2 client-enabling ops land in this same version
 * before it is pasted (one paste per the P2M pattern).
 *
 * v0.11.4 (P2M6 4a item 2, execution-ceiling engineering, time axis, plus
 * the C-20.1 tail fix): checkpointed promotion. After a non-mechanical
 * package passes the gate and before any write, the promoter persists an
 * advisory GATE_PASSED-<manifestHash8>.json marker binding the full
 * manifest sha256; a successor execution whose pending package is
 * byte-identical (verify has re-proven the held bytes against the
 * manifest's per-file hashes) skips re-gating and proceeds to the
 * idempotent write step, so a package too large for verify+gate+write in
 * one 6-minute execution makes forward progress instead of livelocking.
 * Markers are honored within GATE_MARKER_TTL_MS_ (48h), removed at
 * consumption, ignored on any hash mismatch (read-once preserved), and
 * surfaced by C-16.5 if orphaned. bio-checks 1.12.0 rides the embed: the
 * C-20.1 auditor's tail convention now accepts live as a mechanical
 * promotion's post state only while live still hashes to the bundle.md
 * sha the promotion's own record wrote; a pending member edit entering
 * the gate image is no longer misattributed to the last mechanical
 * promotion and refused (the first member edit over a tail member-attest
 * surfaced this, the 1.10.1 misattribution class at the chain tail).
 *
 * v0.11.3 (P2M6 4a, execution-ceiling engineering, memory axis): the
 * streaming-hash fix for the M3' exit OOM. bio-checks 1.11.0 adds an
 * incremental FIPS 180-4 SHA-256 (pure JS, Uint8Array-native,
 * battery-cross-validated against WebCrypto on sizes and chunk boundary
 * offsets); C-18.6 streams byte-stored parts through it one part at a
 * time instead of reassembling the whole. On the .gs side: the promotion
 * decode injection switches from Utilities.base64Decode (plain number
 * arrays, ~8 bytes per content byte) to the embedded b64ToBytes (true
 * Uint8Array, 1 byte per element); sha256Hex_ hashes byte input through
 * the embedded streaming hash, retiring the signed-conversion pass; the
 * Drive adapter's sha256 delegates to sha256Hex_. Peak promotion memory
 * for a parts package drops from held text + ~8x decoded content + whole
 * reassembly + ~8x digest conversion to held text + decoded parts at one
 * byte per byte + one 64-byte compression block. Strings still hash
 * through the native Utilities digest (unchanged, fast path).
 *
 * v0.11.2 (embed-only): bio-checks 1.10.1, the C-20.1 snapshot-indexing
 * fix. The auditor's shifted indexing misattributed later member
 * elevations to mechanical creations and the gate refused valid migration
 * packages against member-ratified bundles; the corrected convention reads
 * the promoter's actual snapshots (pre keyed by own promotion, post by
 * forward walk, gaps skip). No .gs logic change outside the embed.
 *
 * v0.11.1 (P2M5 incident hardening): READ-ONCE promotion. The verify step
 * reads each pending file exactly once, holds the verified bytes, and the
 * gate and the write both consume the held bytes: the bytes verified are
 * the bytes gated are the bytes written, closing the window in which a
 * pending file mutated between gate and write (a racing writer, a
 * stale-code execution during a deployment transition) could land unvetted
 * content live. The selftest promotes through the gated path (its package
 * is non-mechanical); the ungated selftest promoter is retired. Incident:
 * the P2M4 refusal-test alias reached live via a 0.10.2 stale-code trigger
 * execution during the 0.10.3 deployment transition and was carried
 * forward by ungated selftests; repaired by gated member promotion
 * 20260720T214302Z (SESSION-REPORT-P2M5.md).
 *
 * v0.11.0 (P2M5, M3 member submissions, decode-at-promotion): base64 becomes
 * a wire encoding only, never a storage format. Manifest file entries may
 * declare encoding base64; the promoter decodes them at the write step and
 * the post image carries the decoded bytes, so the gate (bio-checks 1.10.0,
 * information@2, C-18.6) hashes true content at rest. The Drive adapter
 * gains readBytes and writeBytes; sha256 handles byte arrays with signed
 * conversion. The member-attest daemon operation attests member submissions
 * post-landing (RFC 3161 over the registered hash, co-archive when the
 * locator is fetchable), a mechanical package under the member-attest
 * envelope.
 *
 * v0.10.3 (P2M4, D9+D10+D16): the promotion gate. Non-mechanical packages
 * (member, session, client) are gated at promotion by the embedded checks
 * module over their full post-promotion image, BEFORE any write; a refusal
 * (status gate_failed) touches nothing and leaves the package pending for
 * repair or discard. Mechanical (daemon) packages keep gating at production
 * and skip the rung. Decided July 20 as Tech Arch v10 Section 10.11 option
 * (a); the forged-mechanical residual is caught after the fact by C-20.1.
 * Also: typeRootFor_ extracted as the one type-root mapping (D10,
 * battery-pinned with creation-by-packaging coverage in conformance.mjs).
 *
 * v0.10.2 (M2', in progress): the embedded gate per the ratified daemon slate
 * Section 0. assemble.py embed-gate propagates the canonical checks.js into
 * this file byte-verbatim behind a deterministic wrapper (bioChecksModule_);
 * check-versions asserts the embed against the canonical file, the runtime
 * hash-verifies before compiling, and test/conformance.mjs proves gate-verdict
 * parity against the real module over shared fixtures under V8 (node vm).
 * One codebase, three call sites; the creation rule stands unrelaxed.
 *
 * Dual-mode: a time-driven trigger (ambient latency) and a trigger-only web
 * endpoint (on-demand latency), both running the identical convergent
 * promotion algorithm (BIO_State_Rules_Consistency v1.1 Section 2.4; the
 * executable reference is core/promote-reference.js, to which this file's
 * promoteBundleCore_ conforms byte-for-byte, verified by test/conformance.mjs).
 *
 * v0.6.4: quarantine replaced by discard-and-converge (operator decision,
 * July 11): an unreadable manifest is permanently corrupt, carries nothing
 * recoverable (the gate-passed .pending files are the payload and survive),
 * and preserving it violates no obligation, so the promoter deletes it and
 * converges. Orphaned .pending files then surface through existing law
 * (C-16.4, orphaned-pending) with re-produce or discard as the repairs; the
 * Drive adapter trashes rather than hard-deletes, an incidental 30-day net.
 * Supersedes v0.6.3's envelope-and-account quarantine, which conflicted with
 * the spec's append-only history law. CONFORMANCE SURFACE CHANGED:
 * core/promote-reference.js carries the identical edit.
 * v0.6.2: two promoteBundleCore_ fixes from the 2026-07-10 live conformance
 * run (48/48). F1: a permanently malformed PENDING_PROMOTION.json was never
 * consumed, wedging the queue forever (revisited every sweep, listed first in
 * status with created ''); it is now quarantined idempotently to
 * _history/malformed_<sha8>.json and consumed. F2: extensionless files got
 * mangled snapshot names (lastIndexOf('.') == -1 split the final character);
 * snapshot paths now handle the no-extension case. BOTH CHANGES ALTER THE
 * CONFORMANCE SURFACE: port identically to core/promote-reference.js and add
 * cases to test/conformance.mjs in the same commit.
 * v0.6.1: setup() endpoint-URL capture fixed. ScriptApp.getService().getUrl()
 * returns the /dev head-deployment URL when invoked from the editor (the only
 * context setup() runs in), so v0.6 silently stamped an editor-auth /dev URL
 * into the credential files. setup() now resolves the caller-facing base via
 * resolveEndpointBase_ (PROXY_URL, then the operator-pasted WEBAPP_EXEC_URL
 * Script Property, then the service URL only if genuinely /exec) and refuses
 * to ever write a /dev URL. No endpoint behavior changed.
 *
 * OFF-KERNEL DISCIPLINE (Tech Arch v6 Section 10.4): idempotent; never
 * load-bearing (the checker's pending/staleness findings persist regardless);
 * degrades gracefully (a dead accelerator leaves behavior identical to a group
 * that never deployed one). The endpoint is TRIGGER-ONLY: it accepts no
 * content and executes no commands; the only caller parameters are the token
 * (quota and attribution, never a security boundary) and an optional bundle
 * selector validated against the store. The accelerator never judges content:
 * it verifies hashes and executes file mechanics; the gate re-run after
 * promotion belongs to the client or the next session.
 *
 * DEPLOY (one step per group; see DEPLOY.md): paste into a new Apps Script
 * project; run setup(); deploy as Web App (execute as me, access: anyone);
 * copy the /exec URL into Script Property WEBAPP_EXEC_URL; run setup() once
 * more to stamp it into the credential files.
 */

// ---------------------------------------------------------------------------
// Pure convergent-promotion core. No Apps Script globals in this section.
// fsa adapter contract (paths relative to the bundle root, '/'-separated):
//   exists(p) -> bool          readText(p) -> string (utf8)
//   writeText(p, s)            copyFile(src, dst)  (binary-safe, mkdirp implied)
//   remove(p)                  (missing is success)
//   listAll() -> [paths]       sha256(s) -> lowercase hex of utf8 bytes
// ---------------------------------------------------------------------------

var BIO_ID_RE = /^(INFO|PROB|PROJ|ACTN)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
var CLAIM_STALE_MS = 10 * 60 * 1000;
/** Checkpointed-promotion gate marker honor window (0.11.4, 4a item 2):
    long enough to survive retry cadences across executions (the trigger
    sweeps for hours), short enough that a crashed checkpoint cannot vouch
    for a package indefinitely. Mirrored by C-16.5's GATE_PASSED staleness
    window in bio-checks. */
var GATE_MARKER_TTL_MS_ = 48 * 60 * 60 * 1000;

/**
 * Discard a pending package that can never promote, and say why in the record.
 *
 * Terminal refusals used to be left in place "for repair or discard". In
 * practice nobody repairs .pending files by hand: the member still holds their
 * edits client-side and simply resubmits. What the retained package actually
 * did was leave junk in the folder plus a manifest that kept the bundle
 * queue-eligible, so the trigger re-refused it every cadence until an operator
 * cleaned it out through the Drive UI. Observed twice on 2026-07-22, once from
 * a malformed write and once from the 0946 folder race.
 *
 * So a terminal outcome now self-cleans as part of the normal cadence. This is
 * not silent deletion: the refusal, its reason and any gate findings are
 * written to _history first, and the adapter trashes rather than hard-deletes,
 * so the bytes remain recoverable from Drive's trash.
 *
 * Only TERMINAL outcomes come here. 'diverged' does not: it has sanctioned
 * repairs (rebase, supersede, apply-disjoint) that operate on the pending
 * package, so discarding it would destroy the thing the repair needs. Stale
 * diverged packages age out separately, on a TTL.
 */
function discardPendingPackage_(fsa, nowMs, status, note, findings, man, manHash8) {
  var iso = new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
  // Deterministic across actors, exactly like the promotion record: keyed by
  // the manifest, never by the clock. Two actors racing the same refusal write
  // the same path and the second is a no-op, and the conformance twin can be
  // byte-compared without a clock injection.
  var stamp = String((man && man.created) || 'unknown').replace(/[-:]/g, '') + '_' + String(manHash8 || 'nomanifest');
  var record = {
    outcome: status,
    note: note,
    findings: findings || [],
    manifest: man ? { target: man.target, base: man.base, created: man.created, author: man.author,
                      files: (man.files || []).map(function (f) { return f.name; }) } : null
  };
  var recPath = '_history/refused_' + stamp + '.json';
  try { if (!fsa.exists(recPath)) fsa.writeText(recPath, JSON.stringify(record, null, 2)); }
  catch (er) { /* the discard still proceeds: junk left behind is the worse outcome */ }

  // Every .pending file present, not only those the manifest names. A manifest
  // that was itself malformed is exactly the case where the two sets differ,
  // and the unnamed ones are the litter nobody would find.
  //
  // PRESERVE BEFORE REMOVING. The old contract's real virtue was that a
  // refusal is provably inert, which is why 'touched nothing' was asserted
  // everywhere. Self-cleaning gives some of that up, so the bytes are copied
  // into _history first and the refusal stays fully reversible from the store
  // alone, without relying on Drive's trash or on the member still holding
  // their edits client-side. A refusal now costs history bytes; wedging the
  // queue and handing an operator a manual Drive cleanup cost more.
  var removed = [];
  var preservedDir = '_history/refused_' + stamp;
  // listAllPaths, NOT listAll: listAll is root-level only, on the assumption
  // that pendings live at the root. That assumption is false. A real package
  // writes data/provenance.json.pending and snapshots/<name>.sig.pending, so a
  // root-only sweep would leave behind exactly the files a CORRECT package
  // creates and only ever clean up after malformed ones.
  var all = [];
  try { all = (typeof fsa.listAllPaths === 'function') ? fsa.listAllPaths() : fsa.listAll(); }
  catch (el) {
    if (man && man.files) for (var j = 0; j < man.files.length; j++) all.push(man.files[j].name + '.pending');
  }
  for (var i = 0; i < all.length; i++) {
    if (/\.pending$/.test(all[i])) {
      var keep = preservedDir + '/' + all[i].replace(/\.pending$/, '');
      try { fsa.copyFile(all[i], keep); }
      catch (ec) { keep = null; /* preservation is best-effort; the discard still proceeds */ }
      fsa.remove(all[i]);
      removed.push({ path: all[i], preserved: keep });
    } else if (/^GATE_PASSED-[0-9a-f]{8}\.json$/.test(all[i])) {
      fsa.remove(all[i]);
    }
  }
  record.discarded_files = removed;
  try { fsa.writeText(recPath, JSON.stringify(record, null, 2)); }
  catch (er2) { /* the record was already written above without the file list */ }
  fsa.remove('PENDING_PROMOTION.json');
  return removed;
}

function promoteBundleCore_(fsa, opts) {
  var actor = (opts && opts.actor) || 'accel';
  var useClaim = !opts || opts.useClaim !== false;
  var nowMs = (opts && opts.nowMs) || Date.now();

  if (!fsa.exists('PENDING_PROMOTION.json')) return { status: 'converged', note: 'no pending manifest' };
  var manifestRaw;
  try { manifestRaw = fsa.readText('PENDING_PROMOTION.json'); } catch (e) { return { status: 'converged', note: 'manifest vanished mid-race' }; }
  // Held here, not at the snapshot step: the refusal paths below key their
  // _history record off it, and they run long before step 4.
  var manHash = fsa.sha256(manifestRaw);
  var man;
  try { man = JSON.parse(manifestRaw); } catch (e) {
    // v0.6.4 discard-and-converge: writes are atomic, so an unreadable
    // manifest is permanently corrupt, not mid-write. Left in place it wedges
    // the queue forever; preserved it holds nothing recoverable (the
    // gate-passed .pending files are the payload and survive untouched, and
    // the checker surfaces them as orphaned-pending with re-produce or
    // discard as the sanctioned repairs). Delete it and converge; the Drive
    // adapter trashes rather than hard-deletes.
    var umRemoved = discardPendingPackage_(fsa, nowMs, 'manifest_unreadable', 'manifest did not parse', [], null, fsa.sha256(manifestRaw).slice(0, 8));
    return { status: 'converged', note: 'manifest unreadable; discarded (' + umRemoved.length + ' orphaned pending file(s) trashed, reason recorded in _history)', discarded: umRemoved };
  }

  // 1. Verify, READ-ONCE (0.11.1, incident hardening): each pending file is
  // read exactly here, hash-verified against the manifest, and HELD. The
  // gate judges the held bytes and the write step lands the held bytes, so
  // the bytes verified are the bytes gated are the bytes written. A pending
  // file mutated after this point (a racing writer, a stale-code execution)
  // can no longer put unvetted content live: the mutation is simply never
  // read again.
  var held = {};
  for (var i = 0; i < man.files.length; i++) {
    var entry = man.files[i];
    var p = entry.name + '.pending';
    var raw;
    // A missing package file reads as "another actor consumed it mid-promotion",
    // which is right within seconds and wrong after hours: an interrupted WRITE
    // leaves exactly this shape, and the manifest then wedges the queue forever
    // (observed on INFO-2026-0946, six hours and counting). The core cannot
    // tell the two apart without a clock, and a clock here would break twin
    // determinism, so it reports `incomplete` and the sweep decides on age.
    try { raw = fsa.readText(p); } catch (er) { return { status: 'converged', incomplete: true, missing: entry.name, note: 'package file consumed mid-race: ' + entry.name }; }
    if (raw === null || raw === undefined) return { status: 'converged', incomplete: true, missing: entry.name, note: 'package file consumed mid-race: ' + entry.name };
    if (fsa.sha256(raw) !== entry.sha256) {
      var vfNote = 'hash mismatch on ' + entry.name + '.pending; never promoting';
      var vfRemoved = discardPendingPackage_(fsa, nowMs, 'verify_failed', vfNote, [], man, manHash.slice(0, 8));
      return { status: 'verify_failed', note: vfNote + '; package discarded (' + vfRemoved.length + ' pending file(s) trashed, reason recorded in _history)', discarded: vfRemoved };
    }
    held[entry.name] = raw;
  }

  // 2. Base check
  var pendingBundle = null;
  var alreadyPromoted = false;
  for (var j = 0; j < man.files.length; j++) if (man.files[j].name === 'bundle.md') pendingBundle = man.files[j];
  if (fsa.exists('bundle.md')) {
    var liveHash = fsa.sha256(fsa.readText('bundle.md'));
    if (pendingBundle && liveHash === pendingBundle.sha256) {
      alreadyPromoted = true; // promoted by another actor: converge on consumption below
    } else if (man.base !== liveHash) {
      return { status: 'diverged', note: 'base ' + String(man.base).slice(0, 12) + ' != live ' + liveHash.slice(0, 12) + '; sanctioned repairs: rebase | supersede | apply-disjoint' };
    }
  }

  // 2a. The promotion gate (D9, Tech Arch v10 Section 10.11, decided option
  // (a)): a NON-MECHANICAL package earns promotion by passing the embedded
  // gate over its post-promotion image BEFORE any write, history included.
  // Mechanical (daemon) packages were gated at production (deliverPackage_)
  // and skip this rung; everything else (member, session, client packages)
  // is gated here, closing the window in which an ungated malformed member
  // package could reach live store with session-side discipline as the only
  // defense. The gate is injected by the binding (opts.gate receives the
  // post image, returns { pass, findings }); a binding that supplies no gate
  // runs the pre-0.10.3 algorithm, which keeps the reference-conformance
  // surface unchanged, and the .gs call site always supplies it. A refusal
  // touches nothing and leaves the package pending for repair or discard.
  // Residual (recorded): writer 'mechanical' is a manifest claim; a forged
  // marker bypasses this rung and is caught after the fact by the C-20.1
  // mechanical-conformance auditor, the decided trade of option (a).
  if (!alreadyPromoted && man.writer !== 'mechanical' && opts && opts.gate) {
    // Checkpointed promotion (0.11.4, KICKOFF-P2M6 4a item 2, the TIME
    // axis): promotion is re-runnable, but if no single execution can
    // complete verify + gate + write inside the 6-minute ceiling, every
    // retry dies at the same point and the package livelocks. The gate
    // verdict is therefore checkpointed: after a PASS and before any
    // write, an advisory GATE_PASSED-<manifestHash8>.json marker records
    // the full manifest sha256. A successor execution whose pending
    // package is byte-identical (this execution's verify step has already
    // proven every held file equals the manifest's per-file hashes, and
    // the marker binds the manifest hash, which carries those per-file
    // hashes) skips re-gating and proceeds to the idempotent write step:
    // forward progress. The marker is advisory and hash-bound, so a
    // mutated package re-gates (read-once discipline preserved); it is
    // honored only within GATE_MARKER_TTL_MS_ and removed at consumption,
    // and C-16.5 surfaces any crashed survivor at the same window.
    var markerPath = 'GATE_PASSED-' + manHash.slice(0, 8) + '.json';
    var gateCheckpointed = false;
    try {
      if (fsa.exists(markerPath)) {
        var mk = JSON.parse(fsa.readText(markerPath));
        if (mk && mk.manifest_sha256 === manHash
            && nowMs - Date.parse(mk.ts || '') < GATE_MARKER_TTL_MS_) {
          gateCheckpointed = true;
        }
      }
    } catch (emk) { gateCheckpointed = false; }
    if (!gateCheckpointed) {
    var image = {};
    var paths = (typeof fsa.listAllPaths === 'function') ? fsa.listAllPaths() : fsa.listAll();
    for (var g = 0; g < paths.length; g++) {
      var gp = paths[g];
      if (gp === 'PENDING_PROMOTION.json' || /\.pending$/.test(gp)) continue; // queue artifacts are consumed by promotion, never part of the post image
      try {
        // Binary-at-rest (0.11.0): non-text live files enter the image as
        // bytes when the adapter can read them, so C-18.6 hashes true
        // content; a text-only adapter keeps the pre-0.11.0 behavior.
        if (!isTextStorePath_(gp) && typeof fsa.readBytes === 'function') image[gp] = fsa.readBytes(gp);
        else image[gp] = fsa.readText(gp);
      } catch (eg) { /* vanished mid-read: absent from the image */ }
    }
    for (var g2 = 0; g2 < man.files.length; g2++) {
      var ge = man.files[g2];
      var gn = ge.name;
      // Held bytes only (read-once): the overlay is what promotion will
      // write. Transport-encoded entries enter decoded; without an injected
      // decode the entry enters as posted, the reference behavior.
      if (ge.encoding === 'base64' && opts.decode) image[gn] = opts.decode(held[gn]);
      else image[gn] = held[gn];
    }
    var gv = opts.gate(image);
    if (!gv || !gv.pass) {
      var gerrs = [];
      var gfs = (gv && gv.findings) || [];
      for (var g3 = 0; g3 < gfs.length; g3++) if (gfs[g3].severity === 'error') gerrs.push(gfs[g3].check + ': ' + gfs[g3].message);
      var gfRemoved = discardPendingPackage_(fsa, nowMs, 'gate_failed', 'refused at the promotion gate', gerrs, man, manHash.slice(0, 8));
      return { status: 'gate_failed', note: 'refused at the promotion gate; package discarded (' + gfRemoved.length + ' pending file(s) trashed, findings recorded in _history). Resubmit from the client after fixing the findings.', findings: gerrs, discarded: gfRemoved };
    }
    // PASS: checkpoint the verdict BEFORE any write, so an execution that
    // dies in the write phase leaves a successor able to resume without
    // re-earning the gate. A refusal above checkpoints nothing: a failing
    // package re-gates on every attempt by design.
    try {
      fsa.writeText(markerPath, JSON.stringify({ ts: new Date(nowMs).toISOString(), manifest_sha256: manHash, rev: GS_VERSION }));
    } catch (emw) { /* advisory: a marker that fails to write costs one re-gate, never correctness */ }
    }
  }

  // 3. Claim (advisory; never load-bearing)
  var claimPath = 'PROMOTING-' + actor + '.json';
  if (useClaim) {
    var myTs = new Date(nowMs).toISOString();
    fsa.writeText(claimPath, JSON.stringify({ actor: actor, ts: myTs }));
    var all = fsa.listAll();
    for (var k = 0; k < all.length; k++) {
      var m = /^PROMOTING-(.+)\.json$/.exec(all[k]);
      if (!m || m[1] === actor) continue;
      try {
        var other = JSON.parse(fsa.readText(all[k]));
        if (nowMs - Date.parse(other.ts) < CLAIM_STALE_MS && other.ts < myTs) {
          fsa.remove(claimPath);
          return { status: 'yielded', note: 'fresher earlier claim by ' + m[1] };
        }
      } catch (e) {
        // Hardening batch (M2' rev): claim catch narrowed. A vanished claim
        // (missing read) or an unparsable one is proceed-able; any other
        // substrate failure surfaces instead of being swallowed.
        var cs = String((e && e.message) || e);
        if (!(/missing|ENOENT|no such file/i.test(cs) || e instanceof SyntaxError)) throw e;
      }
    }
  }

  // 4. Snapshot deterministically
  var stamp = String(man.created).replace(/[-:]/g, '');
  var manHash8 = fsa.sha256(manifestRaw).slice(0, 8);
  var key = stamp + '_' + manHash8;
  var snapshotted = [];
  for (var s = 0; s < man.files.length; s++) {
    var name = man.files[s].name;
    if (!fsa.exists(name)) continue; // new file: nothing to snapshot
    // F2 (v0.6.2): extensionless files have no dot; the old unconditional
    // slice split their final character (extless -> extles_<key>s).
    var dot = name.lastIndexOf('.');
    var snapPath = dot === -1
      ? '_history/' + name + '_' + key
      : '_history/' + name.slice(0, dot) + '_' + key + name.slice(dot);
    if (!fsa.exists(snapPath)) fsa.copyFile(name, snapPath); // failure must NOT be tolerated
    snapshotted.push(name);
  }
  var histMan = { entries: [] };
  if (fsa.exists('_history/manifest.json')) {
    try { histMan = JSON.parse(fsa.readText('_history/manifest.json')); } catch (e) { histMan = { entries: [] }; }
  }
  var present = false;
  for (var h = 0; h < histMan.entries.length; h++) if (histMan.entries[h].key === key) present = true;
  if (!present) {
    var files = [];
    for (var q = 0; q < man.files.length; q++) files.push(man.files[q].name);
    histMan.entries.push({ key: key, kind: 'promotion', base: man.base, author: man.author, created: man.created, files: files, snapshotted: snapshotted });
    histMan.entries.sort(function (a, b) { return a.key < b.key ? -1 : 1; });
    fsa.writeText('_history/manifest.json', JSON.stringify(histMan, null, 2));
  }

  // 5. Write with a commit point (bundle.md last), FROM THE HELD BYTES
  // (read-once, 0.11.1): what was verified and gated is what lands.
  // Transport-encoded entries (manifest encoding 'base64' with an injected
  // decode) land live as true bytes: base64 is a wire encoding, never a
  // storage format. bundle.md is never encoded. Without an injected decode
  // the entry writes as posted, the reference behavior.
  for (var w = 0; w < man.files.length; w++) {
    var we = man.files[w];
    var n = we.name;
    if (n === 'bundle.md') continue;
    if (!(n in held)) continue;
    if (we.encoding === 'base64' && opts && opts.decode && typeof fsa.writeBytes === 'function') {
      fsa.writeBytes(n, opts.decode(held[n]));
    } else {
      fsa.writeText(n, held[n]);
    }
  }
  if (pendingBundle && ('bundle.md' in held)) fsa.writeText('bundle.md', held['bundle.md']);

  // 6. Consume idempotently
  var recordPath = '_history/promotion_' + key + '.json';
  if (!fsa.exists(recordPath)) fsa.writeText(recordPath, manifestRaw);
  fsa.remove('PENDING_PROMOTION.json');
  for (var d = 0; d < man.files.length; d++) fsa.remove(man.files[d].name + '.pending');
  if (useClaim) fsa.remove(claimPath);
  // Gate checkpoints are consumed with the package (0.11.4): every
  // GATE_PASSED marker goes, not only this manifest's, since a superseded
  // package's marker can vouch for nothing once live has moved.
  try {
    var allAfter = fsa.listAll();
    for (var gm = 0; gm < allAfter.length; gm++) {
      if (/^GATE_PASSED-[0-9a-f]{8}\.json$/.test(allAfter[gm])) fsa.remove(allAfter[gm]);
    }
  } catch (egc) { /* advisory cleanup; C-16.5 surfaces survivors */ }

  // 7. Post-promotion gate re-run: deliberately NOT performed here. Content
  // judgment happened at the right rung already: mechanical packages at
  // production (deliverPackage_), non-mechanical packages at step 2a; the
  // client or the next session may re-run the gate over live state at will.
  return { status: 'promoted', key: key };
}

// ---------------------------------------------------------------------------
// Apps Script bindings. Nothing below runs at load time.
// ---------------------------------------------------------------------------

var TYPE_ROOTS_ = ['information', 'problems', 'projects', 'actions'];

/** The one type-prefix -> type-root mapping (D10, battery-pinned): the id
    grammar admits exactly four prefixes, and creation-by-packaging places an
    absent bundle under this root or nowhere. Pure. */
function typeRootFor_(bundleId) {
  return { INFO: 'information', PROB: 'problems', PROJ: 'projects', ACTN: 'actions' }[String(bundleId).slice(0, 4)] || null;
}

/** The one text-vs-binary storage classification (0.11.0, binary-at-rest):
    a store path is text when its extension is in the closed text set; every
    other extension is binary and reads as bytes. Pure. The client promoter
    mirrors this at D13 alignment. */
function isTextStorePath_(path) {
  var m = /\.([a-z0-9]+)$/.exec(String(path));
  if (!m) return true; // extensionless (advisory artifacts) are text
  return ['md', 'json', 'jsonl', 'svg', 'txt', 'html', 'b64', 'sig', 'pub', 'pending'].indexOf(m[1]) !== -1;
}

function props_() { return PropertiesService.getScriptProperties(); }

function tokenClass_(token) {
  if (!token) return null;
  var map = { TOKEN_CLIENT: 'client', TOKEN_CHAT: 'chat', TOKEN_AGENTIC: 'agentic', TOKEN_INTERNAL: 'internal' };
  for (var k in map) { var v = props_().getProperty(k); if (v && v === token) return map[k]; }
  return null;
}

/** Drive adapter over one bundle folder, conforming to the fsa contract. */
function driveAdapter_(bundleFolder) {
  function seg_(path) { return path.split('/'); }
  function folderFor_(parts, create) {
    var f = bundleFolder;
    for (var i = 0; i < parts.length; i++) {
      var it = f.getFoldersByName(parts[i]);
      if (it.hasNext()) f = it.next();
      else if (create) f = f.createFolder(parts[i]);
      else return null;
    }
    return f;
  }
  function fileFor_(path) {
    var parts = seg_(path); var name = parts.pop();
    var f = folderFor_(parts, false); if (!f) return null;
    var it = f.getFilesByName(name);
    return it.hasNext() ? it.next() : null;
  }
  return {
    exists: function (p) { return fileFor_(p) !== null; },
    readText: function (p) { var f = fileFor_(p); if (!f) throw new Error('missing: ' + p); return f.getBlob().getDataAsString('UTF-8'); },
    readBytes: function (p) { var f = fileFor_(p); if (!f) throw new Error('missing: ' + p); return f.getBlob().getBytes(); },
    writeText: function (p, s) {
      var f = fileFor_(p);
      if (f) { f.setContent(s); return; }
      var parts = seg_(p); var name = parts.pop();
      folderFor_(parts, true).createFile(name, s, 'text/plain');
    },
    writeBytes: function (p, bytes) {
      // Binary-at-rest (0.11.0): setContent is text-only, so a byte write is
      // trash-and-create with the blob carrying the bytes verbatim.
      var parts = seg_(p); var name = parts.pop();
      var folder = folderFor_(parts, true);
      var existing = folder.getFilesByName(name);
      if (existing.hasNext()) existing.next().setTrashed(true);
      folder.createFile(Utilities.newBlob(bytes, 'application/octet-stream', name));
    },
    copyFile: function (src, dst) {
      var f = fileFor_(src); if (!f) throw new Error('snapshot source missing: ' + src);
      var parts = seg_(dst); var name = parts.pop();
      f.makeCopy(name, folderFor_(parts, true));
    },
    remove: function (p) { var f = fileFor_(p); if (f) f.setTrashed(true); },
    listAll: function () {
      var out = [];
      var it = bundleFolder.getFiles();
      while (it.hasNext()) out.push(it.next().getName());
      return out; // root-level names only: claims and the manifest. Package
                  // pendings can sit in subfolders, so anything sweeping them
                  // must use listAllPaths (learned 2026-07-22).
    },
    listAllPaths: function () {
      // Full recursive listing for the promotion gate's post image (D9).
      var out = [];
      (function walk_(folder, prefix) {
        var fit = folder.getFiles();
        while (fit.hasNext()) out.push(prefix + fit.next().getName());
        var dit = folder.getFolders();
        while (dit.hasNext()) { var sub = dit.next(); walk_(sub, prefix + sub.getName() + '/'); }
      })(bundleFolder, '');
      return out;
    },
    sha256: function (s) {
      // One implementation (0.11.3): strings native over UTF-8, bytes
      // through the embedded streaming hash. The prior inline byte path
      // passed unsigned arrays to computeDigest, a latent wrong-hash risk.
      return sha256Hex_(s);
    }
  };
}

/** Non-promoting scan: every bundle with a pending package, manifest-timestamp order. */
function listPending_(onlyBundle) {
  var id = props_().getProperty('STORE_FOLDER_ID');
  if (!id) return null; // not set up yet: callers translate this into guidance
  var store = DriveApp.getFolderById(id);
  var found = [];
  if (onlyBundle) {
    // Hardening batch (M2' rev): a selector resolves by direct type-root
    // lookup instead of iterating every bundle folder in the store. Same
    // result set by construction: the selector names at most one folder.
    var rootName = typeRootFor_(onlyBundle);
    if (!rootName) return [];
    var rit = store.getFoldersByName(rootName);
    if (!rit.hasNext()) return [];
    var bit = rit.next().getFoldersByName(onlyBundle);
    if (!bit.hasNext()) return [];
    var bo = bit.next();
    var mfo = bo.getFilesByName('PENDING_PROMOTION.json');
    if (!mfo.hasNext()) return [];
    var createdO = '';
    try { createdO = JSON.parse(mfo.next().getBlob().getDataAsString('UTF-8')).created || ''; } catch (e) { }
    return [{ folder: bo, name: bo.getName(), created: createdO }];
  }
  for (var r = 0; r < TYPE_ROOTS_.length; r++) {
    var it = store.getFoldersByName(TYPE_ROOTS_[r]);
    if (!it.hasNext()) continue;
    var bundles = it.next().getFolders();
    while (bundles.hasNext()) {
      var b = bundles.next();
      var mf = b.getFilesByName('PENDING_PROMOTION.json');
      if (!mf.hasNext()) continue;
      var created = '';
      try { created = JSON.parse(mf.next().getBlob().getDataAsString('UTF-8')).created || ''; } catch (e) { }
      found.push({ folder: b, name: b.getName(), created: created });
    }
  }
  found.sort(function (a, b) { return a.created < b.created ? -1 : 1; });
  return found;
}

/** Sweep the queue: promote every pending package, manifest-timestamp order. */
// ---------------------------------------------------------------------------
// SWEEP LAYER. Everything below this marker may read the wall clock; nothing
// above it may. The convergent core is a pure function of the folder, proven
// byte-identical against two twin implementations, and a clock inside it would
// make that proof impossible. Time-based judgment (is this package raced or
// abandoned?) is policy and lives here.
// ---------------------------------------------------------------------------

/** Grace before an INCOMPLETE package is called abandoned rather than raced.
    An Apps Script execution is capped at six minutes, so no genuine mid-race
    consumption can still be in flight after this; anything older is an
    interrupted write that will never finish on its own. */
var INCOMPLETE_GRACE_MS_ = 30 * 60 * 1000;
/** How long a DIVERGED package is kept for its sanctioned repairs (rebase,
    supersede, apply-disjoint) before it is treated as abandoned. Comfortably
    longer than any real repair turnaround, short enough that abandonment
    resolves itself instead of becoming an operator chore. */
var DIVERGED_TTL_MS_ = 7 * 24 * 60 * 60 * 1000;

function nowMsForSweep_() { return Date.now(); }

/** Age of a pending package, taken from its manifest's created stamp. */
function pendingAgeMs_(folder, nowMs) {
  try {
    var fsa = driveAdapter_(folder);
    if (!fsa.exists('PENDING_PROMOTION.json')) return null;
    var man = JSON.parse(fsa.readText('PENDING_PROMOTION.json'));
    var ms = man && man.created ? Date.parse(man.created) : NaN;
    return isNaN(ms) ? null : (nowMs - ms);
  } catch (e) { return null; }
}

/** Discard an abandoned package through the same preserve-then-remove path the
    core uses for terminal refusals, so every discard in the system leaves the
    same recoverable trace. */
function discardAbandoned_(folder, outcome, note) {
  try {
    var fsa = driveAdapter_(folder);
    var raw = fsa.readText('PENDING_PROMOTION.json');
    var man = null;
    try { man = JSON.parse(raw); } catch (e) { man = null; }
    var removed = discardPendingPackage_(fsa, nowMsForSweep_(), outcome, note, [], man, fsa.sha256(raw).slice(0, 8));
    return removed.length;
  } catch (e) { return 0; }
}

function sweepQueue_(actor, onlyBundle) {
  var found = listPending_(onlyBundle);
  if (found === null) return null;
  // The promotion gate (D9): every server-side promotion runs through this
  // sweep, so injecting the gate here covers the promote op, the trigger's
  // queue sweep, and the daemon's own promotion loop alike. Mechanical
  // packages skip the rung inside the core (gated at production); everything
  // else earns promotion against the embedded gate over its post image, with
  // store-scope reference resolution.
  var rfsa = storeReadAdapter_();
  var results = [];
  for (var i = 0; i < found.length; i++) {
    var gateFor = (function (bundleName) {
      return function (image) {
        return gateCheckBundle_(bundleName, image, rfsa ? { resolveTarget: driveResolveTarget_(rfsa) } : {});
      };
    })(found[i].name);
    var res = promoteBundleCore_(driveAdapter_(found[i].folder), {
      actor: actor, gate: gateFor,
      decode: function (b64text) { return bioChecksModule_().b64ToBytes(b64text); }
    });
    var row = { bundle: found[i].name, status: res.status, note: res.note || '', key: res.key || '' };
    if (res.findings && res.findings.length) row.findings = res.findings;

    // Abandonment aging. The core is a clock-free pure function and correctly
    // refuses to guess; this layer has a clock, so it is the only honest place
    // to decide that a package is not mid-race but abandoned. Both shapes below
    // otherwise sit in the queue forever, re-refused every trigger cadence,
    // until an operator cleans Drive by hand.
    if (res.status === 'converged' && res.incomplete) {
      var ageI = pendingAgeMs_(found[i].folder, nowMsForSweep_());
      if (ageI !== null && ageI > INCOMPLETE_GRACE_MS_) {
        var dropI = discardAbandoned_(found[i].folder, 'incomplete_abandoned',
          'package never completed: ' + res.missing + ' missing after ' + Math.round(ageI / 60000) + ' minutes');
        row.status = 'incomplete_abandoned';
        row.note = 'interrupted write never completed (' + res.missing + ' missing); package discarded after '
          + Math.round(ageI / 60000) + ' minutes, ' + dropI + ' file(s) preserved to _history';
      }
    } else if (res.status === 'diverged') {
      var ageD = pendingAgeMs_(found[i].folder, nowMsForSweep_());
      if (ageD !== null && ageD > DIVERGED_TTL_MS_) {
        var dropD = discardAbandoned_(found[i].folder, 'diverged_abandoned',
          'unrepaired for ' + Math.floor(ageD / 86400000) + ' days');
        row.status = 'diverged_abandoned';
        row.note = 'diverged and unrepaired for ' + Math.floor(ageD / 86400000)
          + ' days; package discarded, ' + dropD + ' file(s) preserved to _history. Resubmit against current live.';
      }
    }
    results.push(row);
  }
  return results;
}

/** Append-only invocation log (non-authoritative, size-rotated; OP8 sensor).
    Hardening batch (M2' rev): the read-modify-write is serialized through
    LockService so concurrent executions stop losing lines; a lock miss skips
    the append entirely, because telemetry never blocks or delays the
    kernel-safe work. The lock is execution-scoped: the platform releases it
    when the execution ends for ANY reason, an infrastructure kill included, so
    the finally below is belt-and-suspenders for the ordinary-exception path,
    never the guarantee (per the interruption model). typeof-guarded for the
    node vm harness. */
function appendLog_(entry) {
  var lock = null;
  try {
    if (typeof LockService !== 'undefined') {
      lock = LockService.getScriptLock();
      if (!lock.tryLock(2000)) return; // telemetry: skip rather than wait
    }
    var store = DriveApp.getFolderById(props_().getProperty('STORE_FOLDER_ID'));
    var idxIt = store.getFoldersByName('index');
    var idx = idxIt.hasNext() ? idxIt.next() : store.createFolder('index');
    var it = idx.getFilesByName('invocations.jsonl');
    var line = JSON.stringify(entry);
    if (it.hasNext()) {
      var f = it.next();
      var body = f.getBlob().getDataAsString('UTF-8');
      if (body.length > 200000) { var lines = body.split('\n'); body = lines.slice(Math.max(0, lines.length - 500)).join('\n'); }
      f.setContent(body + line + '\n');
    } else {
      idx.createFile('invocations.jsonl', line + '\n', 'text/plain');
    }
  } catch (e) { /* logging is telemetry; never let it block the kernel-safe work */
  } finally {
    try { if (lock) lock.releaseLock(); } catch (e2) { /* released with the execution regardless */ }
  }
}

var GS_VERSION = '0.12.10';
var VALID_OPS = ['promote', 'status', 'selftest', 'list', 'read', 'writepkg', 'reindex', 'tick', 'sweep', 'duescan', 'attest', 'readbundle', 'lease', 'allocid', 'readindex'];
var SELFTEST_ID = 'INFO-2026-0098-accelerator-selftest';

/* ---- The embedded gate (M2' daemon slate Section 0) ----
   Build-time propagation of the canonical bio-checks module into this file,
   the Product B pattern applied to Product D: assemble.py embed-gate writes
   the region below, embedding checks.js BYTE-VERBATIM as a JSON string
   literal beside its hash and version; check-versions asserts the region
   against the canonical file on every run, so a fork cannot drift silently.
   bioChecksModule_ verifies the hash in THIS runtime before compiling, then
   applies the deterministic module-syntax strip: export prefixes removed,
   async/await de-sugared, which preserves semantics exactly because the
   sha256 this runtime injects is synchronous. Parity of gate verdicts against
   the real ES module over shared fixtures, executed in V8 via node vm, is
   asserted by test/conformance.mjs on every build. The daemon gates its own
   packages at production through gateCheckBundle_; the creation rule (State
   Rules 2.6) stands unrelaxed. */

// === BIO_CHECKS_EMBED BEGIN (generated by assemble.py embed-gate; do not edit by hand) ===
// canonical: checks/bio-checks/src/checks.js  bio-checks 1.16.4  sha256 bb92adfde6b03390906eddf025f755e74c1ac3b19068115e590a214751b0582c
// One codebase, three call sites (session gate, client, accelerator); drift
// is asserted away by check-versions, which recomputes the canonical file's
// hash and round-trips this literal on every run.
var BIO_CHECKS_SHA256 = 'bb92adfde6b03390906eddf025f755e74c1ac3b19068115e590a214751b0582c';
var BIO_CHECKS_VERSION = '1.16.4';
var BIO_CHECKS_SOURCE = "// @ts-check\n// bio-checks: the one check codebase (BIO_State_Rules_Consistency v1.1, Mechanical Verification Law).\n// Plain JavaScript, ES modules, zero dependencies, no build step.\n// Runs identically at the bundle skill's pre-write gate (node) and in the client scan (browser import).\n// Filesystem access is injected so the browser call site can supply its own file map.\n\n// ---------------------------------------------------------------------------\n// Constants (spec v1.1)\n// ---------------------------------------------------------------------------\n\nexport const BUNDLE_ID_RE = /^(INFO|PROB|PROJ|ACTN)-\\d{4}-\\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;\nexport const ANN_ID_RE = /^(INFO|PROB|PROJ|ACTN)-\\d{4}-\\d{4}-[a-z0-9]+(-[a-z0-9]+)*\\.ann-\\d{8}T\\d{6}Z-[a-z0-9]+(-[a-z0-9]+)*$/;\nexport const FILENAME_RE = /^[A-Za-z0-9._-]+$/;\nexport const ISO_TS_RE = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$/;\n\nexport const OBJECT_TYPES = { INFO: 'information', PROB: 'problem', PROJ: 'project', ACTN: 'action' };\n\n/** Universal core fields (spec 3.1). */\nexport const CORE_FIELDS = [\n  'id', 'object_type', 'schema', 'title', 'current_state', 'prior_state',\n  'created', 'last_updated', 'produced_by', 'group', 'references',\n  'state_history', 'annotations_open', 'reeval_pending', 'visuals'\n];\n\n/** Forbidden alias -> canonical (spec 3.3). */\nexport const FORBIDDEN_ALIASES = {\n  status: 'current_state', state: 'current_state', pipeline_state: 'current_state',\n  verdict: 'current_state', type: 'object_type', updated: 'last_updated', modified: 'last_updated'\n};\n\n/** Literal heading constants per type (spec Section 4). */\nexport const HEADINGS = {\n  information: ['## Summary', '## Provenance Notes', '## Session Log', '## Review Notes'],\n  problem: ['## Statement', '## Why It Matters', '## Open Questions', '## Session Log', '## Review Notes'],\n  project: ['## Thesis Summary', '## Open Questions', '## Ruled Out', '## Session Log', '## Review Notes'],\n  action: ['## Plan', '## Status', '## Correspondence', '## Session Log', '## Review Notes']\n};\n\n/** Legal states and transition edges per type (spec Section 4; edge set is catalog-versioned). */\nexport const STATES = {\n  information: {\n    legal: ['collected', 'verified', 'retired'],\n    edges: { collected: ['verified'], verified: ['retired'], retired: [] }\n  },\n  problem: {\n    legal: ['surfaced', 'elevated', 'deferred', 'dismissed'],\n    edges: {\n      surfaced: ['elevated', 'deferred', 'dismissed'],\n      deferred: ['surfaced', 'elevated', 'dismissed'],\n      dismissed: ['surfaced', 'elevated', 'deferred'],\n      elevated: []\n    }\n  },\n  project: {\n    legal: ['forming', 'investigating', 'matured', 'closed'],\n    edges: {\n      forming: ['investigating', 'closed'],\n      investigating: ['matured', 'closed'],\n      matured: ['closed'],\n      closed: ['investigating']\n    }\n  },\n  action: {\n    legal: ['planned', 'active', 'awaiting_response', 'resolved', 'abandoned'],\n    edges: {\n      planned: ['active', 'abandoned'],\n      active: ['awaiting_response', 'resolved', 'abandoned'],\n      awaiting_response: ['active', 'resolved', 'abandoned'],\n      resolved: [], abandoned: []\n    }\n  }\n};\n\n// ---------------------------------------------------------------------------\n// Finding helper\n// ---------------------------------------------------------------------------\n\n/**\n * @typedef {{check: string, severity: 'error'|'warn'|'info', message: string, repairable?: boolean, repairs?: string[]}} Finding\n */\n\n/** @returns {Finding} */\nfunction f(check, severity, message, repairs) {\n  const out = { check, severity, message };\n  if (repairs) { out.repairable = true; out.repairs = repairs; }\n  return out;\n}\n\n// ---------------------------------------------------------------------------\n// Restricted-grammar frontmatter parser (spec 2.2, 3.3)\n// Grammar: '---' fences; top-level keys at column 0; one-level maps at 2 spaces;\n// arrays of scalars or of objects ('- ' at 2 spaces, object props at 4 spaces);\n// inline [] arrays; optional '# ' comments after values; double or single quotes.\n// ---------------------------------------------------------------------------\n\nfunction stripComment(raw) {\n  let inS = false, inD = false;\n  for (let i = 0; i < raw.length; i++) {\n    const c = raw[i];\n    if (c === \"'\" && !inD) inS = !inS;\n    else if (c === '\"' && !inS) inD = !inD;\n    else if (c === '#' && !inS && !inD && (i === 0 || raw[i - 1] === ' ')) return raw.slice(0, i);\n  }\n  return raw;\n}\n\nfunction parseScalar(raw) {\n  let v = stripComment(raw).trim();\n  if (v === '') return '';\n  if (v === 'null' || v === '~') return null;\n  if (v === 'true') return true;\n  if (v === 'false') return false;\n  if ((v.startsWith('\"') && v.endsWith('\"')) || (v.startsWith(\"'\") && v.endsWith(\"'\"))) return v.slice(1, -1);\n  if (v.startsWith('[') && v.endsWith(']')) {\n    const inner = v.slice(1, -1).trim();\n    if (inner === '') return [];\n    return inner.split(',').map(s => parseScalar(s));\n  }\n  if (/^-?\\d+$/.test(v)) return parseInt(v, 10);\n  if (/^-?\\d+\\.\\d+$/.test(v)) return parseFloat(v);\n  return v;\n}\n\n/**\n * Parse bundle.md frontmatter under the restricted grammar.\n * @param {string} text full bundle.md content\n * @returns {{data: Record<string, any>|null, findings: Finding[], body: string}}\n */\nexport function parseFrontmatter(text) {\n  /** @type {Finding[]} */\n  const findings = [];\n  const lines = text.split(/\\r?\\n/);\n  if (lines[0] !== '---') {\n    findings.push(f('C-2.1', 'error', 'bundle.md does not begin with a --- frontmatter fence'));\n    return { data: null, findings, body: text };\n  }\n  let end = -1;\n  for (let i = 1; i < lines.length; i++) if (lines[i] === '---') { end = i; break; }\n  if (end === -1) {\n    findings.push(f('C-2.1', 'error', 'frontmatter fence is never closed'));\n    return { data: null, findings, body: text };\n  }\n\n  /** @type {Record<string, any>} */\n  const data = {};\n  let topKey = null;          // current open block key ('key:' with no value)\n  let topMode = null;         // 'map' | 'array' | null (undecided)\n  let curElem = null;         // current array element object\n\n  const keyLine = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;\n  const indKeyLine = /^( +)([A-Za-z_][A-Za-z0-9_]*):(.*)$/;\n  const itemLine = /^( +)- (.*)$/;\n\n  for (let n = 1; n < end; n++) {\n    const line = lines[n];\n    const stripped = stripComment(line);\n    if (stripped.trim() === '') continue;\n\n    let m;\n    if ((m = keyLine.exec(line))) {                     // column-0 key\n      const key = m[1];\n      const rest = m[2];\n      topKey = null; topMode = null; curElem = null;\n      if (Object.prototype.hasOwnProperty.call(data, key)) {\n        findings.push(f('C-2.1', 'error', `duplicate top-level key '${key}' at line ${n + 1}`));\n      }\n      if (stripComment(rest).trim() === '') {           // block start\n        topKey = key; data[key] = undefined;            // decided by first child\n      } else {\n        data[key] = parseScalar(rest);\n      }\n    } else if ((m = itemLine.exec(line))) {             // '- ' array item\n      const indent = m[1].length;\n      const rest = m[2];\n      if (!topKey) {\n        findings.push(f('C-2.1', 'error', `array item outside any block at line ${n + 1}`));\n        continue;\n      }\n      if (indent !== 2) findings.push(f('C-2.1', 'error', `array item indented ${indent} (expected 2) at line ${n + 1}`));\n      if (topMode === null) { topMode = 'array'; data[topKey] = []; }\n      if (topMode !== 'array') { findings.push(f('C-2.1', 'error', `array item inside a map block '${topKey}' at line ${n + 1}`)); continue; }\n      const km = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/.exec(rest);\n      if (km && stripComment(km[2]).trim() !== '') {    // object element: '- key: value'\n        curElem = {}; curElem[km[1]] = parseScalar(km[2]);\n        data[topKey].push(curElem);\n      } else {                                          // scalar element\n        curElem = null;\n        data[topKey].push(parseScalar(rest));\n      }\n    } else if ((m = indKeyLine.exec(line))) {           // indented key\n      const indent = m[1].length;\n      const key = m[2];\n      const rest = m[3];\n      const isCore = CORE_FIELDS.includes(key) || key in FORBIDDEN_ALIASES;\n      if (topKey && topMode === null && indent === 2) { // first child decides: map\n        topMode = 'map'; data[topKey] = {};\n        data[topKey][key] = parseScalar(rest);\n      } else if (topKey && topMode === 'map' && indent === 2) {\n        data[topKey][key] = parseScalar(rest);\n      } else if (topKey && topMode === 'array' && curElem && indent === 4) {\n        curElem[key] = parseScalar(rest);\n      } else {\n        // A key indented where the grammar has no slot for it: the Alpha buried-key failure mode.\n        if (isCore) {\n          findings.push(f('C-2.4', 'error',\n            `top-level key '${key}' is buried by stray indentation at line ${n + 1} and will not register`,\n            [`re-indent '${key}' to column 0`]));\n          data[key] = parseScalar(rest);                // recover for downstream checks\n        } else {\n          findings.push(f('C-2.1', 'error', `key '${key}' indented ${indent} does not fit the restricted grammar at line ${n + 1}`));\n        }\n      }\n    } else {\n      findings.push(f('C-2.1', 'error', `line ${n + 1} does not fit the restricted grammar: ${line.slice(0, 60)}`));\n    }\n  }\n\n  // undecided empty blocks become empty arrays\n  for (const k of Object.keys(data)) if (data[k] === undefined) data[k] = [];\n\n  return { data, findings, body: lines.slice(end + 1).join('\\n') };\n}\n\n// ---------------------------------------------------------------------------\n// Bundle context: injected file access so both call sites share one codebase.\n// files: Map<relativePath, Uint8Array|string>. sha256: async (bytes) => hex.\n// ---------------------------------------------------------------------------\n\n/**\n * @typedef {{folderName: string, files: Map<string, Uint8Array|string>, sha256: (bytes: Uint8Array|string) => Promise<string>, nowMs?: number, maxPackageAgeDays?: number}} BundleInput\n */\n\nfunction asText(v) {\n  if (typeof v === 'string') return v;\n  return new TextDecoder().decode(v);\n}\n\n/** Presence semantics (1.13.0): a path exists if its bytes are in files OR\n *  it is declared elided (present in the store, deliberately not carried).\n *  Used ONLY by existence assertions; byte checks read ctx.files directly. */\nfunction hasFile_(ctx, path) {\n  return ctx.files.has(path) || (ctx.elided && ctx.elided.has(path));\n}\n\n// ---------------------------------------------------------------------------\n// Check families\n// ---------------------------------------------------------------------------\n\nfunction checkIdentity(ctx, findings) {\n  const id = ctx.fm?.id;\n  if (typeof id !== 'string' || !BUNDLE_ID_RE.test(id)) {\n    findings.push(f('C-1.2', 'error', `frontmatter id '${id}' does not match the canonical ID grammar`));\n  }\n  if (typeof id === 'string' && id !== ctx.folderName) {\n    findings.push(f('C-1.1', 'error', `folder name '${ctx.folderName}' does not equal frontmatter id '${id}'`,\n      ['restore folder name from frontmatter id', 'restore frontmatter id from folder name if history confirms it']));\n  }\n  // annotation records\n  const seen = new Set();\n  for (const path of ctx.files.keys()) {\n    if (!path.startsWith('annotations/')) continue;\n    const name = path.slice('annotations/'.length);\n    if (!name.endsWith('.json')) { findings.push(f('C-1.3', 'error', `annotation file '${name}' is not a .json record`)); continue; }\n    let rec;\n    try { rec = JSON.parse(asText(ctx.files.get(path))); }\n    catch { findings.push(f('C-1.3', 'error', `annotation record '${name}' does not parse`)); continue; }\n    const rid = rec.id;\n    if (typeof rid !== 'string' || !ANN_ID_RE.test(rid)) {\n      findings.push(f('C-1.3', 'error', `annotation id '${rid}' does not match the v1.1 timestamp-author grammar`));\n      continue;\n    }\n    if (!rid.startsWith(ctx.folderName + '.ann-')) {\n      findings.push(f('C-1.3', 'error', `annotation '${rid}' does not belong to parent '${ctx.folderName}'`));\n    }\n    const expectedFile = rid.slice(ctx.folderName.length + 1) + '.json'; // ann-<ts>-<author>.json\n    if (name !== expectedFile) {\n      findings.push(f('C-1.3', 'error', `annotation file '${name}' does not match its id (expected '${expectedFile}')`));\n    }\n    if (seen.has(rid)) {\n      findings.push(f('C-1.3', 'error', `duplicate annotation id '${rid}'`, ['adjust the later record timestamp suffix by one second, logged']));\n    }\n    seen.add(rid);\n  }\n  // annotations_open is a derived convenience, checker-verified (spec 3.1)\n  let pending = 0;\n  for (const path of ctx.files.keys()) {\n    if (!path.startsWith('annotations/') || !path.endsWith('.json')) continue;\n    try { if (JSON.parse(asText(ctx.files.get(path))).state === 'pending') pending++; } catch { /* reported above */ }\n  }\n  if (ctx.fm && typeof ctx.fm.annotations_open === 'number' && ctx.fm.annotations_open !== pending) {\n    findings.push(f('C-1.3', 'warn', `annotations_open is ${ctx.fm.annotations_open} but ${pending} annotation record(s) are pending`, ['refresh annotations_open on the next write']));\n  }\n}\n\nfunction checkFrontmatterContract(ctx, findings) {\n  const fm = ctx.fm;\n  if (!fm) return;\n  for (const key of CORE_FIELDS) {\n    if (!(key in fm)) findings.push(f('C-2.2', 'error', `required core field '${key}' is missing`));\n  }\n  for (const [alias, canonical] of Object.entries(FORBIDDEN_ALIASES)) {\n    if (alias in fm) findings.push(f('C-2.3', 'error', `forbidden alias '${alias}' present (canonical name is '${canonical}')`, [`rename '${alias}' to '${canonical}'`]));\n  }\n  const ot = fm.object_type;\n  if (!Object.values(OBJECT_TYPES).includes(ot)) {\n    findings.push(f('C-2.5', 'error', `object_type '${ot}' is not a known type`));\n  } else {\n    const prefix = fm.id && String(fm.id).slice(0, 4);\n    const wantType = OBJECT_TYPES[prefix];\n    if (wantType && wantType !== ot) findings.push(f('C-2.5', 'error', `id prefix '${prefix}' implies '${wantType}' but object_type is '${ot}'`));\n    const schema = fm.schema;\n    const sm = typeof schema === 'string' && /^([a-z]+)@(\\d+)$/.exec(schema);\n    if (!sm) findings.push(f('C-2.5', 'error', `schema stamp '${schema}' is not of the form <type>@<n>`));\n    else {\n      if (sm[1] !== ot) findings.push(f('C-2.5', 'error', `schema stamp '${schema}' does not match object_type '${ot}'`));\n      if (!ctx.knownSchemas.includes(schema)) findings.push(f('C-2.5', 'error', `schema version '${schema}' is not known to this check catalog`));\n    }\n  }\n  for (const key of ['created', 'last_updated']) {\n    if (typeof fm[key] === 'string' && !ISO_TS_RE.test(fm[key])) {\n      findings.push(f('C-2.6', 'error', `${key} '${fm[key]}' is not ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ)`));\n    }\n  }\n  if (fm.produced_by && typeof fm.produced_by === 'object') {\n    if (!fm.produced_by.mode) findings.push(f('C-2.2', 'error', 'produced_by.mode is missing'));\n    if (!fm.produced_by.capability_tier) findings.push(f('C-2.2', 'error', 'produced_by.capability_tier is missing'));\n  }\n  checkReevalPending(ctx, findings);\n}\n\n/**\n * C-10 cascade hygiene (spec v1.2). reeval_pending is a {flag, since, source}\n * record. A legacy bare boolean is accepted (old bundles validate against the\n * contract they declared) but a true flag with no `since` cannot be staleness-\n * checked, so it is surfaced. When `since` is present and the flag is true, a\n * `since` older than the policy age is a surfaced finding (info, not load-bearing).\n */\nconst REEVAL_SOURCES = ['deletion', 'source_status', 'wp_retraction', 'annotation'];\nfunction checkReevalPending(ctx, findings) {\n  const rp = ctx.fm?.reeval_pending;\n  if (rp === undefined) return; // C-2 core-field presence handles absence\n  const ageDays = ctx.maxReevalAgeDays ?? 30;\n  if (typeof rp === 'boolean') {\n    if (rp === true) {\n      findings.push(f('C-10.1', 'warn', 'reeval_pending is a legacy boolean true with no since/source; staleness cannot be checked',\n        ['migrate reeval_pending to {flag, since, source}']));\n    }\n    return;\n  }\n  if (typeof rp !== 'object') {\n    findings.push(f('C-10.1', 'error', `reeval_pending must be a {flag, since, source} record or boolean, got ${typeof rp}`));\n    return;\n  }\n  if (typeof rp.flag !== 'boolean') {\n    findings.push(f('C-10.1', 'error', 'reeval_pending.flag must be boolean'));\n    return;\n  }\n  if (rp.flag === false) {\n    if (rp.since != null || rp.source != null) {\n      findings.push(f('C-10.1', 'warn', 'reeval_pending.flag is false but since/source are not null',\n        ['reset since and source to null when clearing the flag']));\n    }\n    return;\n  }\n  // flag is true: since and source are required and meaningful\n  if (!ISO_TS_RE.test(rp.since || '')) {\n    findings.push(f('C-10.1', 'error', 'reeval_pending.flag is true but since is not an ISO-8601 UTC instant',\n      ['stamp since with the cascade event time']));\n  } else {\n    const ageMs = (ctx.nowMs ?? Date.now()) - Date.parse(rp.since);\n    if (ageMs > ageDays * 86400000) {\n      findings.push(f('C-10.1', 'info', `reeval_pending set ${Math.floor(ageMs / 86400000)}d ago (policy age ${ageDays}d) with no recorded re-evaluation`,\n        ['perform and record the re-evaluation', 'record an explicit accept-risk note (policy permitting)']));\n    }\n  }\n  if (!REEVAL_SOURCES.includes(rp.source)) {\n    findings.push(f('C-10.1', 'error', `reeval_pending.source '${rp.source}' is not one of: ${REEVAL_SOURCES.join(', ')}`));\n  }\n}\n\nfunction checkHeadings(ctx, findings) {\n  const ot = ctx.fm?.object_type;\n  const required = HEADINGS[ot];\n  if (!required) return; // type invalid; C-2.5 already fired\n  const present = (ctx.body.match(/^## .*$/gm) || []).map(h => h.trimEnd());\n  for (const h of required) {\n    if (!present.includes(h)) findings.push(f('C-3.1', 'error', `required heading '${h}' is missing`, [`insert canonical heading '${h}' with empty body`]));\n  }\n  for (const h of present) {\n    if (!required.includes(h)) findings.push(f('C-3.1', 'error', `heading '${h}' is not in the canonical set for ${ot}`, ['rename to the canonical heading, preserving body']));\n  }\n}\n\nfunction checkStateLegality(ctx, findings) {\n  const ot = ctx.fm?.object_type;\n  const spec = STATES[ot];\n  if (!spec) return;\n  const cur = ctx.fm.current_state;\n  if (!spec.legal.includes(cur)) {\n    findings.push(f('C-4.1', 'error', `current_state '${cur}' is not legal for ${ot} (legal: ${spec.legal.join(', ')})`));\n  }\n  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];\n  let prevTs = null;\n  for (let i = 0; i < hist.length; i++) {\n    const e = hist[i];\n    if (typeof e !== 'object' || e === null) { findings.push(f('C-4.2', 'error', `state_history[${i}] is not an object`)); continue; }\n    for (const k of ['timestamp', 'from_state', 'to_state', 'blurb', 'author']) {\n      if (!(k in e)) findings.push(f('C-4.2', 'error', `state_history[${i}] missing '${k}'`));\n    }\n    if (typeof e.timestamp === 'string' && !ISO_TS_RE.test(e.timestamp)) {\n      findings.push(f('C-2.6', 'error', `state_history[${i}].timestamp '${e.timestamp}' is not ISO 8601 UTC`));\n    }\n    if (prevTs && e.timestamp && e.timestamp < prevTs) {\n      findings.push(f('C-4.2', 'error', `state_history[${i}] is out of chronological order`));\n    }\n    prevTs = e.timestamp || prevTs;\n    const edges = spec.edges[e.from_state];\n    if (edges && !edges.includes(e.to_state)) {\n      findings.push(f('C-4.2', 'error', `transition ${e.from_state} -> ${e.to_state} is not a legal ${ot} edge`));\n    }\n  }\n  if (hist.length > 0) {\n    const last = hist[hist.length - 1];\n    if (last.to_state !== cur) findings.push(f('C-4.2', 'error', `current_state '${cur}' disagrees with last transition to '${last.to_state}'`));\n    if (ctx.fm.prior_state !== last.from_state) findings.push(f('C-4.2', 'error', `prior_state '${ctx.fm.prior_state}' disagrees with last transition from '${last.from_state}'`));\n  } else if (ctx.fm.prior_state !== null && ctx.fm.prior_state !== undefined) {\n    findings.push(f('C-4.2', 'error', `prior_state is '${ctx.fm.prior_state}' but state_history is empty (expected null)`));\n  }\n}\n\nfunction checkWriteCompleteness(ctx, findings) {\n  const fm = ctx.fm;\n  if (!fm) return;\n  if (typeof fm.created === 'string' && typeof fm.last_updated === 'string' && fm.last_updated < fm.created) {\n    findings.push(f('C-13.1', 'error', `last_updated '${fm.last_updated}' precedes created '${fm.created}'`));\n  }\n  const hist = Array.isArray(fm.state_history) ? fm.state_history : [];\n  if (hist.length > 0) {\n    const newest = hist[hist.length - 1].timestamp;\n    if (typeof newest === 'string' && typeof fm.last_updated === 'string' && fm.last_updated < newest) {\n      findings.push(f('C-13.1', 'error', `last_updated precedes the newest state_history timestamp '${newest}'`));\n    }\n  }\n  if (typeof fm.created === 'string' && typeof fm.last_updated === 'string' && fm.last_updated > fm.created) {\n    const idx = ctx.body.indexOf('## Session Log');\n    const section = idx >= 0 ? ctx.body.slice(idx, ctx.body.indexOf('\\n## ', idx + 1) === -1 ? undefined : ctx.body.indexOf('\\n## ', idx + 1)) : '';\n    if (!/^### Session /m.test(section)) {\n      findings.push(f('C-13.2', 'error', 'bundle has been updated but carries no Session Log entry', ['append the missing Session Log entry naming the gap']));\n    }\n  }\n}\n\nfunction checkFormatHygiene(ctx, findings) {\n  const escapeRe = /\\\\[#*_\\-\\[\\]!~&]/;\n  for (const [path, content] of ctx.files) {\n    const name = path.split('/').pop() || path;\n    if (!FILENAME_RE.test(name) || name.includes(' ') || !name.includes('.') || !/\\.[a-z0-9]+$/.test(name)) {\n      findings.push(f('C-14.2', 'error', `filename '${path}' violates the naming rule`, ['rename file and update references']));\n    }\n    if (name.endsWith('.md')) {\n      const text = asText(content);\n      const m = escapeRe.exec(text);\n      if (m) findings.push(f('C-14.1', 'error', `escaped markdown character '${m[0]}' in ${path}`, ['normalize to clean markdown']));\n    }\n    if (name.endsWith('.json')) {\n      try { JSON.parse(asText(content)); }\n      catch { findings.push(f('C-14.3', 'error', `${path} does not parse as JSON`, ['restore from history'])); }\n    }\n  }\n  const visuals = Array.isArray(ctx.fm?.visuals) ? ctx.fm.visuals : [];\n  const svgOnDisk = [...ctx.files.keys()].filter(p => !p.includes('/') && p.endsWith('.svg'));\n  for (const v of visuals) {\n    if (typeof v !== 'object' || !v.file || !v.description) {\n      findings.push(f('C-14.4', 'error', `visuals entry ${JSON.stringify(v).slice(0, 50)} lacks file+description`));\n      continue;\n    }\n    if (!ctx.files.has(v.file)) findings.push(f('C-14.4', 'error', `visuals entry '${v.file}' has no file on disk`));\n  }\n  for (const svg of svgOnDisk) {\n    if (!visuals.some(v => v && v.file === svg)) {\n      findings.push(f('C-14.4', 'error', `svg '${svg}' on disk is absent from the visuals array`));\n    }\n  }\n}\n\nasync function checkQueueAndBase(ctx, findings) {\n  // C-16.5: stale advisory artifacts (claims, presence markers, and, at\n  // 1.12.0, checkpointed-promotion gate verdicts) never lie around.\n  // PROMOTING/PRESENCE are execution-scoped: stale at 10 minutes.\n  // GATE_PASSED-<hash8> is a promotion checkpoint (KICKOFF-P2M6 4a item 2):\n  // it must survive retry cadences across executions, so its window is 48\n  // hours; it is hash-bound to one manifest, honored only fresh, and the\n  // promoter removes it on successful consumption, so a survivor here is a\n  // crashed or superseded promotion worth surfacing.\n  // LEASE-<actor> (1.14.0, P2M8 A2) is the edit lease's marker: it carries\n  // its OWN expiry ({acquired, expires}, ten-minute TTL renewed at five),\n  // so it is stale exactly when past its self-declared expires; the\n  // endpoint sweeps expired leases on sight and a survivor here is a\n  // crashed holder, the same failure class as a crashed promoter.\n  const staleMs = 10 * 60 * 1000;\n  const gateMarkerStaleMs = 48 * 60 * 60 * 1000;\n  for (const p of ctx.files.keys()) {\n    const gm = /^GATE_PASSED-[0-9a-f]{8}\\.json$/.exec(p);\n    const lm = gm ? null : /^LEASE-[A-Za-z0-9][A-Za-z0-9-]{0,63}\\.json$/.exec(p);\n    const m = (gm || lm) ? null : /^(PROMOTING|PRESENCE)-.+\\.json$/.exec(p);\n    if (!gm && !lm && !m) continue;\n    let stale;\n    if (lm) {\n      let expires = null;\n      try { expires = Date.parse(JSON.parse(asText(ctx.files.get(p))).expires || ''); } catch { /* fallthrough */ }\n      stale = expires === null || Number.isNaN(expires) || (ctx.nowMs ?? Date.now()) > expires;\n    } else {\n      const windowMs = gm ? gateMarkerStaleMs : staleMs;\n      let ts = null;\n      try { const rec = JSON.parse(asText(ctx.files.get(p))); ts = Date.parse(rec.ts || rec['started-at'] || rec.started_at || ''); } catch { /* fallthrough */ }\n      stale = ts === null || Number.isNaN(ts) || (ctx.nowMs ?? Date.now()) - ts > windowMs;\n    }\n    if (stale) {\n      findings.push(f('C-16.5', 'info', `stale advisory artifact '${p}' (crashed or ended actor)`, ['delete the stale claim or presence marker']));\n    }\n  }\n  const manifestRaw = ctx.files.get('PENDING_PROMOTION.json');\n  const pendingFiles = [...ctx.files.keys()].filter(p => p.endsWith('.pending'));\n\n  if (!manifestRaw) {\n    for (const p of pendingFiles) {\n      findings.push(f('C-16.4', 'error', `orphaned pending file '${p}' with no manifest`, ['complete consumption: archive manifest, delete consumed files (idempotent)']));\n    }\n    return;\n  }\n  let man;\n  try { man = JSON.parse(asText(manifestRaw)); }\n  catch { findings.push(f('C-16.1', 'error', 'PENDING_PROMOTION.json does not parse')); return; }\n\n  for (const k of ['target', 'base', 'files', 'created', 'author', 'skill_version']) {\n    if (!(k in man)) findings.push(f('C-16.1', 'error', `manifest missing '${k}'`));\n  }\n  if (man.target && man.target !== ctx.folderName) {\n    findings.push(f('C-16.1', 'error', `manifest target '${man.target}' does not match bundle '${ctx.folderName}'`));\n  }\n  const listed = new Set();\n  if (Array.isArray(man.files)) {\n    for (const entry of man.files) {\n      if (!entry || !entry.name || !entry.sha256) {\n        findings.push(f('C-16.1', 'error', `manifest files entry ${JSON.stringify(entry)} lacks name+sha256`));\n        continue;\n      }\n      listed.add(entry.name + '.pending');\n      const pending = ctx.files.get(entry.name + '.pending');\n      if (!pending) {\n        findings.push(f('C-16.2', 'error', `package file '${entry.name}.pending' listed in manifest is missing`, ['discard the package with a finding to the producing author', 're-produce the package from the originating session outputs']));\n        continue;\n      }\n      const hash = await ctx.sha256(pending);\n      if (hash !== entry.sha256) {\n        findings.push(f('C-16.2', 'error', `hash mismatch on '${entry.name}.pending' (manifest ${String(entry.sha256).slice(0, 12)}\u2026, actual ${hash.slice(0, 12)}\u2026)`, ['discard the package (never promote)', 're-produce the package']));\n      }\n    }\n  }\n  for (const p of pendingFiles) {\n    if (!listed.has(p)) findings.push(f('C-16.4', 'error', `pending file '${p}' is not listed in the manifest`, ['complete consumption or discard with reason']));\n  }\n  // staleness\n  if (typeof man.created === 'string' && ISO_TS_RE.test(man.created)) {\n    const ageDays = ((ctx.nowMs ?? Date.now()) - Date.parse(man.created)) / 86400000;\n    if (ageDays > ctx.maxPackageAgeDays) {\n      findings.push(f('C-16.3', 'warn', `pending package is ${Math.floor(ageDays)} days old (policy ${ctx.maxPackageAgeDays})`, ['promote now', 'discard with reason if superseded, preserving the manifest as a record']));\n    }\n  } else {\n    findings.push(f('C-16.1', 'error', `manifest created '${man.created}' is not ISO 8601 UTC`));\n  }\n  // (base coherence follows below)\n  const live = ctx.files.get('bundle.md');\n  if (live && typeof man.base === 'string') {\n    const liveHash = await ctx.sha256(live);\n    if (liveHash === man.base) {\n      findings.push(f('C-17.1', 'info', 'pending package base matches live bundle.md: fast-forward eligible'));\n    } else {\n      findings.push(f('C-17.1', 'warn', `pending package base ${String(man.base).slice(0, 12)}\u2026 does not match live bundle.md ${liveHash.slice(0, 12)}\u2026: divergence`, ['rebase via a reconciliation session', 'supersede: human selects one, the other preserved as a diverged branch in _history', 'apply-disjoint if file sets prove disjoint (requires history manifests)']));\n      // C-17.2 (v1.7.0): disjointness auto-classification, the I-17 ladder's\n      // mechanical rung. Same classifier the client promoter uses.\n      const cls = classifyDivergence(man, ctx.files);\n      if (cls.rung === 'disjoint-auto') {\n        findings.push(f('C-17.2', 'info', `divergence classified disjoint-auto: base found in history at ${cls.baseKey}; intervening promotion(s) [${cls.intervening.join(', ')}] touched {${[...cls.interveningFiles].join(', ')}}, package touches {${man.files.map(e => e.name).join(', ')}}, sets disjoint; apply in sequence recording both bases`, ['apply-disjoint: promote in sequence, recording base and applied-over in the history manifest entry']));\n      } else {\n        findings.push(f('C-17.2', 'warn', `divergence classified adjudicated: ${cls.reason}`, ['rebase via a reconciliation session', 'supersede: human selects one, the other preserved as a diverged branch in _history', 'apply-disjoint only if re-examination shows the overlap illusory']));\n      }\n    }\n  }\n}\n\n/**\n * The I-17 divergence ladder's mechanical classifier (State Rules 5.5).\n * Given a pending manifest whose base does NOT match live bundle.md, decide\n * between disjoint-auto and adjudicated using only store state:\n * _history/manifest.json entries plus the verbatim promotion_<key>.json\n * records, whose per-file sha256 lists let the bundle.md hash chain be\n * reconstructed. disjoint-auto requires BOTH: the base resolves to a point\n * in recorded history, and the package's file set is disjoint from the\n * union of files touched by every intervening promotion (file granularity;\n * sub-file merge is a sync-engine concern, never the kernel's).\n * Pure and shared: the gate's C-17.2 and the client promoter both call it.\n */\nexport function classifyDivergence(man, files) {\n  const histRaw = files.get('_history/manifest.json');\n  if (histRaw == null) return { rung: 'adjudicated', reason: 'no history manifest: disjointness unverifiable' };\n  let hist;\n  try { hist = JSON.parse(typeof histRaw === 'string' ? histRaw : new TextDecoder().decode(histRaw)); } catch { return { rung: 'adjudicated', reason: 'history manifest unreadable' }; }\n  const entries = Array.isArray(hist.entries) ? [...hist.entries].sort((a, b) => a.key < b.key ? -1 : 1) : [];\n  if (entries.length === 0) return { rung: 'adjudicated', reason: 'history manifest has no entries' };\n  // Anchor man.base in the chain. Two legitimate anchor forms, and we take\n  // the LATEST match to minimize the intervening set:\n  //   (a) man.base === entries[i].base: the base was live immediately\n  //       before promotion i ran; intervening = entries[i..].\n  //   (b) man.base === bundle.md hash AFTER promotion i (from the verbatim\n  //       promotion record); intervening = entries[i+1..].\n  let start = -1; // index into entries where \"intervening\" begins\n  let anchor = null;\n  for (let i = 0; i < entries.length; i++) {\n    if (entries[i].base === man.base) { start = i; anchor = `before ${entries[i].key}`; }\n  }\n  let recordGap = false;\n  for (let i = 0; i < entries.length; i++) {\n    const recRaw = files.get(`_history/promotion_${entries[i].key}.json`);\n    if (recRaw == null) { recordGap = true; continue; }\n    try {\n      const rec = JSON.parse(typeof recRaw === 'string' ? recRaw : new TextDecoder().decode(recRaw));\n      const b = Array.isArray(rec.files) ? rec.files.find(x => x.name === 'bundle.md') : null;\n      if (b && b.sha256 === man.base && i + 1 > start) { start = i + 1; anchor = `after ${entries[i].key}`; }\n    } catch { recordGap = true; }\n  }\n  if (start === -1) {\n    return { rung: 'adjudicated', reason: recordGap ? 'package base not found in recorded history (and some promotion records are missing or unreadable: chain incomplete)' : 'package base not found anywhere in recorded history' };\n  }\n  const intervening = entries.slice(start);\n  if (intervening.length === 0) return { rung: 'adjudicated', reason: 'base resolves to the chain tail yet live differs: unrecorded live edit' };\n  const interveningFiles = new Set();\n  for (const e of intervening) for (const n of (e.files || [])) interveningFiles.add(n);\n  const overlap = man.files.map(e => e.name).filter(n => interveningFiles.has(n));\n  if (overlap.length > 0) return { rung: 'adjudicated', reason: `overlapping substantive divergence on {${overlap.join(', ')}}` , interveningFiles };\n  return { rung: 'disjoint-auto', baseKey: anchor, intervening: intervening.map(e => e.key), interveningFiles };\n}\n\n// ---------------------------------------------------------------------------\n// Per-type extension checks (I-2 family). information@1: C-2.7.\n// ---------------------------------------------------------------------------\n\n/** Canonicalize a parsed JSON value: recursively sorted keys, compact output. */\nexport function canonicalJson(v) {\n  if (Array.isArray(v)) return '[' + v.map(canonicalJson).join(',') + ']';\n  if (v !== null && typeof v === 'object') {\n    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonicalJson(v[k])).join(',') + '}';\n  }\n  return JSON.stringify(v);\n}\n\nconst INFO_ENUMS = {\n  criticality: ['crucial', 'supporting'],\n  classification: ['fact', 'analysis', 'judgment'],\n  source_status: ['unchanged', 'modified', 'removed']\n};\nconst MONITOR_FREQ = ['hourly', 'daily', 'weekly', 'monthly', 'per_meeting', 'none'];\nconst CONTENT_HASH_RE = /^sha256:[0-9a-f]{64}$/;\n\nasync function checkInformationExtension(ctx, findings) {\n  if (ctx.fm?.object_type !== 'information') return;\n  const fm = ctx.fm;\n  for (const [field, legal] of Object.entries(INFO_ENUMS)) {\n    if (!legal.includes(fm[field])) {\n      findings.push(f('C-2.7', 'error', `${field} '${fm[field]}' is not one of: ${legal.join(', ')}`));\n    }\n  }\n  const src = fm.source;\n  if (!src || typeof src !== 'object') findings.push(f('C-2.7', 'error', 'source block is missing'));\n  else for (const k of ['locator', 'authority', 'retrieved']) {\n    if (!src[k]) findings.push(f('C-2.7', 'error', `source.${k} is missing`));\n  }\n  const mon = fm.monitoring;\n  if (!mon || typeof mon !== 'object') findings.push(f('C-2.7', 'error', 'monitoring block is missing'));\n  else {\n    if (typeof mon.enabled !== 'boolean') findings.push(f('C-2.7', 'error', `monitoring.enabled '${mon.enabled}' is not boolean`));\n    if (!MONITOR_FREQ.includes(mon.frequency)) findings.push(f('C-2.7', 'error', `monitoring.frequency '${mon.frequency}' is not one of: ${MONITOR_FREQ.join(', ')}`));\n  }\n  const ch = fm.content_hash;\n  const chOk = typeof ch === 'string' && CONTENT_HASH_RE.test(ch);\n  if (ch !== undefined && ch !== null && ch !== '' && !chOk) {\n    findings.push(f('C-2.7', 'error', `content_hash '${String(ch).slice(0, 24)}\u2026' is not sha256:<64 hex>`));\n  }\n  // Recompute the hash from the canonical dataset when both exist.\n  const dsRaw = ctx.files.get('data/dataset.json');\n  if (dsRaw && chOk) {\n    try {\n      const canon = canonicalJson(JSON.parse(asText(dsRaw)));\n      const actual = 'sha256:' + await ctx.sha256(canon);\n      if (actual !== ch) {\n        findings.push(f('C-2.7', 'error', `content_hash does not match the canonicalized data/dataset.json (declared ${ch.slice(7, 19)}\u2026, actual ${actual.slice(7, 19)}\u2026)`,\n          ['refresh content_hash and append a change record', 'restore data/dataset.json from history']));\n      }\n    } catch { /* C-14.3 already reports unparsable JSON */ }\n  }\n  // verified-state entry requirements\n  if (fm.current_state === 'verified') {\n    if (!chOk) findings.push(f('C-2.7', 'error', 'verified state requires a well-formed content_hash'));\n    if (!dsRaw) findings.push(f('C-2.7', 'error', 'verified state requires data/dataset.json'));\n    const hasSnap = [...ctx.files.keys()].some(p => p.startsWith('snapshots/'))\n      || (ctx.elided && [...ctx.elided].some(p => p.startsWith('snapshots/')));\n    if (!hasSnap) findings.push(f('C-2.7', 'error', 'verified state requires at least one file in snapshots/'));\n  }\n  // change records, when present\n  const chRaw = ctx.files.get('data/changes.json');\n  if (chRaw) {\n    try {\n      const recs = JSON.parse(asText(chRaw));\n      const arr = recs && Array.isArray(recs.records) ? recs.records : null;\n      if (!arr) findings.push(f('C-2.7', 'error', 'data/changes.json must be {\"records\": [...]}'));\n      else for (let i = 0; i < arr.length; i++) {\n        const r = arr[i];\n        if (!r || !ISO_TS_RE.test(r.detected || '') || !['modified', 'removed', 'corrected'].includes(r.kind) || !r.summary) {\n          findings.push(f('C-2.7', 'error', `changes.json records[${i}] lacks detected/kind/summary in the required shape`));\n        }\n      }\n    } catch { /* C-14.3 reports */ }\n  }\n}\n\n// ---------------------------------------------------------------------------\n// Step-4 families: C-5 append-only, C-6 references, C-12 history, C-15 recheck.\n// ---------------------------------------------------------------------------\n\nconst REL_VOCAB = ['cites', 'relates_to', 'elevated_into', 'initiates', 'derived_from', 'supersedes', 'corroborates'];\nconst EDGE_STATUS = ['proposed', 'confirmed', 'severed'];\n\nfunction sectionText(body, heading) {\n  const idx = body.indexOf(heading);\n  if (idx < 0) return null;\n  const next = body.indexOf('\\n## ', idx + 1);\n  return body.slice(idx, next === -1 ? undefined : next);\n}\n\n// ---------------------------------------------------------------------------\n// C-18: the release-authority family (I-18 candidate, State Rules v1.5 draft;\n// intake doctrine Sections 2, 4, 4a). Scoped by declared contract: enforced\n// only on information bundles carrying the intake provenance register\n// (data/provenance.json), the artifact whose presence declares the intake\n// contract. Pre-contract bundles keep validating against what they declared\n// (spec Section 8 check versioning); store-wide bindingness arrives with the\n// schema bump that makes the register mandatory.\n// ---------------------------------------------------------------------------\n\n/** Surface and AI identities, never release authors. Staged named-member-now:\n *  a member identity is any named identity outside this closed set, until the\n *  engagement layer adds per-member credentials (intake doctrine 4a). */\nexport const NON_MEMBER_AUTHORS = ['claude', 'pwa-client', 'daemon', 'sweep', 'session', 'accelerator', 'apps-script', 'system', 'agent', 'ai'];\nconst CAPTURE_GRADES = ['A', 'B', 'C'];\nconst ACTOR_CLASSES = ['daemon', 'session', 'member'];\nconst ORIGIN_KINDS = ['named_request', 'sweep', 'member'];\n\n/** C-18.1: intake provenance register shape, release authority, and the\n *  ratification fence (sweep intake lands at collected, never higher). */\nfunction checkReleaseAuthority(ctx, findings) {\n  if (ctx.fm?.object_type !== 'information') return;\n  const raw = ctx.files.get('data/provenance.json');\n  if (!raw) return; // pre-contract bundle: the register is the declaration\n  let reg;\n  try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports unparsable JSON */ }\n  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;\n  if (!docs) {\n    findings.push(f('C-18.1', 'error', 'data/provenance.json must be {\"documents\": [...]} (the intake provenance register)'));\n    return;\n  }\n  let sweepOrigin = false;\n  docs.forEach((d, i) => {\n    if (!d || typeof d !== 'object') { findings.push(f('C-18.1', 'error', `provenance documents[${i}] is not an object`)); return; }\n    for (const k of ['file', 'locator', 'authority', 'retrieved']) {\n      if (!d[k]) findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing '${k}'`));\n    }\n    if (d.file && !hasFile_(ctx, String(d.file)) && !Array.isArray(d.parts)) {\n      findings.push(f('C-18.1', 'error', `provenance documents[${i}] names '${d.file}' which does not exist in the bundle`));\n    }\n    const cap = d.capture;\n    if (!cap || typeof cap !== 'object') findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing capture block`));\n    else {\n      if (!cap.method) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture missing 'method'`));\n      if (!CAPTURE_GRADES.includes(cap.grade)) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.grade '${cap.grade}' is not one of: ${CAPTURE_GRADES.join(', ')}`));\n      if (!ACTOR_CLASSES.includes(cap.actor_class)) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.actor_class '${cap.actor_class}' is not one of: ${ACTOR_CLASSES.join(', ')}`));\n    }\n    const or = d.origin;\n    if (!or || typeof or !== 'object' || !ORIGIN_KINDS.includes(or.kind)) {\n      findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin.kind must be one of: ${ORIGIN_KINDS.join(', ')}`));\n    } else if (or.kind === 'sweep') {\n      sweepOrigin = true;\n      if (!or.matched_sweep) findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin (sweep) missing 'matched_sweep'`));\n      if (!or.deeming_actor) findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin (sweep) missing 'deeming_actor'`));\n    }\n  });\n  // Release authority: the collected -> verified transition is a named\n  // member's decision, AI-assisted but member-made (doctrine 4a).\n  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];\n  const releases = hist.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified');\n  for (const e of releases) {\n    const a = String(e.author || '').toLowerCase();\n    if (!a || NON_MEMBER_AUTHORS.includes(a)) {\n      findings.push(f('C-18.1', 'error', `collected -> verified transition authored by '${e.author}': release is a named member's decision, never a surface or AI identity (intake doctrine 4a)`,\n        ['a named member re-makes the release decision and records the transition under their identity', 'return the bundle to collected pending member ratification']));\n    }\n  }\n  // The ratification fence: sweep intake lands at collected, never higher\n  // (doctrine Section 4). Verified, now or ever, requires a member-authored\n  // release transition.\n  const everVerified = ctx.fm.current_state === 'verified' || hist.some(e => e && e.to_state === 'verified');\n  const memberRelease = releases.some(e => { const a = String(e.author || '').toLowerCase(); return a && !NON_MEMBER_AUTHORS.includes(a); });\n  if (sweepOrigin && everVerified && !memberRelease) {\n    findings.push(f('C-18.1', 'error', 'sweep-origin intake lands at collected, never higher: verified requires per-document human ratification, a member-authored collected -> verified transition (intake doctrine Section 4)',\n      ['set current_state to collected pending ratification', 'a named member ratifies and records the collected -> verified transition']));\n  }\n}\n\nfunction latestHistorySnapshot(ctx) {\n  const snaps = [...ctx.files.keys()].filter(p => /^_history\\/bundle_.*\\.md$/.test(p)).sort();\n  return snaps.length ? snaps[snaps.length - 1] : null;\n}\n\n/** C-5: append-only surfaces never mutated, verified against the latest history snapshot. */\nfunction checkAppendOnly(ctx, findings) {\n  const snapPath = latestHistorySnapshot(ctx);\n  if (!snapPath || !ctx.fm) return; // nothing to compare against yet\n  const snap = parseFrontmatter(asText(ctx.files.get(snapPath)));\n  if (!snap.data) return; // a malformed snapshot is C-12's problem\n  const prior = Array.isArray(snap.data.state_history) ? snap.data.state_history : [];\n  const live = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];\n  if (live.length < prior.length) {\n    findings.push(f('C-5.1', 'error', `state_history shrank from ${prior.length} to ${live.length} entries vs. the latest snapshot`, ['restore from _history and re-append new material']));\n  } else {\n    for (let i = 0; i < prior.length; i++) {\n      if (JSON.stringify(prior[i]) !== JSON.stringify(live[i])) {\n        findings.push(f('C-5.1', 'error', `state_history[${i}] was modified retroactively (append-only surface)`, ['restore from _history and re-append new material']));\n        break;\n      }\n    }\n  }\n  const rn = sectionText(snap.body, '## Review Notes');\n  if (rn && rn.trim() !== '## Review Notes' && !ctx.body.includes(rn.trimEnd())) {\n    findings.push(f('C-5.1', 'error', 'Review Notes content from the prior version is missing or altered (verbatim-immutable)', ['restore from _history and re-append new material', 'record a tamper finding if history lacks the original']));\n  }\n  const priorLog = sectionText(snap.body, '## Session Log') || '';\n  for (const header of priorLog.match(/^### Session .*$/gm) || []) {\n    if (!ctx.body.includes(header)) {\n      findings.push(f('C-5.1', 'error', `Session Log entry '${header.slice(0, 60)}' from the prior version is missing (append-only surface)`, ['restore from _history and re-append new material']));\n    }\n  }\n  // changes.json prefix, when a prior snapshot of it exists\n  const chSnaps = [...ctx.files.keys()].filter(p => /^_history\\/data\\/changes_.*\\.json$/.test(p)).sort();\n  const liveCh = ctx.files.get('data/changes.json');\n  if (chSnaps.length && liveCh) {\n    try {\n      const priorRecs = JSON.parse(asText(ctx.files.get(chSnaps[chSnaps.length - 1]))).records || [];\n      const liveRecs = JSON.parse(asText(liveCh)).records || [];\n      if (liveRecs.length < priorRecs.length || JSON.stringify(liveRecs.slice(0, priorRecs.length)) !== JSON.stringify(priorRecs)) {\n        findings.push(f('C-5.1', 'error', 'data/changes.json records were mutated or removed (append-only surface)', ['restore from _history and re-append new material']));\n      }\n    } catch { /* parse findings elsewhere */ }\n  }\n}\n\n/** C-6: reference shape, substrate independence, required edges, and (when a resolver is injected) target resolution. */\nfunction checkReferences(ctx, findings) {\n  const refs = Array.isArray(ctx.fm?.references) ? ctx.fm.references : [];\n  for (let i = 0; i < refs.length; i++) {\n    const r = refs[i];\n    if (typeof r !== 'object' || r === null) { findings.push(f('C-6.1', 'error', `references[${i}] is not an object`)); continue; }\n    if (!REL_VOCAB.includes(r.rel)) findings.push(f('C-6.1', 'error', `references[${i}].rel '${r.rel}' is not in the closed vocabulary`, ['map to the nearest vocabulary value', 'sever with reason']));\n    if (!EDGE_STATUS.includes(r.status)) findings.push(f('C-6.1', 'error', `references[${i}].status '${r.status}' is not one of: ${EDGE_STATUS.join(', ')}`));\n    const t = r.target;\n    if (typeof t !== 'string' || /:\\/\\/|[/\\\\]|drive\\.google/i.test(t)) {\n      findings.push(f('C-6.1', 'error', `references[${i}].target '${String(t).slice(0, 40)}' looks like a substrate locator; targets are canonical IDs only`));\n    } else if (!BUNDLE_ID_RE.test(t)) {\n      findings.push(f('C-6.1', 'error', `references[${i}].target '${t}' does not match the canonical ID grammar`));\n    } else if (ctx.resolveTarget) {\n      if (!ctx.resolveTarget(t)) {\n        findings.push(f('C-6.2', 'error', `references[${i}].target '${t}' does not resolve in the store`, ['restore target from history', 're-point to the successor object (derived_from chain)', 'sever the edge with a reason note']));\n      }\n    }\n  }\n  // required edges (locally verifiable)\n  if (ctx.fm?.object_type === 'problem' && ctx.fm.current_state === 'elevated') {\n    if (!refs.some(r => r && r.rel === 'elevated_into')) {\n      findings.push(f('C-6.3', 'error', \"an elevated Problem must carry at least one 'elevated_into' reference\"));\n    }\n  }\n  if (ctx.fm?.workproduct_state === 'distributed') {\n    const hasDist = [...ctx.files.keys()].some(p => p.startsWith('distributions/'));\n    if (!hasDist) findings.push(f('C-6.3', 'error', 'workproduct_state is distributed but distributions/ is empty'));\n  }\n}\n\n/** C-12: history manifest coherence and snapshot accounting. */\nfunction checkHistoryCoherence(ctx, findings) {\n  const histFiles = [...ctx.files.keys()].filter(p => p.startsWith('_history/'));\n  const manRaw = ctx.files.get('_history/manifest.json');\n  if (!manRaw) {\n    if (histFiles.length) findings.push(f('C-12.1', 'error', '_history contains files but no manifest.json', ['rebuild manifest entry from surviving files']));\n    return;\n  }\n  let man;\n  try { man = JSON.parse(asText(manRaw)); }\n  catch { findings.push(f('C-12.1', 'error', '_history/manifest.json does not parse', ['rebuild manifest entry from surviving files'])); return; }\n  const entries = Array.isArray(man.entries) ? man.entries : [];\n  const keys = new Set();\n  let prevKey = '';\n  const bundleMdCreated = [];\n  for (let i = 0; i < entries.length; i++) {\n    const e = entries[i];\n    for (const k of ['key', 'kind', 'created', 'files']) if (!(k in (e || {}))) findings.push(f('C-12.1', 'error', `manifest entry[${i}] missing '${k}'`));\n    if (e?.key) {\n      if (keys.has(e.key)) findings.push(f('C-12.1', 'error', `duplicate manifest key '${e.key}'`));\n      if (e.key < prevKey) findings.push(f('C-12.1', 'error', `manifest keys out of order at '${e.key}'`));\n      keys.add(e.key); prevKey = e.key;\n    }\n    // Collected, not maxed, because the newest bundle.md-changing entry has to\n    // be excluded below. See the C-12.1 note at the comparison.\n    if (typeof e?.created === 'string' && Array.isArray(e?.snapshotted) && e.snapshotted.includes('bundle.md')) {\n      bundleMdCreated.push(e.created);\n    }\n    if (e?.kind === 'promotion' && e.key && !ctx.files.has(`_history/promotion_${e.key}.json`)) {\n      findings.push(f('C-12.2', 'error', `promotion record for '${e.key}' is missing`, ['rebuild manifest entry from surviving files', 'record a history-loss finding and re-snapshot current state']));\n    }\n    if (Array.isArray(e?.snapshotted)) {\n      for (const name of e.snapshotted) {\n        const dot = name.lastIndexOf('.');\n        const snapPath = `_history/${name.slice(0, dot)}_${e.key}${name.slice(dot)}`;\n        if (!ctx.files.has(snapPath)) {\n          findings.push(f('C-12.2', 'error', `snapshot '${snapPath}' recorded in manifest entry '${e.key}' is missing`, ['record a history-loss finding and re-snapshot current state']));\n        }\n      }\n    }\n  }\n  // The REFUSAL class (accelerator 0.12.8) is accounted for on its own terms,\n  // not through the version manifest.\n  //\n  // A terminal refusal writes `_history/refused_<stamp>_<hash>.json` naming the\n  // outcome, plus the preserved payload under `_history/refused_<stamp>_<hash>/`.\n  // None of that is part of the version chain: it records material that never\n  // entered history, so the manifest, which indexes promotions and the snapshots\n  // they took, has nothing to say about it.\n  //\n  // Requiring a manifest entry anyway is what the first version of this check\n  // did, and the consequence was severe: every terminal refusal permanently\n  // froze the bundle it happened in, because the orphan finding is an error and\n  // the gate judges the post-promotion image, so no later package could ever\n  // pass. Observed live on INFO-2026-5460 on 2026-07-22, which is the bundle\n  // holding migration_instant, so a single refused fence edit made the fence\n  // itself unchangeable. Exactly the C-12.1 failure shape, by a second route.\n  //\n  // Accounting is not abandoned, only re-seated: a preserved payload must carry\n  // its sibling record, and the record must parse and name an outcome, so\n  // nothing sits in _history unexplained. The hash length is not constrained\n  // here, because records written before the twins agreed on slice(0, 8) carry\n  // the full digest and are honest history that must not go red retroactively.\n  const REFUSAL_RECORD = /^_history\\/refused_(\\d{8}T\\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\\.json$/;\n  const REFUSAL_PAYLOAD = /^_history\\/refused_(\\d{8}T\\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\\//;\n  for (const p of histFiles) {\n    if (p === '_history/manifest.json') continue;\n    const rec = REFUSAL_RECORD.exec(p);\n    if (rec) {\n      let parsed = null;\n      try { parsed = JSON.parse(asText(ctx.files.get(p))); } catch { /* reported below */ }\n      if (!parsed || !parsed.outcome) {\n        findings.push(f('C-12.2', 'error', `refusal record '${p}' does not parse or names no outcome`,\n          ['restore the refusal record from history', 'remove the unexplained refusal artifacts']));\n      }\n      continue;\n    }\n    const pay = REFUSAL_PAYLOAD.exec(p);\n    if (pay) {\n      const sibling = `_history/refused_${pay[1]}.json`;\n      if (!ctx.files.has(sibling)) {\n        findings.push(f('C-12.2', 'error', `preserved refusal payload '${p}' has no refusal record at '${sibling}'`,\n          ['restore the refusal record', 'remove the orphaned preserved payload']));\n      }\n      continue;\n    }\n    const m = /_((?:\\d{8}T\\d{6}Z)_[0-9a-f]{8})\\./.exec(p) || /^_history\\/promotion_(.+)\\.json$/.exec(p);\n    const key = m ? m[1] : null;\n    if (!key || !keys.has(key)) {\n      findings.push(f('C-12.2', 'error', `history file '${p}' maps to no manifest entry`, ['rebuild manifest entry from surviving files']));\n    }\n  }\n  // C-12.1 staleness: live bundle.md must not predate history.\n  //\n  // Two narrowings, both learned the hard way on 2026-07-22.\n  //\n  // 1. Only entries that CHANGED bundle.md count. last_updated is a field in\n  //    bundle.md describing bundle.md; a promotion that touched only data/\n  //    files has no business advancing it.\n  //\n  // 2. The newest such entry is excluded, because it is the promotion that\n  //    WROTE the live bytes. Comparing a document against the moment its own\n  //    package was assembled is circular, and `created` is assembly time, not\n  //    content time. A document may legitimately carry an earlier semantic\n  //    timestamp: a signed ratification records the transition INSTANT, which\n  //    always precedes the packaging that delivers it.\n  //\n  // Without narrowing 2 a ratified bundle was permanently frozen. Its\n  // last_updated is pinned by the release signature, which binds bundle.md's\n  // bytes, so satisfying C-12.1 meant editing bundle.md and destroying the\n  // ratification, while not editing it meant no further promotion could ever\n  // gate. The registry bundle holds migration_instant, so that deadlock made\n  // the fence itself unchangeable.\n  //\n  // What survives: a genuine revert still fails, because live is still\n  // compared against every EARLIER bundle.md-changing promotion.\n  const sorted = bundleMdCreated.slice().sort();\n  sorted.pop();                                   // the promotion that wrote live\n  const newestPrior = sorted.length ? sorted[sorted.length - 1] : '';\n  if (typeof ctx.fm?.last_updated === 'string' && newestPrior && ctx.fm.last_updated < newestPrior) {\n    findings.push(f('C-12.1', 'error', `live last_updated '${ctx.fm.last_updated}' precedes an earlier history entry '${newestPrior}': the live bundle.md is older than a version already superseded`,\n      ['restore the newer bundle.md from history', 'correct last_updated to reflect the live content']));\n  }\n}\n\n/** C-15: recheck coverage on Problems, all dispositions. */\nfunction checkRecheckCoverage(ctx, findings) {\n  if (ctx.fm?.object_type !== 'problem') return;\n  const rts = Array.isArray(ctx.fm.recheck_triggers) ? ctx.fm.recheck_triggers : [];\n  if (rts.length === 0) {\n    findings.push(f('C-15.1', 'error', 'every Problem, in every disposition including dismissed, carries at least one recheck trigger', ['author a trigger, dual-audience shape, dated when time-bound']));\n    return;\n  }\n  for (let i = 0; i < rts.length; i++) {\n    const t = rts[i];\n    if (typeof t !== 'object' || !t?.text || !t?.description) {\n      findings.push(f('C-15.1', 'error', `recheck_triggers[${i}] lacks the dual-audience {text, description} shape`));\n    } else if (t.date !== undefined && !/^\\d{4}-\\d{2}-\\d{2}$/.test(String(t.date))) {\n      findings.push(f('C-15.1', 'error', `recheck_triggers[${i}].date '${t.date}' is not YYYY-MM-DD`));\n    }\n  }\n}\n\n// ---------------------------------------------------------------------------\n// Step-5 families: per-type extensions (C-2.8/9/10), C-8 citations, C-9 gates,\n// C-11 clock, C-7 deletion records.\n// ---------------------------------------------------------------------------\n\nconst DATE_RE = /^\\d{4}-\\d{2}-\\d{2}$/;\n\nfunction checkProblemExtension(ctx, findings) {\n  if (ctx.fm?.object_type !== 'problem') return;\n  const fm = ctx.fm;\n  if (!['agent', 'human'].includes(fm.surfaced_by)) {\n    findings.push(f('C-2.8', 'error', `surfaced_by '${fm.surfaced_by}' is not one of: agent, human`));\n  }\n  if (['deferred', 'dismissed'].includes(fm.current_state)) {\n    if (typeof fm.disposition_reason !== 'string' || fm.disposition_reason.trim() === '') {\n      findings.push(f('C-2.8', 'error', `${fm.current_state} state requires a non-empty disposition_reason`));\n    }\n  }\n}\n\nfunction checkProjectExtension(ctx, findings) {\n  if (ctx.fm?.object_type !== 'project') return;\n  const fm = ctx.fm;\n  if (typeof fm.objective !== 'string' || fm.objective.trim() === '') {\n    findings.push(f('C-2.9', 'error', 'objective is missing or empty'));\n  }\n  const WS = ['draft', 'internally_checked', 'externally_compliant', 'distributed'];\n  if (fm.workproduct_state !== undefined && fm.workproduct_state !== null && !WS.includes(fm.workproduct_state)) {\n    findings.push(f('C-2.9', 'error', `workproduct_state '${fm.workproduct_state}' is not one of: ${WS.join(', ')}`));\n  }\n  const evals = Array.isArray(fm.evaluations) ? fm.evaluations : [];\n  for (let i = 0; i < evals.length; i++) {\n    const e = evals[i];\n    if (!e || !['compliance', 'argument'].includes(e.kind) || !['internal', 'external'].includes(e.strictness)\n        || !['pass', 'findings'].includes(e.result) || !ISO_TS_RE.test(e.timestamp || '')) {\n      findings.push(f('C-2.9', 'error', `evaluations[${i}] lacks the required kind/strictness/result/timestamp shape`));\n    } else if (e.result === 'findings' && !e.findings_ref) {\n      findings.push(f('C-2.9', 'error', `evaluations[${i}] result is findings but findings_ref is empty`));\n    }\n  }\n  if (fm.current_state === 'closed' && !['resolved', 'superseded', 'abandoned'].includes(fm.closed_reason)) {\n    findings.push(f('C-2.9', 'error', `closed state requires closed_reason in: resolved, superseded, abandoned`));\n  }\n  // C-9: the readiness ladder advances only on recorded evaluations\n  const ws = fm.workproduct_state;\n  const passed = (kind, stricts) => evals.some(e => e && e.kind === kind && e.result === 'pass' && stricts.includes(e.strictness));\n  if (['internally_checked', 'externally_compliant', 'distributed'].includes(ws)) {\n    for (const kind of ['compliance', 'argument']) {\n      if (!passed(kind, ['internal', 'external'])) {\n        findings.push(f('C-9.1', 'error', `workproduct_state '${ws}' requires a passing ${kind} evaluation (internal strictness or better)`,\n          ['run the missing evaluation', 'demote workproduct_state to the highest earned rung']));\n      }\n    }\n  }\n  if (['externally_compliant', 'distributed'].includes(ws)) {\n    for (const kind of ['compliance', 'argument']) {\n      if (!passed(kind, ['external'])) {\n        findings.push(f('C-9.1', 'error', `workproduct_state '${ws}' requires a passing external-strictness ${kind} evaluation`,\n          ['run the missing evaluation', 'demote workproduct_state to the highest earned rung']));\n      }\n    }\n  }\n}\n\n/** C-8: citation register shape, hash format, and cite resolution. */\nfunction checkCitationRegister(ctx, findings) {\n  const raw = ctx.files.get('data/citations.json');\n  if (!raw) return;\n  let reg;\n  try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports */ }\n  const claims = Array.isArray(reg?.claims) ? reg.claims : null;\n  if (!claims) { findings.push(f('C-8.1', 'error', 'data/citations.json must be {\"claims\": [...]}')); return; }\n  for (let i = 0; i < claims.length; i++) {\n    const c = claims[i];\n    if (!c || !c.claim_id || !c.claim || !Array.isArray(c.cites) || c.cites.length === 0 || !c.snapshot || !DATE_RE.test(c.as_of || '')) {\n      findings.push(f('C-8.1', 'error', `citations claims[${i}] lacks claim_id/claim/cites[]/snapshot/as_of`,\n        ['supply keys resolving to an Information object', 'demote claim to commentary', 'move claim to Open Questions']));\n      continue;\n    }\n    if (!CONTENT_HASH_RE.test(c.hash || '')) {\n      findings.push(f('C-8.1', 'error', `citations ${c.claim_id}: hash '${String(c.hash).slice(0, 20)}' is not sha256:<64 hex>`));\n    }\n    for (const t of c.cites) {\n      if (!BUNDLE_ID_RE.test(t)) {\n        findings.push(f('C-8.1', 'error', `citations ${c.claim_id}: cite '${t}' is not a canonical ID`));\n      } else if (ctx.resolveTarget && !ctx.resolveTarget(t)) {\n        findings.push(f('C-8.1', 'error', `citations ${c.claim_id}: cite '${t}' does not resolve in the store`,\n          ['supply keys resolving to an Information object', 'demote claim to commentary', 'move claim to Open Questions']));\n      }\n    }\n  }\n}\n\nfunction checkActionExtension(ctx, findings) {\n  if (ctx.fm?.object_type !== 'action') return;\n  const fm = ctx.fm;\n  const KINDS = ['cpra_request', 'grand_jury', 'controller_referral', 'public_comment', 'media', 'litigation_support', 'other'];\n  if (!KINDS.includes(fm.action_kind)) findings.push(f('C-2.10', 'error', `action_kind '${fm.action_kind}' is not in the suite`));\n  if (![1, 2, 3].includes(fm.risk_tier)) findings.push(f('C-2.10', 'error', `risk_tier '${fm.risk_tier}' is not 1, 2, or 3`));\n  if (typeof fm.counterparty !== 'string' || fm.counterparty.trim() === '') {\n    findings.push(f('C-2.10', 'error', 'counterparty is missing or empty'));\n  }\n  if (fm.current_state === 'resolved' && !['complied', 'denied', 'escalated', 'withdrawn'].includes(fm.resolution)) {\n    findings.push(f('C-2.10', 'error', 'resolved state requires resolution in: complied, denied, escalated, withdrawn'));\n  }\n  // C-11: clock discipline\n  const clock = Array.isArray(fm.clock) ? fm.clock : [];\n  const today = new Date(ctx.nowMs ?? Date.now()).toISOString().slice(0, 10);\n  const STATUSES = ['pending', 'met', 'overdue', 'waived'];\n  for (let i = 0; i < clock.length; i++) {\n    const e = clock[i];\n    if (!e || !e.text || !e.description) {\n      findings.push(f('C-11.1', 'error', `clock[${i}] lacks the dual-audience {text, description} shape`)); continue;\n    }\n    if (!DATE_RE.test(e.date || '')) findings.push(f('C-11.1', 'error', `clock[${i}].date '${e.date}' is not YYYY-MM-DD`));\n    if (typeof e.basis !== 'string' || e.basis.trim() === '') {\n      findings.push(f('C-11.1', 'error', `clock[${i}] has no basis (the statute, order, or commitment the date derives from)`, ['supply basis']));\n    }\n    if (!STATUSES.includes(e.status)) findings.push(f('C-11.1', 'error', `clock[${i}].status '${e.status}' is not one of: ${STATUSES.join(', ')}`));\n    if (DATE_RE.test(e.date || '') && e.date < today && e.status === 'pending') {\n      findings.push(f('C-11.1', 'error', `clock[${i}] '${e.text}' is silently past-due (${e.date} < today, status still pending)`,\n        ['mark overdue', 'mark met', 'mark waived with reason']));\n    }\n  }\n}\n\n/** C-7: deletion records, when present. */\nfunction checkDeletionRecords(ctx, findings) {\n  const raw = ctx.files.get('data/deletions.json');\n  if (!raw) return;\n  let del;\n  try { del = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports */ }\n  const recs = Array.isArray(del?.records) ? del.records : null;\n  if (!recs) { findings.push(f('C-7.1', 'error', 'data/deletions.json must be {\"records\": [...]}')); return; }\n  for (let i = 0; i < recs.length; i++) {\n    const r = recs[i];\n    if (!r || !ISO_TS_RE.test(r.timestamp || '') || typeof r.reason !== 'string' || r.reason.trim() === ''\n        || !Array.isArray(r.items) || r.items.length === 0 || !r.preserved_to) {\n      findings.push(f('C-7.1', 'error', `deletions records[${i}] lacks timestamp/reason/items[]/preserved_to`,\n        ['restore removed material', 'convert to a gated deletion retroactively: reason, preservation, cascade']));\n    }\n  }\n}\n\n// ---------------------------------------------------------------------------\n// C-18.3/4/5: intake register integrity and the gathering-request grammar\n// (State Rules v1.5 draft; adversarial review F4, F5). C-18.3 folds duplicate\n// captures into corroboration; C-18.4 is the F4 provenance-forgery advisory;\n// C-18.5 is the F5 injection-posture gathering.json field grammar.\n// ---------------------------------------------------------------------------\n\n/** https-only, public hosts only (intake doctrine 0.7): forecloses lookalike\n *  origins and SSRF-shaped locators alike. The one canonical implementation;\n *  the accelerator's daemon delegates to this through the embedded gate. */\nexport function isPublicHttpsLocator(url) {\n  if (typeof url !== 'string' || !/^https:\\/\\//.test(url)) return false;\n  const m = /^https:\\/\\/([^/?#]+)/.exec(url);\n  if (!m) return false;\n  const hostport = m[1];\n  if (hostport.indexOf('@') !== -1) return false;\n  const host = hostport.split(':')[0].toLowerCase();\n  if (host === 'localhost' || host.charAt(0) === '[') return false;\n  if (/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(host)) return false;\n  if (host.indexOf('.') === -1) return false;\n  return true;\n}\n\nconst GATH_ID_RE = /^GATH-\\d{4}-\\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;\nconst CRITICALITY_ENUM = ['crucial', 'supporting'];\nconst CADENCE_ENUM = ['hourly', 'daily', 'weekly', 'monthly', 'none'];\nconst GATH_STATUS_ENUM = ['open', 'captured', 'retired'];\n\n/** C-18.3 (error): a capture.sha256 appearing in more than one register\n *  document is a missed corroboration (the ring-once rule: identical content\n *  is corroboration on one entry, never two review items). C-18.4 (warn, F4):\n *  crucial-criticality material whose register entries lack both co_archive\n *  and timestamp. Both scoped by declared contract (register present). */\nfunction checkRegisterIntegrity(ctx, findings) {\n  if (ctx.fm?.object_type !== 'information') return;\n  const raw = ctx.files.get('data/provenance.json');\n  if (!raw) return;\n  let reg;\n  try { reg = JSON.parse(asText(raw)); } catch { return; }\n  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;\n  if (!docs) return; // C-18.1 reports shape\n  const byHash = {};\n  for (let i = 0; i < docs.length; i++) {\n    const h = docs[i] && docs[i].capture && docs[i].capture.sha256;\n    if (!h) continue;\n    (byHash[h] = byHash[h] || []).push(i);\n  }\n  for (const h of Object.keys(byHash)) {\n    if (byHash[h].length > 1) {\n      findings.push(f('C-18.3', 'error', `capture hash ${h.slice(0, 16)}\u2026 appears in ${byHash[h].length} register documents (indices ${byHash[h].join(', ')}); identical content is corroboration on one entry, never duplicate review items`,\n        ['fold the duplicates into corroborations[] on the earliest entry', 'if the captures genuinely differ, correct the recorded hashes']));\n    }\n  }\n  if (ctx.fm.criticality === 'crucial') {\n    for (let i = 0; i < docs.length; i++) {\n      const d = docs[i];\n      if (!d || typeof d !== 'object') continue;\n      if (!d.co_archive && !d.timestamp) {\n        findings.push(f('C-18.4', 'warn', `crucial-criticality document[${i}] (${d.file || '?'}) carries neither co_archive nor timestamp; a reviewing member must verify co-attestation before release (F4)`,\n          ['attach a co-archive or trusted timestamp', 'record the verified provenance in Review Notes at ratification']));\n      }\n    }\n  }\n}\n\n// ---------------------------------------------------------------------------\n// information@2 (M3' member submissions): the register contract extended by\n// the schema bump taken once. C-18.1 gains the @2 shapes (mandatory register,\n// capture encoding, custody for member-origin documents, attestation_attempts,\n// parts, derived, releases); C-18.6 verifies registered capture hashes against\n// stored bytes (decode-at-promotion means bytes at rest hash directly; legacy\n// base64 decodes first); C-18.7 stages the doctrine 4a release signature\n// (detached SSH signature, ssh-keygen -Y, namespace bio-release) as a warning\n// until member keys are distributed. Scoped by schema stamp: information@1\n// bundles keep the v1 contract per spec Section 8 check versioning.\n// ---------------------------------------------------------------------------\n\nconst CAPTURE_ENCODINGS = ['utf8', 'base64', 'binary'];\nconst HIST_TS_RE = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$/;\nconst RAW_SHA_RE = /^[0-9a-f]{64}$/;\n\n/** Portable base64 decode (no Buffer, no atob): verifies legacy .b64 files\n *  in Node, the browser, and the Apps Script embed alike. */\nexport function b64ToBytes(s) {\n  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n  const clean = String(s).replace(/[\\s=]+/g, '');\n  const out = new Uint8Array(Math.floor(clean.length * 3 / 4));\n  let o = 0, buf = 0, bits = 0;\n  for (let i = 0; i < clean.length; i++) {\n    const v = A.indexOf(clean[i]);\n    if (v === -1) throw new Error('invalid base64 at position ' + i);\n    buf = (buf << 6) | v; bits += 6;\n    if (bits >= 8) { bits -= 8; out[o++] = (buf >> bits) & 0xff; }\n  }\n  return out.subarray(0, o);\n}\n\n/** Incremental SHA-256 (FIPS 180-4), pure JS, Uint8Array-native, zero\n *  dependencies: one byte per element end to end, no platform digest, no\n *  signed-byte conversion. Exists so oversize multi-part captures stream\n *  through the hash one part at a time (KICKOFF-P2M6 4a: the whole-file\n *  reassembly plus Apps Script's number-array digest input materialized\n *  ~8 bytes per content byte and OOMed the promotion of the 39.6MB budget\n *  book). update() accepts Uint8Array or any byte array-like (values are\n *  coerced mod 256, so Apps Script signed bytes agree); hex() finalizes.\n *  Battery-cross-validated against WebCrypto on multiple sizes and chunk\n *  boundary offsets: a wrong hash here would silently corrupt every gate\n *  verdict, so the battery is load-bearing, not decorative. */\nexport function createSha256() {\n  const K = [\n    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,\n    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,\n    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,\n    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,\n    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,\n    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,\n    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,\n    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2\n  ];\n  let h0 = 0x6a09e667 | 0, h1 = 0xbb67ae85 | 0, h2 = 0x3c6ef372 | 0, h3 = 0xa54ff53a | 0;\n  let h4 = 0x510e527f | 0, h5 = 0x9b05688c | 0, h6 = 0x1f83d9ab | 0, h7 = 0x5be0cd19 | 0;\n  const buf = new Uint8Array(64);\n  const w = new Int32Array(64);\n  let bufLen = 0;\n  let total = 0;       // message length in bytes (< 2^53, ample for the store)\n  let finalized = false;\n\n  function compress(bytes, off) {\n    for (let i = 0; i < 16; i++) {\n      w[i] = (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];\n      off += 4;\n    }\n    for (let i = 16; i < 64; i++) {\n      const x = w[i - 15], y = w[i - 2];\n      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);\n      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);\n      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;\n    }\n    let a = h0, b = h1, c = h2, d = h3, e = h4, f2 = h5, g = h6, h = h7;\n    for (let i = 0; i < 64; i++) {\n      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));\n      const ch = (e & f2) ^ (~e & g);\n      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;\n      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));\n      const maj = (a & b) ^ (a & c) ^ (b & c);\n      const t2 = (S0 + maj) | 0;\n      h = g; g = f2; f2 = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;\n    }\n    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;\n    h4 = (h4 + e) | 0; h5 = (h5 + f2) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;\n  }\n\n  return {\n    /** Feed a chunk of bytes. Chainable. */\n    update(chunk) {\n      if (finalized) throw new Error('sha256 stream already finalized');\n      let c = chunk;\n      if (!(c instanceof Uint8Array)) c = Uint8Array.from(c);   // signed bytes coerce mod 256\n      let i = 0;\n      const n = c.length;\n      total += n;\n      if (bufLen > 0) {                                          // top up a partial block\n        while (bufLen < 64 && i < n) buf[bufLen++] = c[i++];\n        if (bufLen === 64) { compress(buf, 0); bufLen = 0; }\n      }\n      while (n - i >= 64) { compress(c, i); i += 64; }           // full blocks, no copy\n      while (i < n) buf[bufLen++] = c[i++];                      // tail into the buffer\n      return this;\n    },\n    /** Finalize and return the lowercase hex digest. */\n    hex() {\n      if (finalized) throw new Error('sha256 stream already finalized');\n      finalized = true;\n      const bitHi = Math.floor(total / 0x20000000);              // total*8 >>> 32\n      const bitLo = (total % 0x20000000) * 8;                    // low 32 bits of total*8\n      buf[bufLen++] = 0x80;\n      if (bufLen > 56) { while (bufLen < 64) buf[bufLen++] = 0; compress(buf, 0); bufLen = 0; }\n      while (bufLen < 56) buf[bufLen++] = 0;\n      buf[56] = (bitHi >>> 24) & 0xff; buf[57] = (bitHi >>> 16) & 0xff;\n      buf[58] = (bitHi >>> 8) & 0xff; buf[59] = bitHi & 0xff;\n      buf[60] = (bitLo >>> 24) & 0xff; buf[61] = (bitLo >>> 16) & 0xff;\n      buf[62] = (bitLo >>> 8) & 0xff; buf[63] = bitLo & 0xff;\n      compress(buf, 0);\n      let out = '';\n      const H = [h0, h1, h2, h3, h4, h5, h6, h7];\n      for (let i = 0; i < 8; i++) {\n        const v = H[i] >>> 0;\n        out += ('00000000' + v.toString(16)).slice(-8);\n      }\n      return out;\n    }\n  };\n}\n\n/** Stored value to hashable input: base64 decodes to raw bytes; utf8 and\n *  binary hash as stored (ctx.sha256 accepts string or bytes, so the Apps\n *  Script embed, which reads text files as strings, needs no TextEncoder). */\nfunction storedToHashable(v, encoding) {\n  if (encoding === 'base64') return b64ToBytes(asText(v));\n  return v;\n}\n\nasync function checkInfo2Contract(ctx, findings) {\n  if (ctx.fm?.object_type !== 'information' || ctx.fm?.schema !== 'information@2') return;\n  const raw = ctx.files.get('data/provenance.json');\n  if (!raw) {\n    findings.push(f('C-18.1', 'error', 'information@2 requires data/provenance.json: the schema bump makes the intake provenance register mandatory'));\n    return;\n  }\n  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports\n  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;\n  if (!docs) return; // C-18.1 v1 shape check reports\n  for (let i = 0; i < docs.length; i++) {\n    const d = docs[i]; if (!d || typeof d !== 'object') continue;\n    const cap = d.capture && typeof d.capture === 'object' ? d.capture : {};\n    if (!CAPTURE_ENCODINGS.includes(cap.encoding)) {\n      findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.encoding '${cap.encoding}' is not one of: ${CAPTURE_ENCODINGS.join(', ')} (@2)`));\n    }\n    const or = d.origin && typeof d.origin === 'object' ? d.origin : {};\n    if (or.kind === 'member') {\n      if (cap.actor_class !== 'member') {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin capture must record actor_class 'member' (@2)`));\n      }\n      const c = d.custody;\n      if (!c || typeof c !== 'object') {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin document missing custody block {holder, obtained, setting, attestation} (doctrine 3a) (@2)`));\n      } else {\n        for (const k of ['holder', 'setting', 'attestation']) {\n          if (!c[k]) findings.push(f('C-18.1', 'error', `provenance documents[${i}].custody missing '${k}' (@2)`));\n        }\n        if (!HIST_TS_RE.test(c.obtained || '')) {\n          findings.push(f('C-18.1', 'error', `provenance documents[${i}].custody.obtained '${c.obtained}' is not YYYY-MM-DDTHH:MM:SSZ (@2)`));\n        }\n      }\n      if (d.attestation_attempts === undefined) {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin document missing attestation_attempts; the 7.7 asymmetry is recorded honestly, attempted false with the reason in note (@2)`));\n      }\n    }\n    if (d.attestation_attempts !== undefined) {\n      if (!Array.isArray(d.attestation_attempts)) {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}].attestation_attempts must be an array (@2)`));\n      } else {\n        d.attestation_attempts.forEach((a, j) => {\n          if (!a || typeof a !== 'object' || !a.service || typeof a.attempted !== 'boolean' || typeof a.ok !== 'boolean') {\n            findings.push(f('C-18.1', 'error', `provenance documents[${i}].attestation_attempts[${j}] lacks the {service, attempted, ok} shape (@2)`));\n          }\n        });\n      }\n    }\n    if (d.parts !== undefined) {\n      if (!Array.isArray(d.parts) || !d.parts.length) {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts must be a nonempty array (@2)`));\n      } else {\n        if (!RAW_SHA_RE.test(cap.sha256 || '')) {\n          findings.push(f('C-18.1', 'error', `provenance documents[${i}]: parts require capture.sha256 over the reassembled whole (@2)`));\n        }\n        d.parts.forEach((p, j) => {\n          if (!p || typeof p !== 'object' || !p.file || !RAW_SHA_RE.test(p.sha256 || '') || !(Number.isInteger(p.bytes) && p.bytes > 0)) {\n            findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts[${j}] lacks the {file, sha256, bytes} shape (@2)`));\n          } else if (!hasFile_(ctx, String(p.file))) {\n            findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts[${j}] names '${p.file}' which does not exist in the bundle (@2)`));\n          }\n        });\n      }\n    }\n    if (d.derived !== undefined) {\n      const dv = d.derived;\n      const shapeOk = dv && typeof dv === 'object' && dv.transform && dv.reason && (dv.from_file || dv.from_ref);\n      if (!shapeOk) {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}].derived lacks the {transform, reason, from_file|from_ref} shape (doctrine 4a) (@2)`));\n      } else if (dv.from_file && !hasFile_(ctx, String(dv.from_file))) {\n        findings.push(f('C-18.1', 'error', `provenance documents[${i}].derived.from_file '${dv.from_file}' does not exist in the bundle (@2)`));\n      }\n    }\n  }\n  if (reg.releases !== undefined) {\n    if (!Array.isArray(reg.releases)) {\n      findings.push(f('C-18.1', 'error', 'provenance releases must be an array (@2)'));\n    } else {\n      reg.releases.forEach((r, i) => {\n        if (!r || typeof r !== 'object' || !HIST_TS_RE.test(r.transition || '') || !r.author) {\n          findings.push(f('C-18.1', 'error', `provenance releases[${i}] lacks the {transition, author} shape (@2)`));\n          return;\n        }\n        if (r.signature_file) {\n          if (!hasFile_(ctx, String(r.signature_file))) {\n            findings.push(f('C-18.1', 'error', `provenance releases[${i}].signature_file '${r.signature_file}' does not exist in the bundle (@2)`));\n          }\n          if (!r.signer) findings.push(f('C-18.1', 'error', `provenance releases[${i}] carries a signature_file but no signer (@2)`));\n          if (r.namespace !== 'bio-release') {\n            findings.push(f('C-18.1', 'error', `provenance releases[${i}].namespace '${r.namespace}' must be 'bio-release' (ssh-keygen -Y namespace discipline) (@2)`));\n          }\n        }\n      });\n    }\n  }\n  // C-18.7 (warn): the staged posture until member keys are distributed.\n  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];\n  const rels = Array.isArray(reg.releases) ? reg.releases : [];\n  for (const e of hist) {\n    if (!e || e.from_state !== 'collected' || e.to_state !== 'verified') continue;\n    const signed = rels.some(r => r && r.transition === e.timestamp && r.signature_file);\n    if (!signed) {\n      findings.push(f('C-18.7', 'warn', `collected -> verified transition at ${e.timestamp} has no signed release record; the target mechanism is a detached SSH signature over the transition record (ssh-keygen -Y sign, namespace bio-release; doctrine 4a)`,\n        ['sign the transition record and add the releases[] entry with signature_file, signer, namespace', 'record the interim member review of the release log in Review Notes']));\n    }\n  }\n  // C-18.6 (error): registered capture hashes verify against stored bytes.\n  // 1.11.0 (KICKOFF-P2M6 4a): byte-stored parts stream through the\n  // incremental SHA-256 one part at a time, decoded per part for legacy\n  // base64, so peak residency is a single part, never the reassembled\n  // whole. Text-stored parts keep the join path (Apps Script text reads\n  // are strings and hash natively over UTF-8; no TextEncoder dependency).\n  for (let i = 0; i < docs.length; i++) {\n    const d = docs[i]; if (!d || typeof d !== 'object') continue;\n    const cap = d.capture && typeof d.capture === 'object' ? d.capture : {};\n    if (!RAW_SHA_RE.test(cap.sha256 || '') || !CAPTURE_ENCODINGS.includes(cap.encoding)) continue;\n    let hashable = null;\n    let actual = null;\n    try {\n      if (Array.isArray(d.parts) && d.parts.length && d.parts.every(p => p && p.file && ctx.files.has(String(p.file)))) {\n        const stored = d.parts.map(p => ctx.files.get(String(p.file)));\n        const textStored = v => cap.encoding !== 'base64' && typeof v === 'string';\n        if (stored.every(v => textStored(v))) {\n          hashable = stored.join('');\n        } else if (stored.every(v => !textStored(v))) {\n          const h = createSha256();\n          for (const v of stored) h.update(cap.encoding === 'base64' ? b64ToBytes(asText(v)) : v);\n          actual = h.hex();\n        } else {\n          throw new Error('parts mix text and binary storage');\n        }\n      } else if (d.file && ctx.files.has(String(d.file))) {\n        hashable = storedToHashable(ctx.files.get(String(d.file)), cap.encoding);\n      }\n    } catch (err) {\n      findings.push(f('C-18.6', 'error', `provenance documents[${i}]: stored content could not be decoded for hash verification (${err && err.message}) (@2)`));\n      continue;\n    }\n    if (actual === null) {\n      if (hashable === null) continue;\n      actual = await ctx.sha256(hashable);\n    }\n    if (actual !== cap.sha256) {\n      findings.push(f('C-18.6', 'error', `provenance documents[${i}]: stored bytes hash ${actual.slice(0, 12)}\u2026 but the register records ${String(cap.sha256).slice(0, 12)}\u2026; silent content mutation fails the gate (@2)`,\n        ['restore the capture from history', 'correct the register only if the recorded hash was wrong at intake, with a Session Log entry']));\n    }\n  }\n}\n\n/** C-18.5 (error): data/gathering.json field grammar. A leaked write token can\n *  litter the queue but never steer a member's session: the exporter renders\n *  these fields as quoted data, and this grammar bounds what they can carry\n *  (F5, doctrine 0.7). Scoped by declared contract: enforced only where the\n *  file is present. */\nfunction checkGatheringGrammar(ctx, findings) {\n  const raw = ctx.files.get('data/gathering.json');\n  if (!raw) return;\n  let g;\n  try { g = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports\n  if (typeof g !== 'object' || g === null || Array.isArray(g)) {\n    findings.push(f('C-18.5', 'error', 'data/gathering.json must be a JSON object'));\n    return;\n  }\n  if (g.daemon !== undefined) {\n    const dmn = g.daemon;\n    if (typeof dmn !== 'object' || dmn === null || Array.isArray(dmn)) {\n      findings.push(f('C-18.5', 'error', 'gathering.json daemon block must be an object'));\n    } else {\n      if (typeof dmn.enabled !== 'boolean') findings.push(f('C-18.5', 'error', 'gathering.json daemon.enabled must be boolean'));\n      for (const bk of ['tick_budget', 'sweep_budget']) {\n        if (dmn[bk] !== undefined && !(Number.isInteger(dmn[bk]) && dmn[bk] >= 0)) {\n          findings.push(f('C-18.5', 'error', `gathering.json daemon.${bk} must be a non-negative integer`));\n        }\n      }\n    }\n  }\n  const reqs = Array.isArray(g.requests) ? g.requests : [];\n  for (let i = 0; i < reqs.length; i++) {\n    const r = reqs[i];\n    if (typeof r !== 'object' || r === null) { findings.push(f('C-18.5', 'error', `gathering.json requests[${i}] is not an object`)); continue; }\n    if (!GATH_ID_RE.test(r.id || '')) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].id '${r.id}' does not match the GATH grammar`));\n    const tgt = r.target;\n    if (!tgt || typeof tgt !== 'object') findings.push(f('C-18.5', 'error', `gathering.json requests[${i}] missing target block`));\n    else {\n      if (typeof tgt.text !== 'string' || tgt.text.length === 0 || tgt.text.length > 200 || /[\\r\\n]/.test(tgt.text)) {\n        findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].target.text must be a nonempty single-line string under 200 chars`));\n      }\n      if (tgt.description !== undefined && (typeof tgt.description !== 'string' || tgt.description.length > 2000)) {\n        findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].target.description must be a string under 2000 chars`));\n      }\n    }\n    const locs = Array.isArray(r.locators) ? r.locators : null;\n    if (!locs || locs.length === 0) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].locators must be a nonempty array`));\n    else for (let L = 0; L < locs.length; L++) {\n      if (!isPublicHttpsLocator(locs[L])) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].locators[${L}] '${String(locs[L]).slice(0, 40)}' is not an https public-host locator`));\n    }\n    if (typeof r.authority !== 'string' || r.authority.trim() === '') findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].authority must be a nonempty string`));\n    if (!CRITICALITY_ENUM.includes(r.criticality)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].criticality must be one of: ${CRITICALITY_ENUM.join(', ')}`));\n    if (r.cadence !== undefined && !CADENCE_ENUM.includes(r.cadence)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].cadence must be one of: ${CADENCE_ENUM.join(', ')}`));\n    if (!GATH_STATUS_ENUM.includes(r.status)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].status must be one of: ${GATH_STATUS_ENUM.join(', ')}`));\n    if (r.planted !== undefined && !ISO_TS_RE.test(r.planted)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].planted must be an ISO 8601 UTC instant`));\n  }\n  const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];\n  for (let i = 0; i < sweeps.length; i++) {\n    const s = sweeps[i];\n    if (typeof s !== 'object' || s === null) { findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}] is not an object`)); continue; }\n    if (typeof s.id !== 'string' || s.id.trim() === '') findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].id must be a nonempty string`));\n    if (s.ratified !== undefined && typeof s.ratified !== 'boolean') findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].ratified must be boolean`));\n    if (s.sources !== undefined) {\n      if (!Array.isArray(s.sources)) findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].sources must be an array`));\n      else for (let L = 0; L < s.sources.length; L++) if (!isPublicHttpsLocator(s.sources[L])) findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].sources[${L}] is not an https public-host locator`));\n    }\n  }\n}\n\n// ---------------------------------------------------------------------------\n// C-20.1: the mechanical-writer diff-conformance auditor (I-20, State Rules\n// v1.5 draft; daemon slate Section 0). For any history promotion record marked\n// writer 'mechanical', the promoted diff (decidable from the history snapshots)\n// must stay within the operation's declared field set plus append-only\n// surfaces; the body change must be confined to the Session Log; and the files\n// touched must be a subset of the mechanical envelope. The field-set tables\n// live here (the registry), amended only by revision, never by code change.\n// ---------------------------------------------------------------------------\n\n/** Per-operation closed field sets (daemon slate Section 0). last_updated\n *  rides every mutating set: write-completeness law (C-12.1, C-13.2) makes it\n *  inseparable from any update. Frontmatter paths in dotted form; 'clock[]'\n *  denotes clock entry fields. */\nexport const MECHANICAL_FIELD_SETS = {\n  'monitor-tick': ['source_status', 'monitoring.last_checked', 'reeval_pending.flag', 'reeval_pending.since', 'reeval_pending.source', 'last_updated'],\n  'sweep': [],\n  'deadline-recheck': ['clock[].status', 'last_updated'],\n  'member-attest': ['last_updated']\n};\n/** Append-only file surfaces a mechanical writer may add to (beyond bundle.md\n *  and the history/snapshot machinery the promoter itself writes). */\nconst MECHANICAL_APPEND_FILES = ['data/changes.json', 'data/provenance.json'];\n\n/** Flatten frontmatter to dotted scalar paths for diffing. Arrays that carry\n *  objects with a status field (clock) get 'key[].field' treatment; other\n *  arrays and maps compare by canonical JSON at the top key. */\nfunction flattenFm(fm) {\n  const out = {};\n  if (!fm || typeof fm !== 'object') return out;\n  for (const k of Object.keys(fm)) {\n    const v = fm[k];\n    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {\n      for (const c of Object.keys(v)) out[k + '.' + c] = canonicalJson(v[c]);\n    } else {\n      out[k] = canonicalJson(v);\n    }\n  }\n  return out;\n}\n\n/** The set of dotted frontmatter paths whose values differ between two\n *  snapshots. clock arrays are compared elementwise on status. */\nfunction fmDiffPaths(prevFm, nextFm) {\n  const changed = new Set();\n  const a = flattenFm(prevFm), b = flattenFm(nextFm);\n  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);\n  for (const k of keys) {\n    if (k === 'clock') {\n      const pc = Array.isArray(prevFm.clock) ? prevFm.clock : [];\n      const nc = Array.isArray(nextFm.clock) ? nextFm.clock : [];\n      const n = Math.max(pc.length, nc.length);\n      for (let i = 0; i < n; i++) {\n        const pe = pc[i] || {}, ne = nc[i] || {};\n        for (const field of new Set([...Object.keys(pe), ...Object.keys(ne)])) {\n          if (canonicalJson(pe[field]) !== canonicalJson(ne[field])) changed.add('clock[].' + field);\n        }\n      }\n      continue;\n    }\n    if (a[k] !== b[k]) changed.add(k);\n  }\n  return changed;\n}\n\n/** Section bodies keyed by heading, for confinement of the body change. */\nfunction bodySections(body) {\n  const out = {};\n  const re = /^## .*$/gm;\n  let m, starts = [];\n  while ((m = re.exec(body)) !== null) starts.push({ h: m[0].trimEnd(), i: m.index });\n  for (let i = 0; i < starts.length; i++) {\n    const end = i + 1 < starts.length ? starts[i + 1].i : body.length;\n    out[starts[i].h] = body.slice(starts[i].i, end);\n  }\n  return out;\n}\n\n/** C-20.1 (error): mechanical-writer diff conformance. Reads the history\n *  manifest and the verbatim promotion records; for each mechanical entry with\n *  a recoverable pre-snapshot, asserts the diff against the declared envelope. */\nasync function checkMechanicalConformance(ctx, findings) {\n  const manRaw = ctx.files.get('_history/manifest.json');\n  if (!manRaw) return;\n  let man;\n  try { man = JSON.parse(asText(manRaw)); } catch { return; } // C-12 reports\n  const entries = Array.isArray(man.entries) ? [...man.entries].sort((a, b) => a.key < b.key ? -1 : 1) : [];\n  for (let i = 0; i < entries.length; i++) {\n    const e = entries[i];\n    if (!e || e.kind !== 'promotion' || !e.key) continue;\n    const recRaw = ctx.files.get(`_history/promotion_${e.key}.json`);\n    if (!recRaw) continue; // C-12.2 reports the missing record\n    let rec;\n    try { rec = JSON.parse(asText(recRaw)); } catch { continue; }\n    const man2 = rec.manifest || rec;\n    const writer = man2.writer || rec.writer;\n    if (writer !== 'mechanical') continue;\n    const op = man2.operation || rec.operation;\n    if (!op || !(op in MECHANICAL_FIELD_SETS)) {\n      findings.push(f('C-20.1', 'error', `history entry '${e.key}' is marked mechanical but names undeclared operation '${op}'`,\n        ['a mechanical promotion must name a registered operation', 'if hand-authored, remove the mechanical marker']));\n      continue;\n    }\n    // Snapshot convention (the promoter, step 4): `bundle_<key>.md` is the\n    // PRE-image the promotion keyed <key> took before writing. The state\n    // BEFORE e is therefore e's OWN snapshot (absent for a creation), and\n    // the state AFTER e is the pre-snapshot of the next promotion that\n    // touched bundle.md, or live when no later promotion touched it. A gap\n    // (a later bundle.md-touching promotion whose snapshot is missing)\n    // makes e's post state unknowable: skip rather than blame live state.\n    // (1.10.1: the prior indexing read shifted snapshots and fell back to\n    // live unconditionally, misattributing later member elevations to\n    // mechanical creations and refusing valid packages.)\n    const preSnapPath = `_history/bundle_${e.key}.md`;\n    const preSnap = ctx.files.has(preSnapPath) ? ctx.files.get(preSnapPath) : null;\n    const base = man2.base;\n    const isCreation = base === EMPTY_STRING_SHA || preSnap === null;\n    let postRaw = null, postUnknowable = false;\n    for (let j = i + 1; j < entries.length; j++) {\n      const p = `_history/bundle_${entries[j].key}.md`;\n      if (ctx.files.has(p)) { postRaw = ctx.files.get(p); break; }\n      if ((entries[j].files || []).includes('bundle.md')) { postUnknowable = true; break; }\n    }\n    if (postRaw === null && !postUnknowable) {\n      // Tail (1.12.0): live is e's post state ONLY while live still hashes\n      // to the bundle.md sha e's own verbatim record wrote. A live file\n      // that has moved past e (a pending member edit entering the gate\n      // image, an unrecorded change) is NOT e's doing: skip rather than\n      // blame, the 1.10.1 principle. Without this, the first member edit\n      // gated over a tail mechanical promotion is misattributed to it and\n      // refused. The recorded sha is the same evidence classifyDivergence\n      // anchor form (b) already trusts.\n      const liveRaw = ctx.files.get('bundle.md');\n      if (liveRaw) {\n        const rb = Array.isArray(man2.files) ? man2.files.find(x => x.name === 'bundle.md') : null;\n        if (rb && rb.sha256) {\n          const liveHash = await ctx.sha256(liveRaw);\n          if (liveHash === rb.sha256) postRaw = liveRaw; else postUnknowable = true;\n        } else {\n          postRaw = liveRaw;\n        }\n      }\n    }\n    if (!postRaw) continue;\n    const post = parseFrontmatter(asText(postRaw));\n    if (isCreation) {\n      if (post.data && post.data.current_state && post.data.current_state !== 'collected' && post.data.object_type === 'information') {\n        findings.push(f('C-20.1', 'error', `mechanical creation '${e.key}' lands at '${post.data.current_state}', not collected (daemon creations never elevate)`,\n          ['re-produce the creation at collected', 'if a member released it, the release transition must be a separate member-authored promotion']));\n      }\n      continue;\n    }\n    const prev = parseFrontmatter(asText(preSnap));\n    const allowed = new Set(MECHANICAL_FIELD_SETS[op]);\n    const changed = fmDiffPaths(prev.data || {}, post.data || {});\n    for (const path of changed) {\n      if (!allowed.has(path)) {\n        findings.push(f('C-20.1', 'error', `mechanical '${op}' promotion '${e.key}' changed frontmatter '${path}', outside its declared field set {${[...allowed].join(', ')}}`,\n          ['revert the out-of-envelope change', 'if the change is legitimate, it belongs to a member-authored promotion, not a mechanical one']));\n      }\n    }\n    // Body change confined to the Session Log section.\n    const prevSec = bodySections(prev.body || ''), postSec = bodySections(post.body || '');\n    for (const h of new Set([...Object.keys(prevSec), ...Object.keys(postSec)])) {\n      if (h === '## Session Log') continue;\n      if ((prevSec[h] || '') !== (postSec[h] || '')) {\n        findings.push(f('C-20.1', 'error', `mechanical '${op}' promotion '${e.key}' changed body section '${h}'; a mechanical writer touches only the Session Log`,\n          ['revert the body change outside the Session Log']));\n      }\n    }\n    // Files touched: subset of the mechanical envelope.\n    const touched = Array.isArray(man2.files) ? man2.files.map(x => x.name) : [];\n    for (const name of touched) {\n      const ok = name === 'bundle.md' || name.startsWith('snapshots/') || MECHANICAL_APPEND_FILES.includes(name);\n      if (!ok) {\n        findings.push(f('C-20.1', 'error', `mechanical '${op}' promotion '${e.key}' wrote '${name}', outside the mechanical envelope (bundle.md, snapshots/, ${MECHANICAL_APPEND_FILES.join(', ')})`,\n          ['revert the out-of-envelope write']));\n      }\n    }\n  }\n}\n\nconst EMPTY_STRING_SHA = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';\n\n// ---------------------------------------------------------------------------\n// Release-signature primitives (D2.1). Ed25519 verification, SSHSIG parsing,\n// and allowed_signers parsing, for the C-18.8 release check.\n//\n// Why these are hand-written here rather than called from a platform API:\n// the gate runs from ONE source in three environments (node, the browser,\n// and the Apps Script embed), and Apps Script has no Ed25519 anywhere. Its\n// entire cryptographic surface is Utilities.computeDigest,\n// computeHmacSha256Signature, and computeRsaSha256Signature, the last of\n// which signs rather than verifies. createSha256 above is the precedent and\n// the template, including its battery discipline.\n//\n// Why NO BigInt: field arithmetic here uses Float64Array limbs, not BigInt,\n// deliberately. BigInt is ES2020 and Apps Script's V8 nominally supports\n// modern ECMAScript, but its BigInt behavior has been reported unreliable in\n// that environment and we could not confirm it. A verifier that silently\n// misbehaves in one runtime is worse than no verifier, because it converts a\n// refusal into a false assurance. Float64Array with 16-bit limbs is the\n// portable, long-proven representation and depends on nothing past ES5.\n//\n// SHA-512 is INJECTED, never implemented: it exists natively everywhere the\n// gate runs (node crypto, WebCrypto, and Utilities.DigestAlgorithm.SHA_512),\n// so porting it would add risk for no gain. Same pattern as ctx.sha256.\n// ---------------------------------------------------------------------------\n\nconst D2 = new Float64Array([\n  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,\n  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406\n]);\nconst DD = new Float64Array([\n  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,\n  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203\n]);\nconst GF0 = new Float64Array(16);\nconst GF1 = (() => { const g = new Float64Array(16); g[0] = 1; return g; })();\nconst I25 = new Float64Array([\n  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,\n  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83\n]);\n/** The curve base point, as (X, Y). */\nconst BX = new Float64Array([\n  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,\n  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169\n]);\nconst BY = new Float64Array([\n  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,\n  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666\n]);\n/** The group order L, little-endian bytes. */\nconst ORDER_L = new Float64Array([\n  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7,\n  0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0x10\n]);\n\nfunction gf(init) {\n  const r = new Float64Array(16);\n  if (init) for (let i = 0; i < init.length; i++) r[i] = init[i];\n  return r;\n}\nfunction fAdd(o, a, b) { for (let i = 0; i < 16; i++) o[i] = a[i] + b[i]; }\nfunction fSub(o, a, b) { for (let i = 0; i < 16; i++) o[i] = a[i] - b[i]; }\nfunction car25519(o) {\n  let c = 1, v;\n  for (let i = 0; i < 16; i++) {\n    v = o[i] + c + 65535;\n    c = Math.floor(v / 65536);\n    o[i] = v - c * 65536;\n  }\n  o[0] += c - 1 + 37 * (c - 1);\n}\nfunction fMul(o, a, b) {\n  const t = new Float64Array(31);\n  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) t[i + j] += a[i] * b[j];\n  for (let i = 0; i < 15; i++) t[i] += 38 * t[i + 16];\n  for (let i = 0; i < 16; i++) o[i] = t[i];\n  car25519(o); car25519(o);\n}\nfunction fSq(o, a) { fMul(o, a, a); }\nfunction sel25519(p, q, b) {\n  const c = ~(b - 1);\n  for (let i = 0; i < 16; i++) { const t = c & (p[i] ^ q[i]); p[i] ^= t; q[i] ^= t; }\n}\nfunction pack25519(o, n) {\n  const m = gf(), t = gf();\n  for (let i = 0; i < 16; i++) t[i] = n[i];\n  car25519(t); car25519(t); car25519(t);\n  for (let j = 0; j < 2; j++) {\n    m[0] = t[0] - 0xffed;\n    for (let i = 1; i < 15; i++) {\n      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1);\n      m[i - 1] &= 0xffff;\n    }\n    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1);\n    const b = (m[15] >> 16) & 1;\n    m[14] &= 0xffff;\n    sel25519(t, m, 1 - b);\n  }\n  for (let i = 0; i < 16; i++) {\n    o[2 * i] = t[i] & 0xff;\n    o[2 * i + 1] = t[i] >> 8;\n  }\n}\nfunction neq25519(a, b) {\n  const c = new Uint8Array(32), d = new Uint8Array(32);\n  pack25519(c, a); pack25519(d, b);\n  let diff = 0;\n  for (let i = 0; i < 32; i++) diff |= c[i] ^ d[i];\n  return (1 & ((diff - 1) >>> 8)) - 1;   // 0 when equal\n}\nfunction par25519(a) { const d = new Uint8Array(32); pack25519(d, a); return d[0] & 1; }\nfunction unpack25519(o, n) {\n  for (let i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);\n  o[15] &= 0x7fff;\n}\nfunction inv25519(o, i) {\n  const c = gf();\n  for (let a = 0; a < 16; a++) c[a] = i[a];\n  for (let a = 253; a >= 0; a--) { fSq(c, c); if (a !== 2 && a !== 4) fMul(c, c, i); }\n  for (let a = 0; a < 16; a++) o[a] = c[a];\n}\nfunction pow2523(o, i) {\n  const c = gf();\n  for (let a = 0; a < 16; a++) c[a] = i[a];\n  for (let a = 250; a >= 0; a--) { fSq(c, c); if (a !== 1) fMul(c, c, i); }\n  for (let a = 0; a < 16; a++) o[a] = c[a];\n}\n/** Extended twisted Edwards point addition, p and q as [X, Y, Z, T]. */\nfunction edAdd(p, q) {\n  const a = gf(), b = gf(), c = gf(), d = gf(), e = gf(),\n        f = gf(), g = gf(), h = gf(), t = gf();\n  fSub(a, p[1], p[0]); fSub(t, q[1], q[0]); fMul(a, a, t);\n  fAdd(b, p[0], p[1]); fAdd(t, q[0], q[1]); fMul(b, b, t);\n  fMul(c, p[3], q[3]); fMul(c, c, D2);\n  fMul(d, p[2], q[2]); fAdd(d, d, d);\n  fSub(e, b, a); fSub(f, d, c); fAdd(g, d, c); fAdd(h, b, a);\n  fMul(p[0], e, f); fMul(p[1], h, g); fMul(p[2], g, f); fMul(p[3], e, h);\n}\nfunction cswap(p, q, b) { for (let i = 0; i < 4; i++) sel25519(p[i], q[i], b); }\nfunction scalarmult(p, q, s) {\n  for (let i = 0; i < 16; i++) { p[0][i] = GF0[i]; p[1][i] = GF1[i]; p[2][i] = GF1[i]; p[3][i] = GF0[i]; }\n  for (let i = 255; i >= 0; --i) {\n    const b = (s[(i / 8) | 0] >> (i & 7)) & 1;\n    cswap(p, q, b); edAdd(q, p); edAdd(p, p); cswap(p, q, b);\n  }\n}\nfunction scalarbase(p, s) {\n  const q = [gf(), gf(), gf(), gf()];\n  for (let i = 0; i < 16; i++) { q[0][i] = BX[i]; q[1][i] = BY[i]; q[2][i] = GF1[i]; }\n  fMul(q[3], BX, BY);\n  scalarmult(p, q, s);\n}\n/** Decompress a packed public key to -P (the negated point verify needs). */\nfunction unpackneg(r, p) {\n  const t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();\n  for (let i = 0; i < 16; i++) { r[2][i] = GF1[i]; }\n  unpack25519(r[1], p);\n  fSq(num, r[1]); fMul(den, num, DD);\n  fSub(num, num, r[2]); fAdd(den, r[2], den);\n  fSq(den2, den); fSq(den4, den2); fMul(den6, den4, den2);\n  fMul(t, den6, num); fMul(t, t, den);\n  pow2523(t, t);\n  fMul(t, t, num); fMul(t, t, den); fMul(t, t, den); fMul(r[0], t, den);\n  fSq(chk, r[0]); fMul(chk, chk, den);\n  if (neq25519(chk, num)) fMul(r[0], r[0], I25);\n  fSq(chk, r[0]); fMul(chk, chk, den);\n  if (neq25519(chk, num)) return -1;\n  if (par25519(r[0]) === (p[31] >> 7)) fSub(r[0], GF0, r[0]);\n  fMul(r[3], r[0], r[1]);\n  return 0;\n}\nfunction modL(r, x) {\n  let carry;\n  for (let i = 63; i >= 32; --i) {\n    carry = 0;\n    let j = i - 32;\n    for (; j < i - 12; ++j) {\n      x[j] += carry - 16 * x[i] * ORDER_L[j - (i - 32)];\n      carry = Math.floor((x[j] + 128) / 256);\n      x[j] -= carry * 256;\n    }\n    x[j] += carry;\n    x[i] = 0;\n  }\n  carry = 0;\n  for (let j = 0; j < 32; j++) {\n    x[j] += carry - (x[31] >> 4) * ORDER_L[j];\n    carry = x[j] >> 8;\n    x[j] &= 255;\n  }\n  for (let j = 0; j < 32; j++) x[j] -= carry * ORDER_L[j];\n  for (let i = 0; i < 32; i++) { x[i + 1] += x[i] >> 8; r[i] = x[i] & 255; }\n}\nfunction reduce(r) {\n  const x = new Float64Array(64);\n  for (let i = 0; i < 64; i++) x[i] = r[i];\n  for (let i = 0; i < 64; i++) r[i] = 0;\n  modL(r, x);\n}\n\n/**\n * Verify an Ed25519 signature (RFC 8032, verify only; no signing primitive\n * exists in this module and none should, since nothing in the store ever\n * signs server-side).\n * @param {Uint8Array} sig 64 bytes\n * @param {Uint8Array} msg the signed message\n * @param {Uint8Array} pub 32 bytes\n * @param {(b: Uint8Array) => Promise<Uint8Array>} sha512 injected, see header\n * @returns {Promise<boolean>}\n */\nexport async function ed25519Verify(sig, msg, pub, sha512) {\n  if (!(sig && sig.length === 64) || !(pub && pub.length === 32)) return false;\n  const p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];\n  if (unpackneg(q, pub)) return false;\n  // Reject a non-canonical scalar S (signature malleability): S must be\n  // strictly less than the group order L, compared big-endian from the top.\n  for (let i = 31; i >= 0; i--) {\n    if (sig[32 + i] > ORDER_L[i]) return false;\n    if (sig[32 + i] < ORDER_L[i]) break;\n    if (i === 0) return false;                 // S === L exactly\n  }\n  const pre = new Uint8Array(64 + msg.length);\n  pre.set(sig.subarray(0, 32), 0);\n  pre.set(pub, 32);\n  pre.set(msg, 64);\n  const h = await sha512(pre);\n  const k = new Uint8Array(64);\n  k.set(h);\n  reduce(k);\n  scalarmult(p, q, k);\n  const s = new Uint8Array(32);\n  s.set(sig.subarray(32, 64));\n  const t = [gf(), gf(), gf(), gf()];\n  scalarbase(t, s);\n  edAdd(p, t);\n  const packed = new Uint8Array(32);\n  packEdwards(packed, p);\n  let diff = 0;\n  for (let i = 0; i < 32; i++) diff |= packed[i] ^ sig[i];\n  return diff === 0;\n}\nfunction packEdwards(r, p) {\n  const tx = gf(), ty = gf(), zi = gf();\n  inv25519(zi, p[2]);\n  fMul(tx, p[0], zi); fMul(ty, p[1], zi);\n  pack25519(r, ty);\n  r[31] ^= par25519(tx) << 7;\n}\n\n// --------------------------------------------------------------- SSHSIG ---\n\nfunction be32(b, o) { return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }\n\n/** Read an ssh string (uint32 length then bytes). */\nfunction sshStr(b, o) {\n  if (o + 4 > b.length) throw new Error('sshsig: truncated length prefix');\n  const n = be32(b, o);\n  if (o + 4 + n > b.length) throw new Error('sshsig: string overruns buffer');\n  return [b.subarray(o + 4, o + 4 + n), o + 4 + n];\n}\nfunction encStr(bytes) {\n  const out = new Uint8Array(4 + bytes.length);\n  out[0] = (bytes.length >>> 24) & 0xff; out[1] = (bytes.length >>> 16) & 0xff;\n  out[2] = (bytes.length >>> 8) & 0xff;  out[3] = bytes.length & 0xff;\n  out.set(bytes, 4);\n  return out;\n}\nfunction ascii(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; }\n\nconst SSHSIG_BEGIN = '-----BEGIN SSH SIGNATURE-----';\nconst SSHSIG_END = '-----END SSH SIGNATURE-----';\n\n/**\n * Parse an armored SSHSIG blob (OpenSSH PROTOCOL.sshsig).\n * Returns {keyType, publicKey, namespace, reserved, hashAlgorithm, sigType,\n * signature}. Throws on any structural defect; the caller treats a throw as\n * a refusal, never as a skip.\n */\nexport function parseSshSig(armored) {\n  const text = String(armored || '').trim();\n  const lines = text.split(/\\r?\\n/).map(l => l.trim()).filter(l => l !== '');\n  if (lines.length < 3 || lines[0] !== SSHSIG_BEGIN || lines[lines.length - 1] !== SSHSIG_END) {\n    throw new Error('sshsig: missing or malformed PEM armor');\n  }\n  const b64 = lines.slice(1, -1).join('');\n  const blob = b64ToBytes(b64);\n  if (blob.length < 10) throw new Error('sshsig: blob too short');\n  if (ascii(blob.subarray(0, 6)) !== 'SSHSIG') throw new Error('sshsig: bad magic preamble');\n  let o = 6;\n  const version = be32(blob, o); o += 4;\n  if (version !== 1) throw new Error('sshsig: unsupported version ' + version);\n  let pkField, nsField, rsvField, haField, sigField;\n  [pkField, o] = sshStr(blob, o);\n  [nsField, o] = sshStr(blob, o);\n  [rsvField, o] = sshStr(blob, o);\n  [haField, o] = sshStr(blob, o);\n  [sigField, o] = sshStr(blob, o);\n  if (o !== blob.length) throw new Error('sshsig: trailing bytes after signature field');\n  let kt, publicKey, p = 0;\n  [kt, p] = sshStr(pkField, 0);\n  [publicKey] = sshStr(pkField, p);\n  let st, signature; p = 0;\n  [st, p] = sshStr(sigField, 0);\n  [signature] = sshStr(sigField, p);\n  return {\n    keyType: ascii(kt), publicKey,\n    namespace: ascii(nsField), reserved: rsvField,\n    hashAlgorithm: ascii(haField),\n    sigType: ascii(st), signature\n  };\n}\n\n/**\n * The exact byte sequence ssh-keygen signs:\n *   \"SSHSIG\" || string(namespace) || string(reserved)\n *            || string(hash_algorithm) || string(H(message))\n * Confirmed byte-for-byte against real ssh-keygen output before this was\n * written, not inferred from the spec alone.\n */\nexport function sshsigSignedBlob(namespace, reserved, hashAlgorithm, messageHash) {\n  const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff; return u; };\n  const parts = [enc('SSHSIG'), encStr(enc(namespace)), encStr(reserved),\n                 encStr(enc(hashAlgorithm)), encStr(messageHash)];\n  let n = 0; for (const p of parts) n += p.length;\n  const out = new Uint8Array(n);\n  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }\n  return out;\n}\n\n// ------------------------------------------------------- allowed_signers ---\n\nconst SIGNER_TS_RE = /^(\\d{4})(\\d{2})(\\d{2})(?:(\\d{2})(\\d{2})(?:(\\d{2}))?)?Z?$/;\n\n/** OpenSSH validity timestamps: YYYYMMDD[HHMM[SS]] with an optional Z. */\nexport function parseSignerTimestamp(v) {\n  const m = SIGNER_TS_RE.exec(String(v || '').replace(/^\"|\"$/g, ''));\n  if (!m) return null;\n  return `${m[1]}-${m[2]}-${m[3]}T${m[4] || '00'}:${m[5] || '00'}:${m[6] || '00'}Z`;\n}\n\n/**\n * Parse an OpenSSH allowed_signers file. Unknown options are preserved and\n * ignored rather than treated as errors, so a file OpenSSH accepts is never\n * refused here for carrying an option this check does not consult.\n */\nexport function parseAllowedSigners(text) {\n  const entries = [];\n  const lines = String(text || '').split(/\\r?\\n/);\n  for (let i = 0; i < lines.length; i++) {\n    const line = lines[i].trim();\n    if (line === '' || line.charAt(0) === '#') continue;\n    const toks = line.split(/\\s+/);\n    if (toks.length < 3) { entries.push({ line: i + 1, error: 'too few fields' }); continue; }\n    const principals = toks[0].split(',').filter(Boolean);\n    let ki = 1;\n    const options = {};\n    while (ki < toks.length && !/^(ssh-|ecdsa-|sk-)/.test(toks[ki])) {\n      const t = toks[ki];\n      const eq = t.indexOf('=');\n      if (eq === -1) options[t.toLowerCase()] = true;\n      else options[t.slice(0, eq).toLowerCase()] = t.slice(eq + 1).replace(/^\"|\"$/g, '');\n      ki++;\n    }\n    if (ki + 1 >= toks.length) { entries.push({ line: i + 1, error: 'no key found' }); continue; }\n    const keyType = toks[ki];\n    const keyB64 = toks[ki + 1];\n    const comment = toks.slice(ki + 2).join(' ');\n    let keyBytes = null, err = null;\n    try {\n      const blob = b64ToBytes(keyB64);\n      let t2, p = 0;\n      [t2, p] = sshStr(blob, 0);\n      if (ascii(t2) !== keyType) throw new Error('key type mismatch inside blob');\n      [keyBytes] = sshStr(blob, p);\n    } catch (e) { err = 'unparsable key: ' + (e && e.message); }\n    entries.push({\n      line: i + 1, principals, options, keyType, keyB64, comment,\n      keyBytes, error: err,\n      validAfter: options['valid-after'] ? parseSignerTimestamp(options['valid-after']) : null,\n      validBefore: options['valid-before'] ? parseSignerTimestamp(options['valid-before']) : null\n    });\n  }\n  return entries;\n}\n\n/** Keys admitted for a principal at an instant, honoring valid-after/before. */\nexport function signerKeysAt(entries, principal, atIso) {\n  const out = [];\n  for (const e of entries) {\n    if (e.error || !e.principals) continue;\n    if (e.principals.indexOf(principal) === -1) continue;\n    if (e.validAfter && atIso < e.validAfter) continue;\n    if (e.validBefore && atIso >= e.validBefore) continue;\n    out.push(e);\n  }\n  return out;\n}\n\n/**\n * The composite the check calls: parse, resolve the principal against the\n * registry at the transition instant, and verify. Returns a structured\n * verdict rather than a boolean so findings can say WHY.\n */\nexport async function verifyReleaseSignature(opts) {\n  const { armored, message, signersText, namespace, at, sha512 } = opts;\n  let sig;\n  try { sig = parseSshSig(armored); }\n  catch (e) { return { ok: false, reason: 'unparsable', detail: e && e.message }; }\n  if (sig.keyType !== 'ssh-ed25519' || sig.sigType !== 'ssh-ed25519') {\n    return { ok: false, reason: 'unsupported_key_type', detail: sig.keyType };\n  }\n  if (sig.namespace !== namespace) {\n    return { ok: false, reason: 'namespace_mismatch', detail: sig.namespace };\n  }\n  if (sig.hashAlgorithm !== 'sha512') {\n    return { ok: false, reason: 'unsupported_hash', detail: sig.hashAlgorithm };\n  }\n  const entries = parseAllowedSigners(signersText);\n  const candidates = signerKeysAt(entries, opts.principal, at);\n  if (candidates.length === 0) {\n    return { ok: false, reason: 'no_valid_key_for_principal', detail: opts.principal };\n  }\n  let matched = null;\n  for (const c of candidates) {\n    if (!c.keyBytes || c.keyBytes.length !== sig.publicKey.length) continue;\n    let same = true;\n    for (let i = 0; i < c.keyBytes.length; i++) if (c.keyBytes[i] !== sig.publicKey[i]) { same = false; break; }\n    if (same) { matched = c; break; }\n  }\n  if (!matched) return { ok: false, reason: 'key_not_registered_for_principal', detail: opts.principal };\n  const mh = await sha512(message);\n  const signed = sshsigSignedBlob(sig.namespace, sig.reserved, sig.hashAlgorithm, mh);\n  const good = await ed25519Verify(sig.signature, signed, sig.publicKey, sha512);\n  return good ? { ok: true, principal: opts.principal, line: matched.line }\n              : { ok: false, reason: 'bad_signature' };\n}\n\n\n// ---------------------------------------------------------------------------\n// C-18.8: the enforced release signature (D2.3; design Section 5.3).\n//\n// C-18.7 stages the posture as a warning; this is the enforced form, split\n// into its own check id rather than a tightening of C-18.7 so that findings\n// distinguish \"not yet required\" from \"required and missing\", and so\n// C-18.7's message stays accurate for pre-migration material.\n//\n// The registry arrives by INJECTION (input.releaseRegistry), following the\n// resolveTarget precedent exactly: a single-bundle check context needing one\n// fact from the rest of the store. checks.js therefore carries no\n// store-specific knowledge; the registry bundle id is configuration at each\n// of the three call sites.\n//\n// Fail-closed is the rule throughout. A registry that cannot prove itself is\n// treated as ABSENT, and an absent registry with a post-migration release is\n// an error naming the gap, never a silent skip. A verifier that passes when\n// it cannot check is worse than no verifier.\n// ---------------------------------------------------------------------------\n\n/** The exact message a release signature covers (design 5.1). Built from\n *  canonicalJson, which is already exported and battery-proven, so the\n *  signer and the verifier cannot disagree about key order or spacing. */\nexport function releaseMessage(fields) {\n  return canonicalJson({\n    v: 'bio-release/1',\n    bundle: fields.bundle,\n    transition: fields.transition,\n    from_state: fields.from_state,\n    to_state: fields.to_state,\n    signer: fields.signer,\n    bundle_md_sha256: fields.bundle_md_sha256,\n    registry_sha256: fields.registry_sha256\n  });\n}\n\n/** Accept a pinned root key in either form an operator will plausibly paste:\n *  the full public-key line (`ssh-ed25519 AAAA... comment`) or the bare\n *  base64 body. Tolerance is deliberate. The bare form is the natural thing\n *  to copy out of a fingerprint listing, and without this it fails as\n *  `no_valid_key_for_principal`, which reads as a registry problem rather\n *  than a configuration typo, on a value that is only exercised once the\n *  root fence is enforced and every release depends on it. */\nexport function normalizeRootKey(k) {\n  const v = String(k || '').trim();\n  if (v === '') return v;\n  if (/^(ssh-|ecdsa-|sk-)/.test(v)) return v;\n  return 'ssh-ed25519 ' + v.split(/\\s+/)[0];\n}\n\n/** Verify the registry against its own root before trusting any principal in\n *  it (design 3.4.5). Returns {trusted, reason}. The root public keys come\n *  from the CALL SITE, never from the registry bundle: pinning them inside\n *  the artifact they protect would let an adversary swap key and signature\n *  together and pass every check, which is ceremony rather than security. */\nexport async function verifyRegistryRoot(reg, sha512) {\n  if (!reg) return { trusted: false, reason: 'registry_absent' };\n  const enforce = reg.rootEnforceFrom || null;\n  if (!reg.rootSignature) {\n    return enforce ? { trusted: false, reason: 'root_signature_missing' }\n                   : { trusted: true, reason: 'root_not_enforced' };\n  }\n  const keys = Array.isArray(reg.rootKeys) ? reg.rootKeys : [];\n  if (keys.length === 0) {\n    return enforce ? { trusted: false, reason: 'no_pinned_root_keys' }\n                   : { trusted: true, reason: 'root_not_enforced' };\n  }\n  const signersText = keys.map(k => `operator ${normalizeRootKey(k)}`).join('\\n');\n  const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff; return u; };\n  const r = await verifyReleaseSignature({\n    armored: reg.rootSignature, message: enc(reg.signers), signersText,\n    namespace: reg.rootNamespace || 'bio-registry', principal: 'operator',\n    at: enforce || '9999-12-31T23:59:59Z', sha512\n  });\n  if (r.ok) return { trusted: true, reason: 'root_verified' };\n  return enforce ? { trusted: false, reason: 'root_signature_invalid:' + r.reason }\n                 : { trusted: true, reason: 'root_invalid_but_not_enforced:' + r.reason };\n}\n\nasync function checkReleaseSignature(ctx, findings) {\n  if (ctx.fm?.object_type !== 'information') return;\n\n  // Hoisted above the schema branch on purpose. An unreadable registry must\n  // refuse at EVERY schema; routing it through a pre-contract early return\n  // would turn \"cannot check\" into \"passed\", which is the one outcome this\n  // check exists to prevent.\n  const regAny = ctx.releaseRegistry || null;\n  if (regAny && regAny.unavailable) {\n    findings.push(f('C-18.8', 'error', `the key registry is declared present but unreadable at this call site (${regAny.reason || 'no reason given'}); the gate cannot check signatures and will not pass them`,\n      ['restore access to the registry bundle', 'do not promote until the registry reads']));\n    return;\n  }\n\n  // Pre-contract schemas have no mandatory intake register, so there is\n  // nowhere to record a signature and nothing here can check one. While the\n  // fence is OFF that silence is honest: those bundles are pre-migration\n  // material and C-18.7 stages the posture for @2.\n  //\n  // Once the fence is ON, silence becomes a lie. An information@1 bundle would\n  // walk collected -> verified with no signature, no error, and not even a\n  // warning, while the operator believes signatures are mandatory store-wide.\n  // Measured 2026-07-22: 26 of 28 information bundles in the store were @1, so\n  // setting the instant would have enforced signatures on two of them and\n  // waved through the rest in silence. A fence that quietly passes most of what\n  // it fences is worse than no fence, because it stops anyone looking.\n  //\n  // So: at any schema below @2, a post-instant ratification is refused, and the\n  // refusal names the real repair rather than pretending a signature could have\n  // been recorded.\n  if (ctx.fm?.schema !== 'information@2') {\n    const migration0 = regAny && regAny.migrationInstant ? regAny.migrationInstant : null;\n    if (!migration0) return;\n    const hist0 = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];\n    const post0 = hist0.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified'\n      && e.timestamp && e.timestamp >= migration0);\n    for (const e of post0) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} is at or after the migration instant ${migration0}, but this bundle is ${ctx.fm.schema || 'a pre-contract schema'}: the signed release register exists only at information@2, so this ratification cannot carry a signature the gate can check`,\n        ['migrate the bundle to information@2, then sign the transition and add the releases[] entry',\n         'return the bundle to collected pending a signed ratification']));\n    }\n    return;\n  }\n\n  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];\n  const releases = hist.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified');\n  if (releases.length === 0) return;\n\n  const reg = ctx.releaseRegistry || null;\n\n  // The fence lives IN the registry, so with no registry the gate cannot\n  // know whether a release is post-migration. That makes the absent case a\n  // contract question rather than a computation, and the contract is\n  // explicit: supplying nothing ASSERTS the pre-migration world, which is\n  // the only honest reading while no registry bundle exists in the store.\n  // A call site that CAN see a registry bundle but cannot read it must say\n  // so with {unavailable: true} rather than omitting the argument, because\n  // silently omitting it would turn an unreadable registry into a pass.\n  const migration = reg && reg.migrationInstant ? reg.migrationInstant : null;\n  const post = releases.filter(e => migration && e.timestamp >= migration);\n  // Pre-migration releases are C-18.7's business and stay there, even if a\n  // signature is present: the registry may not have held that key then, and\n  // verifying against today's registry would be a different claim.\n  if (post.length === 0) return;\n  const root = await verifyRegistryRoot(reg, ctx.sha512);\n  if (!root.trusted) {\n    findings.push(f('C-18.8', 'error', `the key registry does not prove itself (${root.reason}); it is treated as absent, so no principal in it resolves`,\n      ['restore the registry root signature', 'sign the registry with a pinned root key', 'clear root.enforce_from only with a recorded reason']));\n    return;\n  }\n\n  const rawReg = ctx.files.get('data/provenance.json');\n  let rels = [];\n  if (rawReg) { try { const p = JSON.parse(asText(rawReg)); rels = Array.isArray(p.releases) ? p.releases : []; } catch { /* C-14.3 */ } }\n  const bundleMd = ctx.files.get('bundle.md');\n  const bundleSha = bundleMd ? await ctx.sha256(bundleMd) : null;\n\n  for (const e of post) {\n    const rec = rels.find(r => r && r.transition === e.timestamp);\n    if (!rec || !rec.signature_file) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} is at or after the migration instant ${migration} and carries no signed release record`,\n        ['sign the transition and add the releases[] entry', 'return the bundle to collected pending a signed ratification']));\n      continue;\n    }\n    const author = String(e.author || '');\n    if (String(rec.signer || '') !== author) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp}: signer '${rec.signer}' does not equal transition author '${author}'`,\n        ['record the release under one identity']));\n      continue;\n    }\n    if (NON_MEMBER_AUTHORS.includes(author.toLowerCase())) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} is authored by '${author}', a surface or AI identity, never a release author`));\n      continue;\n    }\n    const wantNs = reg.namespace || 'bio-release';\n    if (rec.namespace !== wantNs) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp}: namespace '${rec.namespace}' is not the registry namespace '${wantNs}'`));\n      continue;\n    }\n    const armored = ctx.files.get(String(rec.signature_file));\n    if (armored == null) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp}: signature file '${rec.signature_file}' holds no bytes at the gate`));\n      continue;\n    }\n    if (rec.registry_sha256 && reg.sha256 && rec.registry_sha256 !== reg.sha256) {\n      findings.push(f('C-18.8', 'warn', `release at ${e.timestamp} records registry ${String(rec.registry_sha256).slice(0, 12)}\u2026 but the registry in force is ${String(reg.sha256).slice(0, 12)}\u2026; the usual cause is signing against a stale mirror`,\n        ['re-verify against the recorded registry version out of the registry bundle history']));\n    }\n    const msg = releaseMessage({\n      bundle: ctx.folderName, transition: e.timestamp,\n      from_state: e.from_state, to_state: e.to_state, signer: rec.signer,\n      bundle_md_sha256: bundleSha, registry_sha256: rec.registry_sha256 || reg.sha256\n    });\n    const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff; return u; };\n    const v = await verifyReleaseSignature({\n      armored: asText(armored), message: enc(msg), signersText: reg.signers,\n      namespace: wantNs, principal: rec.signer, at: e.timestamp, sha512: ctx.sha512\n    });\n    if (!v.ok) {\n      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} does not verify (${v.reason}) for signer '${rec.signer}'`,\n        ['re-sign the transition over the exact released bundle.md', 'confirm the signer key is registered and valid at the transition instant']));\n    }\n  }\n}\n\n// ---------------------------------------------------------------------------\n// Runner\n// ---------------------------------------------------------------------------\n\n/**\n * Run all applicable checks over one bundle.\n * @param {BundleInput} input\n * @param {{knownSchemas?: string[]}} [opts]\n * @returns {Promise<{pass: boolean, findings: Finding[]}>}\n */\nexport async function checkBundle(input, opts = {}) {\n  /** @type {Finding[]} */\n  const findings = [];\n  const bundleRaw = input.files.get('bundle.md');\n  const ctx = {\n    folderName: input.folderName,\n    files: input.files,\n    // 1.13.0 (three-tier read model): paths known to exist in the\n    // authoritative store but whose bytes the caller deliberately did not\n    // carry (a tier-scoped client mirror eliding snapshots/ and _history/).\n    // Presence assertions (\"this registered path must exist\") consult\n    // files UNION elided via hasFile_; byte checks (hashing, parsing,\n    // history audits) stay files-only and skip elided content exactly as\n    // they skip absent content, so nothing is ever verified against bytes\n    // the caller does not hold. The gate and cli pass nothing here and are\n    // byte-complete as before.\n    elided: input.elidedPaths instanceof Set ? input.elidedPaths\n      : new Set(Array.isArray(input.elidedPaths) ? input.elidedPaths : []),\n    sha256: input.sha256,\n    nowMs: input.nowMs,\n    maxPackageAgeDays: input.maxPackageAgeDays ?? 14,\n    maxReevalAgeDays: input.maxReevalAgeDays ?? 30,\n    knownSchemas: opts.knownSchemas ?? ['information@1', 'information@2', 'problem@1', 'project@1', 'action@1'],\n    resolveTarget: input.resolveTarget,\n    // D2.3: the key registry, injected exactly like resolveTarget. Absent\n    // is legal and means pre-migration behavior; absent WITH a\n    // post-migration release is an error, never a skip.\n    releaseRegistry: input.releaseRegistry || null,\n    sha512: input.sha512 || null,\n    fm: null,\n    body: ''\n  };\n\n  if (!bundleRaw) {\n    findings.push(f('C-13.1', 'error', 'bundle.md is missing'));\n  } else {\n    const parsed = parseFrontmatter(asText(bundleRaw));\n    findings.push(...parsed.findings);\n    ctx.fm = parsed.data;\n    ctx.body = parsed.body;\n    checkIdentity(ctx, findings);\n    checkFrontmatterContract(ctx, findings);\n    checkHeadings(ctx, findings);\n    checkStateLegality(ctx, findings);\n    checkWriteCompleteness(ctx, findings);\n    await checkInformationExtension(ctx, findings);\n    checkReleaseAuthority(ctx, findings);\n    checkRegisterIntegrity(ctx, findings);\n    await checkInfo2Contract(ctx, findings);\n    await checkReleaseSignature(ctx, findings);\n    checkGatheringGrammar(ctx, findings);\n    await checkMechanicalConformance(ctx, findings);\n    checkReferences(ctx, findings);\n    checkRecheckCoverage(ctx, findings);\n    checkProblemExtension(ctx, findings);\n    checkProjectExtension(ctx, findings);\n    checkActionExtension(ctx, findings);\n    checkCitationRegister(ctx, findings);\n    checkDeletionRecords(ctx, findings);\n    checkAppendOnly(ctx, findings);\n    checkHistoryCoherence(ctx, findings);\n  }\n  checkFormatHygiene(ctx, findings);\n  await checkQueueAndBase(ctx, findings);\n\n  const pass = !findings.some(x => x.severity === 'error');\n  return { pass, findings };\n}\n";
// === BIO_CHECKS_EMBED END ===

var bioChecksCache_ = null;

/** Compile the embedded checks module once per execution; hash-verified. */
function bioChecksModule_() {
  if (bioChecksCache_) return bioChecksCache_;
  if (typeof BIO_CHECKS_SOURCE !== 'string') throw new Error('embedded gate absent: run assemble.py embed-gate and redeploy');
  if (sha256Hex_(BIO_CHECKS_SOURCE) !== BIO_CHECKS_SHA256) {
    throw new Error('embedded gate integrity failure: source hash != ' + BIO_CHECKS_SHA256.slice(0, 12));
  }
  var stripped = BIO_CHECKS_SOURCE
    .replace(/^export\s+/gm, '')
    .replace(/\basync function\b/g, 'function')
    .replace(/\bawait\s+/g, '');
  var exportsObj = {};
  (new Function('__exports',
    '"use strict";\n' + stripped + '\n' +
    '__exports.checkBundle = checkBundle;\n' +
    '__exports.canonicalJson = canonicalJson;\n' +
    '__exports.parseFrontmatter = parseFrontmatter;\n' +
    '__exports.NON_MEMBER_AUTHORS = NON_MEMBER_AUTHORS;\n' +
    '__exports.BUNDLE_ID_RE = BUNDLE_ID_RE;\n' +
    '__exports.isPublicHttpsLocator = isPublicHttpsLocator;\n' +
    '__exports.b64ToBytes = b64ToBytes;\n' +
    '__exports.createSha256 = createSha256;\n' +
    '__exports.MECHANICAL_FIELD_SETS = MECHANICAL_FIELD_SETS;\n' +
    '__exports.ed25519Verify = ed25519Verify;\n' +
    '__exports.parseSshSig = parseSshSig;\n' +
    '__exports.parseAllowedSigners = parseAllowedSigners;\n' +
    '__exports.signerKeysAt = signerKeysAt;\n' +
    '__exports.verifyReleaseSignature = verifyReleaseSignature;\n'))(exportsObj);
  bioChecksCache_ = exportsObj;
  return bioChecksCache_;
}


/** SHA-512 over bytes or a string. Native here; injected into the gate. */
function sha512Bytes_(b) {
  var d = (typeof b === 'string')
    ? Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, b, Utilities.Charset.UTF_8)
    : Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, b);
  var out = [];
  for (var i = 0; i < d.length; i++) out.push(d[i] < 0 ? d[i] + 256 : d[i]);
  return out;
}

/** The release key registry, read from the store for injection into the gate
    (D2.3, design 5.4). The registry bundle id is CONFIGURATION here, not a
    constant in checks.js, so the check code carries no store knowledge.
    Root public keys come from Script Properties, never from the registry
    bundle: pinning them inside the artifact they protect would let anyone
    who can edit it swap key and signature together. */
var RELEASE_REGISTRY_PROP = 'RELEASE_REGISTRY_BUNDLE';
function releaseRegistry_() {
  // Guarded so the cores stay drivable outside Apps Script. The conformance
  // harness runs them under node vm with no Drive and no Properties, and a
  // gate that throws there would be untestable exactly where it is tested
  // most. Absent services read as "no registry", which is the pre-migration
  // assertion, not a pass on a checkable release.
  if (typeof PropertiesService === 'undefined' || typeof DriveApp === 'undefined') return null;
  var props = props_();
  var id = props.getProperty(RELEASE_REGISTRY_PROP);
  if (!id) return null;                      // asserts the pre-migration world
  try {
    var store = DriveApp.getFolderById(props.getProperty('STORE_FOLDER_ID'));
    var folder = findBundleFolder_(store, id);
    if (!folder) return { unavailable: true, reason: 'registry bundle ' + id + ' not found in the store' };
    var cfgF = null, sgnF = null, sigF = null;
    var dit = folder.getFoldersByName('data');
    if (dit.hasNext()) { var fi = dit.next().getFilesByName('registry.json'); if (fi.hasNext()) cfgF = fi.next(); }
    var sit = folder.getFoldersByName('snapshots');
    if (sit.hasNext()) {
      var sf = sit.next();
      var a = sf.getFilesByName('allowed_signers.txt'); if (a.hasNext()) sgnF = a.next();
      var b = sf.getFilesByName('allowed_signers.sig'); if (b.hasNext()) sigF = b.next();
    }
    if (!cfgF || !sgnF) return { unavailable: true, reason: 'registry bundle is missing registry.json or allowed_signers.txt' };
    var cfg = JSON.parse(cfgF.getBlob().getDataAsString());
    var signers = sgnF.getBlob().getDataAsString();
    var keys = [];
    for (var n = 1; n <= 8; n++) {
      var k = props.getProperty('BIO_ROOT_KEY_' + n);
      if (k) keys.push(k.replace(/^\s+|\s+$/g, ''));
    }
    return {
      signers: signers,
      namespace: cfg.namespace || 'bio-release',
      migrationInstant: cfg.migration_instant || null,
      sha256: sha256Hex_(signers),
      rootSignature: sigF ? sigF.getBlob().getDataAsString() : null,
      rootKeys: keys,
      rootNamespace: (cfg.root && cfg.root.namespace) || 'bio-registry',
      rootEnforceFrom: (cfg.root && cfg.root.enforce_from) || null
    };
  } catch (err) {
    return { unavailable: true, reason: 'registry read failed: ' + (err && err.message) };
  }
}

/** Run the gate over an in-memory bundle image. filesObj: plain object of
    relativePath -> string content (the Map is built in-realm so the check
    module and its inputs share one realm under node vm and V8 alike).
    opts: { nowMs, maxPackageAgeDays, maxReevalAgeDays, resolveTarget,
    knownSchemas }. Returns { pass, findings }, synchronous by construction
    (the de-async transform plus this synchronous sha256). */
function gateCheckBundle_(folderName, filesObj, opts) {
  opts = opts || {};
  var m = bioChecksModule_();
  var files = new Map();
  var names = Object.keys(filesObj).sort();
  for (var i = 0; i < names.length; i++) files.set(names[i], filesObj[names[i]]);
  var input = {
    folderName: folderName,
    files: files,
    sha256: function (s) { return sha256Hex_(s); },
    nowMs: opts.nowMs,
    maxPackageAgeDays: opts.maxPackageAgeDays,
    maxReevalAgeDays: opts.maxReevalAgeDays,
    resolveTarget: opts.resolveTarget,
    // D2.3: SHA-512 is injected, never implemented. It exists natively here
    // (Utilities.DigestAlgorithm.SHA_512) exactly as it does in node and the
    // browser, so porting it would add risk for no gain.
    sha512: function (b) { return sha512Bytes_(b); },
    // D2.3: the key registry, read from the store before gating. Absent
    // asserts the pre-migration world; present-but-unreadable says so
    // explicitly, because silently omitting it would turn an unreadable
    // registry into a pass.
    releaseRegistry: opts.releaseRegistry !== undefined ? opts.releaseRegistry : releaseRegistry_()
  };
  return m.checkBundle(input, opts.knownSchemas ? { knownSchemas: opts.knownSchemas } : {});
}

/** Store-scope reference resolver over the Drive read adapter (slate Section
    0: store-scope checks receive a Drive-backed resolver server-side). */
function driveResolveTarget_(rfsa) {
  return function (id) {
    try { return rfsa.listFiles(id) !== null; } catch (e) { return false; }
  };
}

/* ---- M2' daemon (ratified slate: monitor-tick, sweep, deadline-recheck) ----
   Three operations under the mechanical-writer fence (slate Section 0): fixed
   byte templates over hash-verified existing state, closed per-operation field
   sets plus append-only surfaces, set-but-never-clear on cascade flags, every
   package gated at production by the embedded gate before a byte is written,
   creation only at collected and only for named requests present in store
   state, promotion through the same convergent promoter as every other write.
   Pure adapter-driven cores in the promoteBundleCore_ pattern: node-testable
   through the conformance harness's vm technique with stub adapters.

   INTERRUPTION MODEL (operator-reported, Alpha Pipeline lesson). An Apps
   Script execution can be terminated by the platform mid-routine: an
   infrastructure failure, a wall-clock timeout, or a hard quota stop kills the
   V8 context outright. This is NOT a thrown exception, so no catch runs and no
   finally runs. The daemon therefore never relies on end-of-routine cleanup
   for correctness; it relies on DURABLE SEQUENCING, so a later run reads the
   leftovers of an interrupted run and recognizes them:

     1. Manifest-last. deliverPackage_ writes every .pending file first and
        PENDING_PROMOTION.json strictly last. A folder with .pending files and
        NO manifest is the signature of a run killed mid-package; a folder with
        a manifest is a complete package the queue will promote. An interrupted
        CREATION (bundle.md.pending, no live bundle.md, no manifest) is
        completed on the next tick by completeInterruptedCreation_ (the
        manifest is reconstructed from the surviving .pending files), never
        duplicated under a fresh id.
     2. Cascade before change. When a monitored source changes, the citing
        bundles' reeval_pending packages are written BEFORE the changed
        bundle's own capture-record package. The capture record is what makes a
        later tick see hash-equal and short-circuit, so recording it last means
        an interrupted run always re-detects the change and re-runs the cascade
        (set-but-never-clear makes the re-run idempotent). Recording the change
        first would let an interruption between the two writes lose the cascade
        permanently.
     3. Self-expiring claims, not finally-released locks. The promoter's
        PROMOTING-<actor>.json claim carries a timestamp and is treated as
        abandoned past CLAIM_STALE_MS (C-16.5 also surfaces it); a killed run
        leaves a claim that ages out rather than a lock that never releases.
        LockService script locks (appendLog_) are execution-scoped: the
        platform releases them when the execution ends for ANY reason, kill
        included, so their finally is belt-and-suspenders, never the guarantee.
     4. The pending queue is the durable handoff. Packaging (this file's write
        phase) and promotion (sweepQueue_) are separate; every package written
        to the queue promotes eventually through the trigger's queue sweep,
        whether or not this invocation reaches its own promotion loop.
     5. The advisory memo is regenerable. DAEMON_MEMO fences fetch frequency
        only; absent means due, and a killed run at worst delays a retry. */


var EMPTY_SHA_ = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
var DAEMON_ACTOR_ = 'daemon';
var CADENCE_SECONDS_ = { hourly: 3600, daily: 86400, weekly: 604800, monthly: 2592000 };
var REMOVAL_WINDOW_MS_ = 72 * 3600 * 1000; // confirmation window before source_status: removed
var RETRY_MEMO_MS_ = 3600 * 1000;          // advisory refetch fence for uncaptured requests

/* Closed per-operation field sets: the canonical table lives in checks.js as
   MECHANICAL_FIELD_SETS (the registry) and rides the embedded gate; this
   reference exists only for any .gs-local use and is asserted equal to the
   module's table by the conformance harness. One codebase. */
function daemonFieldSets_() { return bioChecksModule_().MECHANICAL_FIELD_SETS; }

/** https-only, public hosts only (doctrine 0.7). Delegates to the one
    canonical implementation in the embedded checks module: one codebase. */
function isPublicHttpsLocator_(url) {
  return bioChecksModule_().isPublicHttpsLocator(url);
}

/* ---- Fixed byte templates: surgical frontmatter and body edits.
   Line-level replacement over existing structure; a missing line is a
   refusal, never an invention. Pure. ---- */

function fmRange_(lines) {
  if (lines[0] !== '---') return null;
  for (var i = 1; i < lines.length; i++) if (lines[i] === '---') return { start: 1, end: i };
  return null;
}

function renderFmValue_(v) {
  if (v === null) return 'null';
  if (v === true || v === false) return String(v);
  if (typeof v === 'number') return String(v);
  return JSON.stringify(String(v));
}

/** Replace a top-level scalar frontmatter line. Returns new text or null. */
function surgicalSetTop_(text, key, value) {
  var lines = text.split('\n');
  var r = fmRange_(lines);
  if (!r) return null;
  var re = new RegExp('^' + key + ':');
  for (var i = r.start; i < r.end; i++) {
    if (re.test(lines[i])) { lines[i] = key + ': ' + renderFmValue_(value); return lines.join('\n'); }
  }
  return null;
}

/** Replace a 2-space child scalar inside a top-level map block. */
function surgicalSetChild_(text, parent, child, value) {
  var lines = text.split('\n');
  var r = fmRange_(lines);
  if (!r) return null;
  var inBlock = false;
  for (var i = r.start; i < r.end; i++) {
    if (lines[i] === parent + ':') { inBlock = true; continue; }
    if (inBlock && /^[A-Za-z_]/.test(lines[i])) inBlock = false;
    if (inBlock && new RegExp('^  ' + child + ':').test(lines[i])) {
      lines[i] = '  ' + child + ': ' + renderFmValue_(value);
      return lines.join('\n');
    }
  }
  return null;
}

/** Flip clock[].status pending -> overdue for entries with date < today.
    The only legal mutation of deadline-recheck. Returns {text, flipped[]} */
function surgicalFlipOverdueClocks_(text, today) {
  var lines = text.split('\n');
  var r = fmRange_(lines);
  if (!r) return { text: text, flipped: [] };
  var inClock = false, itemDate = null, itemText = '', statusLine = -1;
  var flipped = [];
  function closeItem() {
    if (itemDate && itemDate < today && statusLine !== -1 && /^ {4}status: pending$/.test(lines[statusLine])) {
      lines[statusLine] = '    status: overdue';
      flipped.push({ text: itemText, date: itemDate });
    }
    itemDate = null; itemText = ''; statusLine = -1;
  }
  for (var i = r.start; i < r.end; i++) {
    var line = lines[i];
    if (line === 'clock:') { inClock = true; continue; }
    if (inClock && /^[A-Za-z_]/.test(line)) { closeItem(); inClock = false; }
    if (!inClock) continue;
    if (/^ {2}- /.test(line)) {
      closeItem();
      var tm = /^ {2}- text: (.*)$/.exec(line);
      if (tm) itemText = tm[1].replace(/^"|"$/g, '');
    } else {
      var dm = /^ {4}date: "?(\d{4}-\d{2}-\d{2})"?$/.exec(line);
      if (dm) itemDate = dm[1];
      if (/^ {4}status: /.test(line)) statusLine = i;
    }
  }
  closeItem();
  return { text: lines.join('\n'), flipped: flipped };
}

/** Append one Session Log entry at the end of the Session Log section. */
function appendSessionLog_(text, dateStr, title, actor, bodyLines) {
  var heading = '\n## Session Log';
  var idx = text.indexOf(heading);
  if (idx === -1) return null;
  var sectionStart = idx + heading.length;
  var next = text.indexOf('\n## ', sectionStart);
  var insertAt = next === -1 ? text.length : next;
  var entry = '\n### Session ' + dateStr + ' | ' + title + ' | ' + actor + '\n' + bodyLines.join('\n') + '\n';
  return text.slice(0, insertAt).replace(/\s+$/, '\n') + entry + text.slice(insertAt);
}

/* ---- Standing intent and capture index (pure reads over the store) ---- */

function tryReadJson_(rfsa, bundleId, path) {
  try { var t = rfsa.readText(bundleId, path); return t === null ? null : JSON.parse(t); }
  catch (e) { return null; }
}
function tryReadText_(rfsa, bundleId, path) {
  try { return rfsa.readText(bundleId, path); } catch (e) { return null; }
}

/* M2'' hardening (fail-closed indexing, live-fired 2026-07-19): a transient
   read failure during index construction is NOT absence. The silent-catch
   helpers above made the two indistinguishable, which degraded the dedup
   guards (byRequest, byHash) into no-ops and let a trigger tick re-create a
   byte-identical capture (INFO-2026-0102). These counting variants record
   genuine failures (throws, corrupt JSON) while treating a null read (the
   adapter's missing-file signal) and a 'missing'-shaped throw (the node stub
   convention) as ordinary absence. */
function readTextCounting_(rfsa, bundleId, path, failures) {
  try { return rfsa.readText(bundleId, path); }
  catch (e) {
    if (/missing/i.test(String((e && e.message) || e))) return null;
    failures.push(bundleId + ':' + path);
    return null;
  }
}
function readJsonCounting_(rfsa, bundleId, path, failures) {
  var t = readTextCounting_(rfsa, bundleId, path, failures);
  if (t === null) return null;
  try { return JSON.parse(t); }
  catch (e) { failures.push(bundleId + ':' + path + ' (unparsable)'); return null; }
}

/** The daemon's policy and every named request and sweep record in store
    state. The daemon block of the lexicographically first Information bundle
    carrying one governs (single standing-intent bundle today; a deterministic
    rule regardless). Absent block = disabled: the positive form. */
function readStandingIntentCore_(rfsa) {
  var roots = rfsa.listBundles();
  var infos = (roots.information || []).slice().sort();
  var policy = null, requests = [], sweeps = [];
  for (var i = 0; i < infos.length; i++) {
    var g = tryReadJson_(rfsa, infos[i], 'data/gathering.json');
    if (!g) continue;
    if (g.daemon && policy === null) policy = g.daemon;
    var rs = Array.isArray(g.requests) ? g.requests : [];
    for (var j = 0; j < rs.length; j++) requests.push({ req: rs[j], host: infos[i] });
    var ss = Array.isArray(g.sweeps) ? g.sweeps : [];
    for (var k = 0; k < ss.length; k++) sweeps.push({ sweep: ss[k], host: infos[i] });
  }
  return {
    policy: policy || { enabled: false, tick_budget: 0, sweep_budget: 0 },
    requests: requests, sweeps: sweeps
  };
}

/** Index of existing intake: which requests are captured, which raw hashes
    exist where (the ring-once dedup base), and which bundles are monitored. */
function captureIndexCore_(rfsa, checks) {
  var roots = rfsa.listBundles();
  var infos = (roots.information || []).slice().sort();
  var byRequest = {}, byHash = {}, monitored = [], groups = {};
  var readFailures = [];
  for (var i = 0; i < infos.length; i++) {
    var id = infos[i];
    var reg = readJsonCounting_(rfsa, id, 'data/provenance.json', readFailures);
    if (reg && Array.isArray(reg.documents)) {
      for (var d = 0; d < reg.documents.length; d++) {
        var doc = reg.documents[d];
        if (doc && doc.origin && doc.origin.kind === 'named_request' && doc.origin.request) {
          byRequest[doc.origin.request] = { bundle: id, index: d };
        }
        var h = doc && doc.capture && doc.capture.sha256;
        if (h) {
          if (!byHash[h]) byHash[h] = [];
          byHash[h].push({ bundle: id, index: d, file: doc.file, locator: doc.locator });
        }
      }
    }
    var raw = readTextCounting_(rfsa, id, 'bundle.md', readFailures);
    if (raw === null) continue;
    var fm = checks.parseFrontmatter(raw).data;
    if (!fm) continue;
    if (fm.group) groups[id] = fm.group;
    var mon = fm.monitoring;
    if (mon && mon.enabled === true && CADENCE_SECONDS_[mon.frequency]) {
      monitored.push({ id: id, fm: fm, hasRegister: !!(reg && Array.isArray(reg.documents)) });
    }
  }
  return { byRequest: byRequest, byHash: byHash, monitored: monitored, infoIds: infos, groups: groups, readFailures: readFailures };
}

/** Deterministic creation naming: racing ticks compute the same id and
    converge through the promoter. */
function allocateInfoId_(existingIds, year, slug) {
  var max = 0;
  for (var i = 0; i < existingIds.length; i++) {
    var m = new RegExp('^INFO-' + year + '-(\\d{4})-').exec(existingIds[i]);
    if (m) { var n = parseInt(m[1], 10); if (n > max) max = n; }
  }
  var seq = String(max + 1);
  while (seq.length < 4) seq = '0' + seq;
  return 'INFO-' + year + '-' + seq + '-' + slug;
}

function captureExtension_(contentType) {
  var ct = String(contentType || '').toLowerCase();
  if (ct.indexOf('application/pdf') !== -1) return { ext: 'pdf', binary: true };
  if (ct.indexOf('text/html') !== -1) return { ext: 'html', binary: false };
  if (ct.indexOf('application/json') !== -1) return { ext: 'json', binary: false };
  if (ct.indexOf('text/') !== -1) return { ext: 'txt', binary: false };
  return { ext: 'bin', binary: true };
}

/* ---- Package assembly and delivery (files first, manifest strictly last;
   the embedded gate runs over the post-promotion image before any write) ---- */

function deliverPackage_(env, bundleId, baseHash, filesObj, results, opName, encodings) {
  encodings = encodings || {};
  var image = {};
  // post-promotion image: live files overlaid with the package content.
  // Transport-encoded entries (0.11.0) enter the image decoded, because the
  // image models what promotion will write: true bytes at rest.
  var live = null;
  try { live = env.rfsa.listFiles(bundleId); } catch (e) { live = null; }
  if (live && live.files) {
    for (var i = 0; i < live.files.length; i++) {
      var p = live.files[i].path;
      if (!isTextStorePath_(p) && typeof env.rfsa.readBytes === 'function') {
        try { var bb = env.rfsa.readBytes(bundleId, p); if (bb !== null) image[p] = bb; } catch (eb) { /* absent from the image */ }
      } else {
        var t = tryReadText_(env.rfsa, bundleId, p);
        if (t !== null) image[p] = t;
      }
    }
  }
  var names = Object.keys(filesObj).sort();
  for (var j = 0; j < names.length; j++) {
    var nm = names[j];
    image[nm] = encodings[nm] === 'base64' ? env.checks.b64ToBytes(filesObj[nm]) : filesObj[nm];
  }
  var verdict = env.gate(bundleId, image);
  if (!verdict.pass) {
    var errs = [];
    for (var k = 0; k < verdict.findings.length; k++) if (verdict.findings[k].severity === 'error') errs.push(verdict.findings[k].check);
    results.push({ bundle: bundleId, op: opName, status: 'gate_failed', findings: errs.join(',') });
    return false;
  }
  var w = env.ensureBundleWriter(bundleId);
  var manifestFiles = [];
  for (var n = 0; n < names.length; n++) {
    w.writeText(names[n] + '.pending', filesObj[names[n]]);
    var mf = { name: names[n], sha256: env.sha256Text(filesObj[names[n]]) };
    if (encodings[names[n]] === 'base64') mf.encoding = 'base64';
    manifestFiles.push(mf);
  }
  var manifest = {
    target: bundleId, base: baseHash, files: manifestFiles,
    created: env.nowIso(), author: DAEMON_ACTOR_, skill_version: GS_VERSION,
    writer: 'mechanical', operation: opName
  };
  w.writeText('PENDING_PROMOTION.json', JSON.stringify(manifest, null, 2));
  results.push({ bundle: bundleId, op: opName, status: 'packaged', files: names.length });
  return true;
}

/* ---- Co-attestation record shaping (slate Section 4): best-effort,
   recorded-if-absent, never blocks, never lies. ---- */

function attestCapture_(env, locator, rawHashHex, filesObj, captureName, encs) {
  var attempts = [];
  var entry = {};
  var spn = null, tsa = null;
  try { spn = env.attest.spn(locator); } catch (e) { spn = { attempted: true, ok: false, note: 'spn threw: ' + e }; }
  if (spn) {
    attempts.push({ service: 'save-page-now', attempted: true, mode: spn.mode || 'anonymous', ok: !!spn.ok, note: spn.note || '' });
    if (spn.ok && spn.archive_locator) entry.co_archive = spn.archive_locator;
  }
  try { tsa = env.attest.tsa(rawHashHex); } catch (e) { tsa = { attempted: true, ok: false, note: 'tsa threw: ' + e }; }
  if (tsa) {
    attempts.push({ service: 'rfc3161', attempted: true, authority: tsa.authority || '', ok: !!tsa.ok, note: tsa.note || '' });
    if (tsa.ok && tsa.token_b64) {
      // Binary-at-rest (0.11.0): the token stores as true DER bytes; base64
      // rides the transport only, declared in encs for the manifest.
      var tokenFile = captureName + '.tsr';
      filesObj['snapshots/' + tokenFile] = tsa.token_b64;
      if (encs) encs['snapshots/' + tokenFile] = 'base64';
      entry.timestamp = { authority: tsa.authority, token_file: 'snapshots/' + tokenFile, encoding: 'binary' };
      if (tsa.caveat) entry.timestamp.caveat = tsa.caveat;
    }
  }
  entry.attestation_attempts = attempts;
  return entry;
}

/* ---- Daemon execution claim (M2'' hardening): concurrent tick or sweep
   executions can double-create for dynamic-content locators (live-fired
   2026-07-19: the R&E page landed twice from an overlapping doorbell and
   trigger). A self-expiring claim serializes creation-capable operations:
   the promoter's claim pattern, per interruption model rule 3 (a killed
   holder leaves a timestamp that ages out, never a lock that never
   releases). The acquire itself is guarded by a brief LockService critical
   section so two executions cannot both read-empty-then-write. ---- */

var DAEMON_CLAIM_KEY_ = 'tick-claim';
var DAEMON_CLAIM_STALE_MS_ = 7 * 60 * 1000; // > the 6-minute execution wall

/** Pure claim arithmetic over a kv memo. Returns true if this execution now
    holds the claim, false if a fresh claim belongs to another execution. */
function acquireDaemonClaim_(memo, nowMs) {
  var held = memo.get(DAEMON_CLAIM_KEY_);
  if (held && nowMs - Date.parse(held) < DAEMON_CLAIM_STALE_MS_) return false;
  memo.set(DAEMON_CLAIM_KEY_, new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, 'Z'));
  return true;
}
function releaseDaemonClaim_(memo) {
  try { memo.set(DAEMON_CLAIM_KEY_, ''); } catch (e) { /* self-expires regardless */ }
}

/* ---- Interrupted-creation recovery (the manifest-last interruption marker) ---- */

/** Scan for creation packages left incomplete by an interrupted run: a folder
    with bundle.md.pending but no live bundle.md. Maps the named request the
    pending intake register carries to the folder id and whether the manifest
    was reached (hasManifest true means complete-but-unpromoted; the queue owns
    it). Pure over the read adapter. */
function inflightCreationsCore_(rfsa) {
  var roots = rfsa.listBundles();
  var infos = roots.information || [];
  var byRequest = {};
  for (var i = 0; i < infos.length; i++) {
    var id = infos[i];
    if (tryReadText_(rfsa, id, 'bundle.md') !== null) continue;          // promoted already
    if (tryReadText_(rfsa, id, 'bundle.md.pending') === null) continue;  // not a creation in flight
    var reg = tryReadJson_(rfsa, id, 'data/provenance.json.pending');
    var request = null;
    if (reg && Array.isArray(reg.documents)) {
      for (var d = 0; d < reg.documents.length; d++) {
        var o = reg.documents[d] && reg.documents[d].origin;
        if (o && o.kind === 'named_request' && o.request) { request = o.request; break; }
      }
    }
    if (!request) continue;
    byRequest[request] = { id: id, hasManifest: tryReadText_(rfsa, id, 'PENDING_PROMOTION.json') !== null };
  }
  return byRequest;
}

/** Complete an interrupted creation by reconstructing its manifest from the
    surviving .pending files (manifest-last recovery). The content the killed
    run already wrote is authoritative; we gate the reconstructed image and, if
    it passes, write the one missing file (PENDING_PROMOTION.json) so the queue
    promotes exactly what the interrupted run intended, at the same id. No
    re-fetch, no duplicate. A gate failure leaves the orphan for C-16.4. */
function completeInterruptedCreation_(env, id, out) {
  var listing = null;
  try { listing = env.rfsa.listFiles(id); } catch (e) { listing = null; }
  if (!listing || !listing.files) { out.results.push({ bundle: id, op: 'monitor-tick', status: 'resume_failed', note: 'cannot list interrupted folder' }); return false; }
  var image = {}, manifestFiles = [];
  for (var i = 0; i < listing.files.length; i++) {
    var p = listing.files[i].path;
    if (p.slice(-8) !== '.pending' || p === 'PENDING_PROMOTION.json') continue;
    var livePath = p.slice(0, -8);
    var content = tryReadText_(env.rfsa, id, p);
    if (content === null) continue;
    image[livePath] = content;
    manifestFiles.push({ name: livePath, sha256: env.sha256Text(content) });
  }
  if (!image['bundle.md']) { out.results.push({ bundle: id, op: 'monitor-tick', status: 'resume_failed', note: 'interrupted folder has no bundle.md.pending' }); return false; }
  var verdict = env.gate(id, image);
  if (!verdict.pass) {
    var errs = [];
    for (var k = 0; k < verdict.findings.length; k++) if (verdict.findings[k].severity === 'error') errs.push(verdict.findings[k].check);
    out.results.push({ bundle: id, op: 'monitor-tick', status: 'resume_gate_failed', note: 'interrupted content does not gate; left orphaned for C-16.4', findings: errs.join(',') });
    return false;
  }
  var w = env.ensureBundleWriter(id);
  var manifest = {
    target: id, base: EMPTY_SHA_, files: manifestFiles,
    created: env.nowIso(), author: DAEMON_ACTOR_, skill_version: GS_VERSION,
    writer: 'mechanical', operation: 'monitor-tick'
  };
  w.writeText('PENDING_PROMOTION.json', JSON.stringify(manifest, null, 2));
  out.results.push({ bundle: id, op: 'monitor-tick', status: 'resumed', note: 'completed an interrupted creation package (manifest-last recovery); same id, no duplicate' });
  out.packaged.push(id);
  return true;
}

/* ---- monitor-tick core ---- */

function monitorTickCore_(env, onlyBundle) {
  var out = { op: 'tick', version: GS_VERSION, results: [], fetches: 0, packaged: [] };
  var intent = readStandingIntentCore_(env.rfsa);
  if (!intent.policy.enabled) { out.status = 'noop'; out.note = 'daemon disabled by store policy'; return out; }
  var budget = intent.policy.tick_budget | 0;
  var idx = captureIndexCore_(env.rfsa, env.checks);
  var nowIso = env.nowIso();
  var nowMs = Date.parse(nowIso);
  var today = nowIso.slice(0, 10);
  var year = nowIso.slice(0, 4);
  var pendingCreates = idx.infoIds.slice();

  function fetchOne(url) {
    out.fetches++;
    try { return env.fetchRaw(url); } catch (e) { return { ok: false, code: 0, note: String(e) }; }
  }

  // 0. Manifest-last recovery. Complete any creation package an interrupted
  //    prior run left without its manifest, at the same id, before the request
  //    loop can mistake the request for uncaptured and duplicate it.
  var inflight = inflightCreationsCore_(env.rfsa);
  for (var ic in inflight) {
    if (onlyBundle && inflight[ic].id !== onlyBundle) continue;
    if (!inflight[ic].hasManifest) completeInterruptedCreation_(env, inflight[ic].id, out);
  }

  // 1. Named requests not yet captured: first capture creates at collected.
  //    FAIL-CLOSED (M2''): a degraded index (any register or bundle.md read
  //    failed) means the dedup guards are unreliable, so NO creations this
  //    tick; the due condition persists and a later healthy tick captures.
  var indexDegraded = idx.readFailures.length > 0;
  if (indexDegraded) {
    out.results.push({ status: 'index_degraded', note: idx.readFailures.length + ' index read(s) failed (' + idx.readFailures.slice(0, 3).join('; ') + (idx.readFailures.length > 3 ? '; …' : '') + '): creations fail closed this tick' });
  }
  for (var r = 0; r < intent.requests.length; r++) {
    var item = intent.requests[r];
    var req = item.req;
    if (!req || req.status !== 'open' || !req.id) continue;
    if (idx.byRequest[req.id]) continue; // captured; monitoring path owns it now
    if (inflight[req.id]) {              // in flight or just resumed: never duplicate
      if (inflight[req.id].hasManifest) out.results.push({ request: req.id, status: 'in_flight', note: 'complete creation package from an interrupted run awaits promotion' });
      continue;
    }
    if (onlyBundle) continue;            // selector narrows to existing bundles
    if (indexDegraded) continue;         // fail closed: no creations on a degraded index
    if (out.fetches >= budget) { out.results.push({ request: req.id, status: 'skipped', note: 'tick budget exhausted' }); continue; }
    var memoKey = 'gath:' + req.id;
    var lastTry = env.memo.get(memoKey);
    if (lastTry && nowMs - Date.parse(lastTry) < RETRY_MEMO_MS_) { out.results.push({ request: req.id, status: 'not_due', note: 'retry fence (advisory memo)' }); continue; }
    var locs = Array.isArray(req.locators) ? req.locators : [];
    var got = null, usedLocator = null, attempts = [];
    for (var L = 0; L < locs.length && !got; L++) {
      if (!isPublicHttpsLocator_(locs[L])) { attempts.push({ locator: locs[L], note: 'refused: not an https public-host locator' }); continue; }
      if (out.fetches >= budget) { attempts.push({ locator: locs[L], note: 'budget exhausted' }); break; }
      var resp = fetchOne(locs[L]);
      if (resp && resp.ok) { got = resp; usedLocator = locs[L]; }
      else attempts.push({ locator: locs[L], code: resp ? resp.code : 0, note: resp && resp.note ? resp.note : 'fetch failed' });
    }
    env.memo.set(memoKey, nowIso);
    if (!got) { out.results.push({ request: req.id, status: 'fetch_failed', attempts: attempts }); continue; }

    var rawHash = got.binaryHash || (got.bytes ? env.sha256Bytes(got.bytes) : env.sha256Text(got.text || ''));
    // Ring-once dedup: a capture whose hash matches an existing capture
    // anywhere is corroboration on the existing entry, never a new item.
    if (idx.byHash[rawHash] && idx.byHash[rawHash].length) {
      corroborate_(env, idx.byHash[rawHash][0], usedLocator, req.id, nowIso, out);
      continue;
    }
    var ext = captureExtension_(got.contentType);
    var slug = req.id.replace(/^GATH-\d{4}-\d{4}-/, '');
    var newId = allocateInfoId_(pendingCreates, year, slug);
    pendingCreates.push(newId);
    var captureName = 'capture-' + today + '-' + slug.slice(0, 40) + '.' + ext.ext;
    var content = ext.binary ? env.b64(got.bytes) : (got.text !== undefined ? got.text : env.b64(got.bytes));
    var group = idx.groups[item.host] || 'believe-in-oakland';
    var freq = CADENCE_SECONDS_[req.cadence] ? req.cadence : 'monthly';
    var crit = (req.criticality === 'crucial' || req.criticality === 'supporting') ? req.criticality : 'supporting';
    var filesObj = {};
    var encs = {};
    filesObj['snapshots/' + captureName] = content;
    if (ext.binary || got.text === undefined) encs['snapshots/' + captureName] = 'base64';
    var regEntry = {
      file: 'snapshots/' + captureName,
      locator: usedLocator,
      authority: req.authority || 'unknown',
      retrieved: nowIso,
      capture: { method: 'daemon-fetch', grade: 'B', actor_class: 'daemon', sha256: rawHash, encoding: ext.binary ? 'binary' : 'utf8' },
      origin: { kind: 'named_request', request: req.id }
    };
    var att = attestCapture_(env, usedLocator, rawHash, filesObj, captureName, encs);
    for (var ak in att) regEntry[ak] = att[ak];
    filesObj['data/provenance.json'] = JSON.stringify({ documents: [regEntry] }, null, 2);
    filesObj['bundle.md'] = creationBundleMd_(newId, req, usedLocator, rawHash, group, freq, crit, nowIso);
    deliverPackage_(env, newId, EMPTY_SHA_, filesObj, out.results, 'monitor-tick', encs);
    if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(newId);
  }

  // 2. Monitored bundles due by frequency vs last_checked (register-carrying
  //    bundles only: mechanical change detection needs a recorded baseline).
  for (var m = 0; m < idx.monitored.length; m++) {
    var mb = idx.monitored[m];
    if (onlyBundle && mb.id !== onlyBundle) continue;
    if (!mb.hasRegister) { if (onlyBundle) out.results.push({ bundle: mb.id, status: 'skipped', note: 'no intake register: no mechanical baseline (session-side monitoring)' }); continue; }
    var mon = mb.fm.monitoring || {};
    var period = (CADENCE_SECONDS_[mon.frequency] || 0) * 1000;
    var lastChecked = Date.parse(mon.last_checked || '') || 0;
    if (period === 0 || nowMs - lastChecked < period) continue;
    var fence = env.memo.get('mon:' + mb.id);
    if (fence && nowMs - Date.parse(fence) < Math.min(period, RETRY_MEMO_MS_)) continue;
    if (out.fetches >= budget) { out.results.push({ bundle: mb.id, status: 'skipped', note: 'tick budget exhausted' }); continue; }
    var locator = mb.fm.source && mb.fm.source.locator;
    if (!isPublicHttpsLocator_(locator)) { out.results.push({ bundle: mb.id, status: 'skipped', note: 'source locator is not an https public-host locator' }); continue; }
    var mresp = fetchOne(locator);
    env.memo.set('mon:' + mb.id, nowIso);
    var reg2 = tryReadJson_(env.rfsa, mb.id, 'data/provenance.json') || { documents: [] };
    if (!mresp || !mresp.ok) {
      handleFetchFailure_(env, mb, mresp, nowIso, nowMs, out);
      continue;
    }
    env.memo.set('miss:' + mb.id, ''); // source reachable again: reset removal window
    var mHash = mresp.binaryHash || (mresp.bytes ? env.sha256Bytes(mresp.bytes) : env.sha256Text(mresp.text || ''));
    var priorHash = latestCaptureHash_(reg2, locator);
    if (priorHash && mHash === priorHash) {
      out.results.push({ bundle: mb.id, status: 'unchanged', note: 'hash-equal short circuit: nothing written' });
      continue;
    }
    // Cascade BEFORE the change record (interruption model, ordering rule 2):
    // the citing bundles' reeval_pending packages are written first, so if this
    // run is killed before the change record lands, the next tick re-detects
    // the change (its capture is not yet recorded, so no hash-equal short
    // circuit) and re-runs the cascade, which is idempotent (set-but-never-
    // clear). Recording the change first would risk losing the cascade for good.
    cascadeReeval_(env, mb.id, nowIso, today, out, idx);
    changePackage_(env, mb, reg2, mresp, mHash, locator, nowIso, today, out);
  }

  out.status = 'ok';
  return out;
}

function latestCaptureHash_(reg, locator) {
  var docs = Array.isArray(reg.documents) ? reg.documents : [];
  var best = null, bestTs = '';
  for (var i = 0; i < docs.length; i++) {
    var d = docs[i];
    if (!d || !d.capture || !d.capture.sha256) continue;
    if (d.locator !== locator) continue;
    var ts = String(d.retrieved || '');
    if (ts >= bestTs) { bestTs = ts; best = d.capture.sha256; }
  }
  if (best) return best;
  for (var j = docs.length - 1; j >= 0; j--) {
    if (docs[j] && docs[j].capture && docs[j].capture.sha256) return docs[j].capture.sha256;
  }
  return null;
}

function handleFetchFailure_(env, mb, resp, nowIso, nowMs, out) {
  var code = resp ? resp.code : 0;
  if (code === 404 || code === 410) {
    var first = env.memo.get('miss:' + mb.id);
    if (!first) {
      env.memo.set('miss:' + mb.id, nowIso);
      out.results.push({ bundle: mb.id, status: 'source_missing', note: 'first ' + code + '; confirmation window open, last_checked unrefreshed' });
      return;
    }
    if (nowMs - Date.parse(first) >= REMOVAL_WINDOW_MS_) {
      removalPackage_(env, mb, nowIso, out);
      return;
    }
    out.results.push({ bundle: mb.id, status: 'source_missing', note: code + ' inside confirmation window since ' + first });
    return;
  }
  out.results.push({ bundle: mb.id, status: 'fetch_failed', code: code, note: (resp && resp.note) || 'failure recorded; due condition persists' });
}

function corroborate_(env, hit, locator, requestId, nowIso, out) {
  var reg = tryReadJson_(env.rfsa, hit.bundle, 'data/provenance.json');
  if (!reg || !Array.isArray(reg.documents) || !reg.documents[hit.index]) {
    out.results.push({ bundle: hit.bundle, status: 'corroboration_failed', note: 'register entry vanished' });
    return;
  }
  var entry = reg.documents[hit.index];
  var corr = Array.isArray(entry.corroborations) ? entry.corroborations : [];
  for (var i = 0; i < corr.length; i++) {
    if (corr[i] && corr[i].locator === locator && corr[i].request === requestId) {
      out.results.push({ bundle: hit.bundle, status: 'corroborated_already', note: 'idempotent: corroboration already recorded' });
      return;
    }
  }
  corr.push({ locator: locator, request: requestId, retrieved: nowIso, actor_class: 'daemon' });
  entry.corroborations = corr;
  var live = tryReadText_(env.rfsa, hit.bundle, 'bundle.md');
  if (live === null) { out.results.push({ bundle: hit.bundle, status: 'corroboration_failed', note: 'bundle.md unreadable' }); return; }
  var baseHash = env.sha256Text(live);
  var text = surgicalSetTop_(live, 'last_updated', nowIso);
  if (text === null) { out.results.push({ bundle: hit.bundle, status: 'corroboration_failed', note: 'last_updated line absent: refused' }); return; }
  text = appendSessionLog_(text, nowIso.slice(0, 10), 'Corroboration (daemon monitor-tick)', DAEMON_ACTOR_,
    ['Trigger: named gathering request ' + requestId,
     'Changes: hash-matched capture recorded as corroboration on the existing register entry (ring-once rule); no new review item.']);
  if (text === null) { out.results.push({ bundle: hit.bundle, status: 'corroboration_failed', note: 'Session Log heading absent: refused' }); return; }
  var filesObj = { 'bundle.md': text, 'data/provenance.json': JSON.stringify(reg, null, 2) };
  deliverPackage_(env, hit.bundle, baseHash, filesObj, out.results, 'monitor-tick');
  if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(hit.bundle);
}

function changePackage_(env, mb, reg, resp, newHash, locator, nowIso, today, out) {
  var live = tryReadText_(env.rfsa, mb.id, 'bundle.md');
  if (live === null) { out.results.push({ bundle: mb.id, status: 'change_failed', note: 'bundle.md unreadable' }); return; }
  var baseHash = env.sha256Text(live);
  var ext = captureExtension_(resp.contentType);
  var captureName = 'capture-' + today.replace(/-/g, '') + 'T' + nowIso.slice(11, 19).replace(/:/g, '') + 'Z.' + ext.ext;
  var content = ext.binary ? env.b64(resp.bytes) : (resp.text !== undefined ? resp.text : env.b64(resp.bytes));
  var filesObj = {};
  var encs = {};
  filesObj['snapshots/' + captureName] = content;
  if (ext.binary || resp.text === undefined) encs['snapshots/' + captureName] = 'base64';
  var origin = null;
  for (var i = 0; i < reg.documents.length; i++) {
    if (reg.documents[i] && reg.documents[i].origin) { origin = reg.documents[i].origin; break; }
  }
  var regEntry = {
    file: 'snapshots/' + captureName, locator: locator,
    authority: (mb.fm.source && mb.fm.source.authority) || 'unknown', retrieved: nowIso,
    capture: { method: 'daemon-fetch', grade: 'B', actor_class: 'daemon', sha256: newHash, encoding: ext.binary ? 'binary' : 'utf8' },
    origin: origin || { kind: 'named_request', request: 'unknown' }
  };
  var att = attestCapture_(env, locator, newHash, filesObj, captureName, encs);
  for (var ak in att) regEntry[ak] = att[ak];
  reg.documents.push(regEntry); // grade records are accretive adds, never replacements
  filesObj['data/provenance.json'] = JSON.stringify(reg, null, 2);
  var changes = tryReadJson_(env.rfsa, mb.id, 'data/changes.json') || { records: [] };
  if (!Array.isArray(changes.records)) changes.records = [];
  changes.records.push({ detected: nowIso, kind: 'modified', summary: 'Source content hash changed at ' + locator + '; new capture archived by monitor-tick.' });
  filesObj['data/changes.json'] = JSON.stringify(changes, null, 2);
  var text = surgicalSetTop_(live, 'source_status', 'modified');
  if (text !== null) text = surgicalSetChild_(text, 'monitoring', 'last_checked', nowIso);
  if (text !== null) text = surgicalSetTop_(text, 'last_updated', nowIso);
  if (text === null) { out.results.push({ bundle: mb.id, status: 'change_failed', note: 'required frontmatter line absent: refused (fixed template, never invention)' }); return; }
  text = appendSessionLog_(text, today, 'Source change detected (daemon monitor-tick)', DAEMON_ACTOR_,
    ['Trigger: monitoring cadence (' + ((mb.fm.monitoring && mb.fm.monitoring.frequency) || '?') + ')',
     'Changes: source_status set to modified; new capture archived to snapshots/; change record and register entry appended; co-attestation attempted; citing bundles flagged reeval_pending.']);
  if (text === null) { out.results.push({ bundle: mb.id, status: 'change_failed', note: 'Session Log heading absent: refused' }); return; }
  filesObj['bundle.md'] = text;
  deliverPackage_(env, mb.id, baseHash, filesObj, out.results, 'monitor-tick', encs);
  if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(mb.id);
}

function removalPackage_(env, mb, nowIso, out) {
  var live = tryReadText_(env.rfsa, mb.id, 'bundle.md');
  if (live === null) { out.results.push({ bundle: mb.id, status: 'removal_failed', note: 'bundle.md unreadable' }); return; }
  var baseHash = env.sha256Text(live);
  var text = surgicalSetTop_(live, 'source_status', 'removed');
  if (text !== null) text = surgicalSetChild_(text, 'monitoring', 'last_checked', nowIso);
  if (text !== null) text = surgicalSetTop_(text, 'last_updated', nowIso);
  if (text === null) { out.results.push({ bundle: mb.id, status: 'removal_failed', note: 'required frontmatter line absent: refused' }); return; }
  text = appendSessionLog_(text, nowIso.slice(0, 10), 'Source removed (daemon monitor-tick)', DAEMON_ACTOR_,
    ['Trigger: source unreachable beyond the 72h confirmation window',
     'Changes: source_status set to removed; citing bundles flagged reeval_pending; archived captures remain the evidentiary record.']);
  var changes = tryReadJson_(env.rfsa, mb.id, 'data/changes.json') || { records: [] };
  if (!Array.isArray(changes.records)) changes.records = [];
  changes.records.push({ detected: nowIso, kind: 'removed', summary: 'Source unreachable beyond the confirmation window; source_status set to removed.' });
  var filesObj = { 'bundle.md': text, 'data/changes.json': JSON.stringify(changes, null, 2) };
  deliverPackage_(env, mb.id, baseHash, filesObj, out.results, 'monitor-tick');
  if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(mb.id);
}

/** Cascade one hop out (State Rules 5.4): set reeval_pending on citing
    bundles. Set-but-never-clear: an already-true flag is untouched. */
function cascadeReeval_(env, changedId, nowIso, today, out, idx) {
  var roots = env.rfsa.listBundles();
  var all = [];
  for (var r in roots) for (var i = 0; i < roots[r].length; i++) all.push(roots[r][i]);
  all.sort();
  for (var a = 0; a < all.length; a++) {
    var id = all[a];
    if (id === changedId) continue;
    var raw = tryReadText_(env.rfsa, id, 'bundle.md');
    if (raw === null) continue;
    var fm = env.checks.parseFrontmatter(raw).data;
    if (!fm) continue;
    var refs = Array.isArray(fm.references) ? fm.references : [];
    var cites = false;
    for (var j = 0; j < refs.length; j++) {
      if (refs[j] && refs[j].rel === 'cites' && refs[j].target === changedId) cites = true;
    }
    if (!cites) continue;
    var rp = fm.reeval_pending;
    if (rp && typeof rp === 'object' && rp.flag === true) {
      out.results.push({ bundle: id, op: 'monitor-tick', status: 'cascade_noop', note: 'reeval_pending already true: set-but-never-clear' });
      continue;
    }
    var baseHash = env.sha256Text(raw);
    var text = surgicalSetChild_(raw, 'reeval_pending', 'flag', true);
    if (text !== null) text = surgicalSetChild_(text, 'reeval_pending', 'since', nowIso);
    if (text !== null) text = surgicalSetChild_(text, 'reeval_pending', 'source', 'source_status');
    if (text !== null) text = surgicalSetTop_(text, 'last_updated', nowIso);
    if (text === null) { out.results.push({ bundle: id, op: 'monitor-tick', status: 'cascade_failed', note: 'reeval_pending record lines absent: refused' }); continue; }
    text = appendSessionLog_(text, today, 'Cascade: cited source changed (daemon monitor-tick)', DAEMON_ACTOR_,
      ['Trigger: source change on cited bundle ' + changedId,
       'Changes: reeval_pending set (flag true, source source_status); re-evaluation is a session\'s judgment, never the daemon\'s.']);
    if (text === null) { out.results.push({ bundle: id, op: 'monitor-tick', status: 'cascade_failed', note: 'Session Log heading absent: refused' }); continue; }
    deliverPackage_(env, id, baseHash, { 'bundle.md': text }, out.results, 'monitor-tick');
    if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(id);
  }
}

function creationBundleMd_(id, req, locator, rawHash, group, freq, crit, nowIso) {
  var today = nowIso.slice(0, 10);
  var title = (req.target && req.target.text) || req.id;
  var desc = (req.target && req.target.description) || '';
  return [
    '---',
    'id: ' + id,
    'object_type: information',
    'schema: information@1',
    'title: ' + JSON.stringify(String(title)),
    'current_state: collected',
    'prior_state: null',
    'created: ' + JSON.stringify(nowIso),
    'last_updated: ' + JSON.stringify(nowIso),
    'produced_by:',
    '  mode: daemon',
    '  capability_tier: standard',
    'group: ' + group,
    'references: []',
    'state_history: []',
    'annotations_open: 0',
    'reeval_pending:',
    '  flag: false',
    '  since: null',
    '  source: null',
    'visuals: []',
    'criticality: ' + crit,
    'classification: fact',
    'source:',
    '  locator: ' + JSON.stringify(String(locator)),
    '  authority: ' + JSON.stringify(String(req.authority || 'unknown')),
    '  retrieved: ' + JSON.stringify(today),
    'content_hash: ' + JSON.stringify('sha256:' + rawHash),
    'source_status: unchanged',
    'monitoring:',
    '  enabled: true',
    '  frequency: ' + freq,
    '  last_checked: ' + JSON.stringify(nowIso),
    '---',
    '',
    '## Summary',
    '',
    'First capture of named gathering request ' + req.id + '. ' + desc,
    '',
    '## Provenance Notes',
    '',
    'Captured mechanically by the monitor-tick daemon from the store-named locator. The intake provenance register at data/provenance.json carries the capture record (grade B, actor class daemon, origin named_request) and every co-attestation attempt, recorded honestly. Verification is earned session-side and released by a named member (I-18).',
    '',
    '## Session Log',
    '',
    '### Session ' + today + ' | First capture (daemon monitor-tick) | ' + DAEMON_ACTOR_,
    'Trigger: named gathering request ' + req.id,
    'Changes: Bundle created at collected; capture archived to snapshots/; intake provenance register written; co-attestation attempted.',
    '',
    '## Review Notes',
    ''
  ].join('\n');
}

/* ---- sweep core (built to its admission; inert at sweep budget 0 and with
   zero ratified sweeps in store state) ---- */

function sweepDaemonCore_(env, onlySweepId) {
  var out = { op: 'sweep', version: GS_VERSION, results: [], fetches: 0, packaged: [] };
  var intent = readStandingIntentCore_(env.rfsa);
  if (!intent.policy.enabled) { out.status = 'noop'; out.note = 'daemon disabled by store policy'; return out; }
  var ratified = [];
  for (var i = 0; i < intent.sweeps.length; i++) {
    var s = intent.sweeps[i].sweep;
    if (s && s.ratified === true && s.id && (!onlySweepId || s.id === onlySweepId)) ratified.push(intent.sweeps[i]);
  }
  if (onlySweepId && ratified.length === 0) { out.status = 'noop'; out.note = 'unknown or unratified sweep id: no-op'; return out; }
  if (ratified.length === 0) { out.status = 'noop'; out.note = 'no ratified sweeps in store state: recorded no-op'; return out; }
  var budget = intent.policy.sweep_budget | 0;
  if (budget <= 0) { out.status = 'noop'; out.note = 'sweep budget 0: recorded no-op'; return out; }
  var idx = captureIndexCore_(env.rfsa, env.checks);
  if (idx.readFailures.length > 0) {
    out.status = 'deferred';
    out.note = idx.readFailures.length + ' index read(s) failed: sweep intake fails closed (dedup guards unreliable)';
    return out;
  }
  var ceiling = intent.policy.sweep_backlog_ceiling | 0 || 25;
  var backlog = 0;
  for (var b = 0; b < idx.infoIds.length; b++) {
    var reg = tryReadJson_(env.rfsa, idx.infoIds[b], 'data/provenance.json');
    var docs = reg && Array.isArray(reg.documents) ? reg.documents : [];
    var isSweep = false;
    for (var d = 0; d < docs.length; d++) if (docs[d] && docs[d].origin && docs[d].origin.kind === 'sweep') isSweep = true;
    if (!isSweep) continue;
    var raw = tryReadText_(env.rfsa, idx.infoIds[b], 'bundle.md');
    var fm = raw === null ? null : env.checks.parseFrontmatter(raw).data;
    if (fm && fm.current_state === 'collected') backlog++;
  }
  if (backlog >= ceiling) {
    out.status = 'deferred';
    out.note = 'collected sweep backlog at ceiling (' + backlog + '/' + ceiling + '): review before more intake (doctrine 0.7: a flooded review queue is an attack surface)';
    return out;
  }
  var nowIso = env.nowIso();
  var year = nowIso.slice(0, 4);
  var today = nowIso.slice(0, 10);
  var pendingCreates = idx.infoIds.slice();
  for (var sIdx = 0; sIdx < ratified.length; sIdx++) {
    var rec = ratified[sIdx].sweep;
    var host = ratified[sIdx].host;
    var sources = Array.isArray(rec.sources) ? rec.sources : [];
    var matches = Array.isArray(rec.match) ? rec.match : [];
    var landed = 0;
    for (var so = 0; so < sources.length && out.fetches < budget; so++) {
      if (!isPublicHttpsLocator_(sources[so])) { out.results.push({ sweep: rec.id, locator: sources[so], status: 'refused', note: 'not an https public-host locator' }); continue; }
      out.fetches++;
      var resp;
      try { resp = env.fetchRaw(sources[so]); } catch (e) { resp = { ok: false, note: String(e) }; }
      if (!resp || !resp.ok) { out.results.push({ sweep: rec.id, locator: sources[so], status: 'fetch_failed' }); continue; }
      var body = resp.text !== undefined ? resp.text : '';
      var hit = matches.length === 0;
      for (var mt = 0; mt < matches.length; mt++) if (body.indexOf(matches[mt]) !== -1) hit = true; // literal matching only; deems-relevant judgment belongs to a session
      if (!hit) { out.results.push({ sweep: rec.id, locator: sources[so], status: 'no_match' }); continue; }
      var hash = resp.binaryHash || (resp.bytes ? env.sha256Bytes(resp.bytes) : env.sha256Text(body));
      if (idx.byHash[hash] && idx.byHash[hash].length) { out.results.push({ sweep: rec.id, locator: sources[so], status: 'dedup', note: 'hash-matched existing capture: corroboration path, never a new review item' }); continue; }
      var ext2 = captureExtension_(resp.contentType);
      var slug2 = String(rec.id || 'sweep').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + String(so + 1);
      var newId2 = allocateInfoId_(pendingCreates, year, slug2);
      pendingCreates.push(newId2);
      var capName2 = 'capture-' + today + '-' + slug2.slice(0, 40) + '.' + ext2.ext;
      var content2 = ext2.binary ? env.b64(resp.bytes) : body;
      var filesObj2 = {};
      var encs2 = {};
      filesObj2['snapshots/' + capName2] = content2;
      if (ext2.binary) encs2['snapshots/' + capName2] = 'base64';
      var regEntry2 = {
        file: 'snapshots/' + capName2, locator: sources[so],
        authority: rec.authority || 'sweep source', retrieved: nowIso,
        capture: { method: 'daemon-fetch', grade: 'B', actor_class: 'daemon', sha256: hash, encoding: ext2.binary ? 'binary' : 'utf8' },
        origin: { kind: 'sweep', matched_sweep: rec.id, deeming_actor: 'daemon-literal-match' }
      };
      var att2 = attestCapture_(env, sources[so], hash, filesObj2, capName2, encs2);
      for (var ak2 in att2) regEntry2[ak2] = att2[ak2];
      filesObj2['data/provenance.json'] = JSON.stringify({ documents: [regEntry2] }, null, 2);
      var pseudoReq = { id: rec.id, target: { text: rec.title || rec.id, description: 'Literal sweep match under ratified sweep ' + rec.id + '.' }, authority: rec.authority || 'sweep source', criticality: 'supporting', cadence: 'none' };
      filesObj2['bundle.md'] = creationBundleMd_(newId2, pseudoReq, sources[so], hash, idx.groups[host] || 'believe-in-oakland', 'monthly', 'supporting', nowIso);
      deliverPackage_(env, newId2, EMPTY_SHA_, filesObj2, out.results, 'sweep', encs2);
      if (out.results[out.results.length - 1].status === 'packaged') { out.packaged.push(newId2); landed++; }
    }
    var histKey = 'sweep-yield:' + rec.id;
    var priorYield = parseInt(env.memo.get(histKey) || '', 10);
    if (!isNaN(priorYield) && (landed > priorYield * 3 + 2 || (priorYield > 2 && landed === 0))) {
      out.results.push({ sweep: rec.id, status: 'anomaly', note: 'yield ' + landed + ' departs history (' + priorYield + '): recorded for review' });
    }
    env.memo.set(histKey, String(landed));
  }
  out.status = 'ok';
  return out;
}

/* ---- member-attest core (0.11.0, M3'): post-landing attestation for member
   submissions. The client cannot reach the timestamp authority or the
   archive (browser CORS), so submissions land with honest pending markers in
   attestation_attempts and this pass completes them server-side: RFC 3161
   over the registered raw hash, co-archive when the locator is a public
   https one, not-applicable recorded when it is not (Tech Arch v10 7.7).
   Attempts are once-only per service per document: the pass acts when a
   pending marker exists (attempted false, note not 'not applicable') and no
   attempted-true entry for that service has been recorded; the real attempt
   is appended, success or failure, and the pending marker stays as history.
   A member requests a retry by appending a fresh pending marker. The scan is
   fenced hourly (advisory memo) since registers are read every tick anyway
   but external fetches should not be. Packages are mechanical under the
   member-attest envelope (bio-checks 1.10.0 MECHANICAL_FIELD_SETS):
   last_updated only in frontmatter, Session Log only in the body,
   provenance.json and snapshots/ in the file set. ---- */

var ATTEST_FENCE_MS_ = 3600 * 1000;

function serviceNeedsAttest_(doc, service) {
  var atts = doc && Array.isArray(doc.attestation_attempts) ? doc.attestation_attempts : null;
  if (!atts) return false;
  var pending = false;
  for (var i = 0; i < atts.length; i++) {
    var a = atts[i];
    if (!a || a.service !== service) continue;
    if (a.attempted === true) return false; // once-only: a real attempt closes the service
    if (a.attempted === false && !/not applicable/i.test(String(a.note || ''))) pending = true;
  }
  return pending;
}

function attestScanCore_(env) {
  var out = { op: 'attest', version: GS_VERSION, results: [], packaged: [] };
  var intent = readStandingIntentCore_(env.rfsa);
  if (!intent.policy.enabled) { out.status = 'noop'; out.note = 'daemon disabled by store policy'; return out; }
  var nowIso = env.nowIso();
  var nowMs = Date.parse(nowIso);
  var fence = env.memo.get('attest:last');
  if (fence && nowMs - Date.parse(fence) < ATTEST_FENCE_MS_) {
    out.status = 'noop'; out.note = 'attest fence (advisory memo, hourly)'; return out;
  }
  env.memo.set('attest:last', nowIso);
  var roots = env.rfsa.listBundles();
  var infos = (roots.information || []).slice().sort();
  var today = nowIso.slice(0, 10);
  for (var i = 0; i < infos.length; i++) {
    var id = infos[i];
    var reg = tryReadJson_(env.rfsa, id, 'data/provenance.json');
    if (!reg || !Array.isArray(reg.documents)) continue;
    var filesObj = {};
    var encs = {};
    var touched = 0;
    for (var d = 0; d < reg.documents.length; d++) {
      var doc = reg.documents[d];
      if (!doc || !doc.capture || !doc.capture.sha256) continue;
      var wantTsa = serviceNeedsAttest_(doc, 'rfc3161');
      var wantSpn = serviceNeedsAttest_(doc, 'save-page-now');
      if (!wantTsa && !wantSpn) continue;
      if (wantSpn) {
        if (env.checks.isPublicHttpsLocator(doc.locator)) {
          var spn = null;
          try { spn = env.attest.spn(doc.locator); } catch (es) { spn = { ok: false, note: 'spn threw: ' + es }; }
          doc.attestation_attempts.push({ service: 'save-page-now', attempted: true, mode: (spn && spn.mode) || 'anonymous', ok: !!(spn && spn.ok), note: (spn && spn.note) || '' });
          if (spn && spn.ok && spn.archive_locator) doc.co_archive = spn.archive_locator;
        } else {
          doc.attestation_attempts.push({ service: 'save-page-now', attempted: false, ok: false, note: 'not applicable: locator is not a fetchable public https source (7.7 asymmetry)' });
        }
        touched++;
      }
      if (wantTsa) {
        var tsa = null;
        try { tsa = env.attest.tsa(doc.capture.sha256); } catch (et) { tsa = { ok: false, note: 'tsa threw: ' + et }; }
        doc.attestation_attempts.push({ service: 'rfc3161', attempted: true, authority: (tsa && tsa.authority) || '', ok: !!(tsa && tsa.ok), note: (tsa && tsa.note) || '' });
        if (tsa && tsa.ok && tsa.token_b64) {
          var base = String(doc.file || ('doc-' + d)).split('/').pop();
          var tokenFile = 'snapshots/' + base + '.tsr';
          filesObj[tokenFile] = tsa.token_b64;
          encs[tokenFile] = 'base64';
          doc.timestamp = { authority: tsa.authority, token_file: tokenFile, encoding: 'binary' };
          if (tsa.caveat) doc.timestamp.caveat = tsa.caveat;
        }
        touched++;
      }
    }
    if (!touched) continue;
    var live = tryReadText_(env.rfsa, id, 'bundle.md');
    if (live === null) { out.results.push({ bundle: id, op: 'member-attest', status: 'attest_failed', note: 'bundle.md unreadable' }); continue; }
    var baseHash = env.sha256Text(live);
    var text = surgicalSetTop_(live, 'last_updated', nowIso);
    if (text === null) { out.results.push({ bundle: id, op: 'member-attest', status: 'attest_failed', note: 'last_updated line absent: refused (fixed template, never invention)' }); continue; }
    text = appendSessionLog_(text, today, 'Member submission attested (daemon member-attest)', DAEMON_ACTOR_,
      ['Trigger: pending attestation markers in the intake register',
       'Changes: attestation attempts recorded; trusted timestamp and co-archive attached where obtained; the 7.7 asymmetry recorded honestly where not.']);
    if (text === null) { out.results.push({ bundle: id, op: 'member-attest', status: 'attest_failed', note: 'Session Log heading absent: refused' }); continue; }
    filesObj['bundle.md'] = text;
    filesObj['data/provenance.json'] = JSON.stringify(reg, null, 2);
    deliverPackage_(env, id, baseHash, filesObj, out.results, 'member-attest', encs);
    if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(id);
  }
  out.status = 'ok';
  return out;
}

/* ---- deadline-recheck core ---- */

function duescanCore_(env) {
  var out = { op: 'duescan', version: GS_VERSION, results: [], packaged: [], due_slate: [] };
  var intent = readStandingIntentCore_(env.rfsa);
  if (!intent.policy.enabled) { out.status = 'noop'; out.note = 'daemon disabled by store policy'; return out; }
  var nowIso = env.nowIso();
  var today = nowIso.slice(0, 10);
  var roots = env.rfsa.listBundles();
  // Action clocks: pending past date flips to overdue (I-11), the single
  // legal mutation, decidable by clock arithmetic alone.
  var actions = (roots.actions || []).slice().sort();
  for (var a = 0; a < actions.length; a++) {
    var id = actions[a];
    var raw = tryReadText_(env.rfsa, id, 'bundle.md');
    if (raw === null) continue;
    var flip = surgicalFlipOverdueClocks_(raw, today);
    if (flip.flipped.length === 0) continue;
    var baseHash = env.sha256Text(raw);
    var text = surgicalSetTop_(flip.text, 'last_updated', nowIso);
    if (text === null) { out.results.push({ bundle: id, op: 'deadline-recheck', status: 'flip_failed', note: 'last_updated line absent: refused' }); continue; }
    var names = [];
    for (var fl = 0; fl < flip.flipped.length; fl++) names.push(flip.flipped[fl].text + ' (' + flip.flipped[fl].date + ')');
    text = appendSessionLog_(text, today, 'Clock flip pending to overdue (daemon deadline-recheck)', DAEMON_ACTOR_,
      ['Trigger: clock date passed while status read pending',
       'Changes: ' + names.join('; ') + ' flipped to overdue (I-11: marked, never silently stale).']);
    if (text === null) { out.results.push({ bundle: id, op: 'deadline-recheck', status: 'flip_failed', note: 'Session Log heading absent: refused' }); continue; }
    deliverPackage_(env, id, baseHash, { 'bundle.md': text }, out.results, 'deadline-recheck');
    if (out.results[out.results.length - 1].status === 'packaged') out.packaged.push(id);
    for (var fs = 0; fs < flip.flipped.length; fs++) {
      out.due_slate.push({ kind: 'clock_overdue', bundle: id, text: flip.flipped[fs].text, date: flip.flipped[fs].date });
    }
  }
  // Problem recheck triggers past date: due-slate emission only; the
  // re-evaluation they call for is judgment and belongs to a session.
  var problems = (roots.problems || []).slice().sort();
  for (var p = 0; p < problems.length; p++) {
    var pid = problems[p];
    var praw = tryReadText_(env.rfsa, pid, 'bundle.md');
    if (praw === null) continue;
    var pfm = env.checks.parseFrontmatter(praw).data;
    if (!pfm) continue;
    var rts = Array.isArray(pfm.recheck_triggers) ? pfm.recheck_triggers : [];
    for (var t = 0; t < rts.length; t++) {
      var trg = rts[t];
      if (trg && typeof trg.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(trg.date) && trg.date < today) {
        out.due_slate.push({ kind: 'recheck_due', bundle: pid, text: trg.text || '', date: trg.date });
      }
    }
  }
  // Due gathering requests and sweeps ride the slate too (Section 5).
  for (var g = 0; g < intent.requests.length; g++) {
    var gr = intent.requests[g].req;
    if (gr && gr.status === 'open') out.due_slate.push({ kind: 'gathering_open', request: gr.id, text: (gr.target && gr.target.text) || '', cadence: gr.cadence || '' });
  }
  out.status = 'ok';
  return out;
}

/* ---- Apps Script environment for the cores (Drive, UrlFetchApp,
   Script Properties memo, live co-attestation) ---- */

function sha256BytesHex_(bytes) {
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes);
  var hex = '';
  for (var i = 0; i < d.length; i++) { var b = (d[i] + 256) % 256; hex += (b < 16 ? '0' : '') + b.toString(16); }
  return hex;
}

/** Advisory quota memo in Script Properties: derived, regenerable, never
    authoritative (absent = due). Rotated at 200 keys. */
function propsMemo_() {
  var KEY = 'DAEMON_MEMO';
  var data = null;
  function load() {
    if (data !== null) return data;
    try { data = JSON.parse(props_().getProperty(KEY) || '{}'); } catch (e) { data = {}; }
    return data;
  }
  function save() {
    try {
      var keys = Object.keys(data);
      if (keys.length > 200) { keys.sort(); for (var i = 0; i < keys.length - 200; i++) delete data[keys[i]]; }
      props_().setProperty(KEY, JSON.stringify(data));
    } catch (e) { /* advisory: never blocks */ }
  }
  return {
    get: function (k) { return load()[k] || ''; },
    set: function (k, v) { load(); if (v === '') delete data[k]; else data[k] = v; save(); }
  };
}

/** Save Page Now co-archive, anonymous mode until the operator supplies the
    S3 key pair as a Tier B secret (SPN2_ACCESS/SPN2_SECRET Script Properties). */
function spnArchive_(locator) {
  var access = props_().getProperty('SPN2_ACCESS'), secret = props_().getProperty('SPN2_SECRET');
  var mode = (access && secret) ? 'spn2-authenticated' : 'anonymous';
  var opts = { muteHttpExceptions: true, followRedirects: false };
  if (mode === 'spn2-authenticated') opts.headers = { Authorization: 'LOW ' + access + ':' + secret, Accept: 'application/json' };
  try {
    var r = UrlFetchApp.fetch('https://web.archive.org/save/' + locator, opts);
    var code = r.getResponseCode();
    var headers = r.getAllHeaders();
    var loc = headers['Location'] || headers['location'] || headers['Content-Location'] || headers['content-location'] || '';
    if (Object.prototype.toString.call(loc) === '[object Array]') loc = loc[0] || '';
    var archived = '';
    if (/\/web\/\d+/.test(String(loc))) archived = String(loc).indexOf('http') === 0 ? String(loc) : 'https://web.archive.org' + loc;
    if (!archived && code >= 200 && code < 400) archived = 'https://web.archive.org/web/*/' + locator;
    if (code >= 200 && code < 400) return { attempted: true, ok: true, mode: mode, archive_locator: archived, note: 'http ' + code };
    return { attempted: true, ok: false, mode: mode, note: 'service returned http ' + code };
  } catch (e) {
    return { attempted: true, ok: false, mode: mode, note: 'unreachable: ' + e };
  }
}

/** RFC 3161 trusted timestamp over the capture hash: fixed DER byte template
    plus the 32-byte digest, certReq set; response stored verbatim (base64
    transit encoding recorded in the register). digicert primary, freetsa
    fallback with its CA-distribution caveat recorded. */
function rfc3161Timestamp_(digestHex) {
  var prefix = [0x30, 0x39, 0x02, 0x01, 0x01, 0x30, 0x31, 0x30, 0x0d, 0x06, 0x09,
                0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20];
  var req = prefix.slice();
  for (var i = 0; i < 64; i += 2) {
    var b = parseInt(digestHex.substr(i, 2), 16);
    req.push(b > 127 ? b - 256 : b);
  }
  req.push(0x01, 0x01, -1); // certReq TRUE (0xff as signed byte)
  var authorities = [
    { url: 'https://timestamp.digicert.com', name: 'timestamp.digicert.com', caveat: '' },
    { url: 'https://freetsa.org/tsr', name: 'freetsa.org', caveat: 'CA certificate published for verification rather than OS-distributed' }
  ];
  var notes = [];
  for (var a = 0; a < authorities.length; a++) {
    try {
      var r = UrlFetchApp.fetch(authorities[a].url, {
        method: 'post', contentType: 'application/timestamp-query',
        payload: req, muteHttpExceptions: true
      });
      var code = r.getResponseCode();
      if (code >= 200 && code < 300) {
        var bytes = r.getContent();
        var granted = bytes.length > 8 && ((bytes[0] + 256) % 256) === 0x30;
        if (granted) {
          var out = { attempted: true, ok: true, authority: authorities[a].name, token_b64: Utilities.base64Encode(bytes), note: 'granted (' + bytes.length + ' bytes DER)' };
          if (authorities[a].caveat) out.caveat = authorities[a].caveat;
          return out;
        }
        notes.push(authorities[a].name + ': non-DER response');
      } else notes.push(authorities[a].name + ': http ' + code);
    } catch (e) { notes.push(authorities[a].name + ': unreachable'); }
  }
  return { attempted: true, ok: false, authority: '', note: 'all authorities failed: ' + notes.join('; ') };
}

function daemonEnv_() {
  var rfsa = storeReadAdapter_();
  if (rfsa === null) return null;
  var store = DriveApp.getFolderById(props_().getProperty('STORE_FOLDER_ID'));
  return {
    rfsa: rfsa,
    checks: bioChecksModule_(),
    gate: function (folderName, filesObj) {
      return gateCheckBundle_(folderName, filesObj, { resolveTarget: driveResolveTarget_(rfsa) });
    },
    ensureBundleWriter: function (bundleId) {
      var rootName = typeRootFor_(bundleId);
      var rit = store.getFoldersByName(rootName);
      var root = rit.hasNext() ? rit.next() : store.createFolder(rootName);
      var bit = root.getFoldersByName(bundleId);
      var folder = bit.hasNext() ? bit.next() : root.createFolder(bundleId);
      var fsa = driveAdapter_(folder);
      return {
        writeText: function (rel, content) {
          if (!isPendingPath_(rel)) throw new Error('daemon writes pending paths only: ' + rel);
          fsa.writeText(rel, content);
        }
      };
    },
    fetchRaw: function (url) {
      var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      var code = r.getResponseCode();
      var headers = r.getAllHeaders();
      var ct = headers['Content-Type'] || headers['content-type'] || '';
      var bytes = r.getContent();
      var out = { ok: code >= 200 && code < 300, code: code, contentType: String(ct), bytes: bytes, binaryHash: sha256BytesHex_(bytes) };
      if (String(ct).toLowerCase().indexOf('text/') === 0 || String(ct).toLowerCase().indexOf('json') !== -1) {
        try { out.text = r.getContentText('UTF-8'); } catch (e) { /* binary */ }
      }
      return out;
    },
    sha256Text: sha256Hex_,
    sha256Bytes: sha256BytesHex_,
    b64: function (bytes) { return Utilities.base64Encode(bytes); },
    nowIso: function () { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); },
    memo: propsMemo_(),
    attest: { spn: spnArchive_, tsa: rfc3161Timestamp_ }
  };
}

/** Run a daemon op and promote its packages through the same convergent
    promoter as every other write: single-write authority preserved. */
function runDaemonOp_(op, selector, caller) {
  var env = daemonEnv_();
  if (env === null) return { ok: true, op: op, version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' };
  // Creation-capable operations run under the self-expiring daemon claim
  // (M2'' serialization). The acquire is a brief LockService critical section
  // so two executions cannot both read-empty-then-write; the claim itself
  // outlives the lock and ages out if this execution is killed.
  var claimed = false;
  if (op === 'tick' || op === 'sweep') {
    var lk = null, gotLock = true;
    try {
      if (typeof LockService !== 'undefined') { lk = LockService.getScriptLock(); gotLock = lk.tryLock(2000); }
      if (gotLock) claimed = acquireDaemonClaim_(env.memo, Date.parse(env.nowIso()));
    } finally {
      try { if (lk && gotLock) lk.releaseLock(); } catch (e) { }
    }
    if (!claimed) {
      return { ok: true, op: op, version: GS_VERSION, status: 'skipped', results: [], packaged: [], promoted: [], note: 'another daemon execution holds the claim (concurrency serialization): recorded no-op' };
    }
  }
  var res;
  try {
    if (op === 'tick') res = monitorTickCore_(env, selector);
    else if (op === 'sweep') res = sweepDaemonCore_(env, selector);
    else if (op === 'attest') res = attestScanCore_(env);
    else res = duescanCore_(env);
  } finally {
    if (claimed) releaseDaemonClaim_(env.memo);
  }
  var promoted = [];
  var seen = {};
  for (var i = 0; i < res.packaged.length; i++) {
    var id = res.packaged[i];
    if (seen[id]) continue;
    seen[id] = true;
    var sw = sweepQueue_(caller || DAEMON_ACTOR_, id);
    if (sw) for (var j = 0; j < sw.length; j++) promoted.push(sw[j]);
  }
  res.promoted = promoted;
  res.ok = true;
  return res;
}

/* ---- M4 client write slate (registry: writepkg; ratified Q1 slate) ----
   A byte pipe confined to pending paths: file names ending in .pending
   anywhere inside the bundle, and the literal PENDING_PROMOTION.json at
   bundle root. Every other path is rejected NAMING THE CONSTRAINT. The
   endpoint parses nothing and judges nothing; promotion remains the only
   writer of live state, and anything a hostile token holder injects is
   exactly what the checker surfaces and the discard rule consumes. */

/** The load-bearing constraint, pure and testable. */
function isPendingPath_(path) {
  if (!safeRelPath_(path)) return false;
  if (path === 'PENDING_PROMOTION.json') return true;
  return /\.pending$/.test(path);
}

/** First folder named bundleId across the type roots, or null. The one
    lookup both the read and write paths use, so they cannot disagree. */
function findBundleFolder_(store, bundleId) {
  for (var r = 0; r < TYPE_ROOTS_.length; r++) {
    var it = store.getFoldersByName(TYPE_ROOTS_[r]);
    if (!it.hasNext()) continue;
    var bit = it.next().getFoldersByName(bundleId);
    if (bit.hasNext()) return bit.next();
  }
  return null;
}

/** EVERY folder named bundleId, across every type root (0.12.4).
    Exists because Drive permits duplicate names and the creation race
    produced them: a bundle id that denotes more than one folder is a
    store-integrity failure no per-bundle check can see, since the gate
    and the client scan both operate on a path-keyed file map, which
    presumes exactly the resolution that failed. */
function allBundleFolders_(store, bundleId) {
  var out = [];
  for (var r = 0; r < TYPE_ROOTS_.length; r++) {
    var it = store.getFoldersByName(TYPE_ROOTS_[r]);
    if (!it.hasNext()) continue;
    var bit = it.next().getFoldersByName(bundleId);
    while (bit.hasNext()) out.push({ root: TYPE_ROOTS_[r], folder: bit.next() });
  }
  return out;
}

/** Duplicate bundle ids across the whole store: [{id, root, count}]. */
function duplicateBundleIds_(store) {
  var seen = {}, dupes = [];
  for (var r = 0; r < TYPE_ROOTS_.length; r++) {
    var it = store.getFoldersByName(TYPE_ROOTS_[r]);
    if (!it.hasNext()) continue;
    var fit = it.next().getFolders();
    while (fit.hasNext()) {
      var nm = fit.next().getName();
      var key = TYPE_ROOTS_[r] + '/' + nm;
      seen[key] = (seen[key] || 0) + 1;
    }
  }
  for (var k in seen) {
    if (seen[k] > 1) {
      var parts = k.split('/');
      dupes.push({ root: parts[0], id: parts[1], count: seen[k] });
    }
  }
  return dupes;
}

/** Write adapter: create-or-replace inside the bundle, pending paths only
    (constraint re-checked here too: defense in depth at the last hop). */
function storeWriteAdapter_() {
  var id = props_().getProperty('STORE_FOLDER_ID');
  if (!id) return null;
  var store = DriveApp.getFolderById(id);
  return {
    probeBundle: function (bundleId) {
      for (var r = 0; r < TYPE_ROOTS_.length; r++) {
        var it = store.getFoldersByName(TYPE_ROOTS_[r]);
        if (!it.hasNext()) continue;
        if (it.next().getFoldersByName(bundleId).hasNext()) return TYPE_ROOTS_[r];
      }
      return null;
    },
    writePendingText: function (bundleId, path, content) {
      if (!isPendingPath_(path)) return null;
      var hit = findBundleFolder_(store, bundleId);
      if (!hit) {
        // Creation-by-packaging (0.10.2 admission): an absent bundle folder is
        // created under its type root for pending-path writes. The id grammar
        // is already enforced at the POST boundary (BIO_ID_RE); nothing here
        // becomes a live bundle unless its package passes the full embedded
        // gate and promotes, and an abandoned orphan is surfaced by C-16.4.
        // A leaked write token gains no capability class it lacked: it could
        // already litter existing queues; now it can litter new folders,
        // cleaned the same way, with the promoter gating all content.
        //
        // 0.12.4, DEFECT-CREATION-FOLDER-RACE: this create is serialized and
        // double-checked. The client posts package files CONCURRENTLY
        // (postPackageResilient uses Promise.all), so on a creation every
        // one of N simultaneous posts found no folder and every one created
        // it. Drive permits duplicate names, so nothing refused: five files
        // produced four folders named the same bundle id, and a bundle id
        // stopped denoting one thing. The re-check inside the lock is what
        // makes this correct rather than merely narrower; without it the
        // window shrinks but never closes. Only the create branch locks, so
        // the common case of resolving an existing folder stays lock-free.
        var rootName = typeRootFor_(bundleId);
        if (!rootName) return null;
        var lock = (typeof LockService !== 'undefined') ? LockService.getScriptLock() : null;
        var held = lock ? lock.tryLock(10000) : false;
        try {
          hit = findBundleFolder_(store, bundleId);   // re-check under the lock
          if (!hit) {
            var rit2 = store.getFoldersByName(rootName);
            var root2 = rit2.hasNext() ? rit2.next() : store.createFolder(rootName);
            hit = root2.createFolder(bundleId);
          }
        } finally {
          if (held) lock.releaseLock();
        }
      }
      var parts = path.split('/');
      var name = parts.pop();
      var folder = hit;
      for (var i = 0; i < parts.length; i++) {
        var fit = folder.getFoldersByName(parts[i]);
        folder = fit.hasNext() ? fit.next() : folder.createFolder(parts[i]);
      }
      var existing = folder.getFilesByName(name);
      if (existing.hasNext()) existing.next().setContent(content);
      else folder.createFile(name, content, 'text/plain');
      return { bytes: content.length };
    }
  };
}

/** Adapter-driven core: constraint first, then the write, echo the hash. */
function writePkgCore_(fsw, sha256fn, bundleId, path, content) {
  if (typeof content !== 'string') return { ok: false, error: 'missing body' };
  if (!safeRelPath_(path)) return { ok: false, error: 'invalid file path' };
  if (!isPendingPath_(path)) return { ok: false, error: 'write refused: this endpoint accepts pending paths only (*.pending and PENDING_PROMOTION.json); live files are written solely by promotion' };
  var res = fsw.writePendingText(bundleId, path, content);
  if (res === null) return { ok: false, error: 'unknown bundle: ' + bundleId };
  return { ok: true, op: 'writepkg', version: GS_VERSION, bundle: bundleId, file: path, bytes: res.bytes, sha256: sha256fn(content) };
}

/** POST entry: simple requests only (text/plain body, selectors in the
    query string). Token verified strictly before any work, same as doGet. */
function doPost(e) {
  var ts = new Date().toISOString();
  var token = (e && e.parameter && e.parameter.token) || '';
  var cls = tokenClass_(token);
  if (cls === null) {
    appendLog_({ ts: ts, caller: 'unknown', op: 'post', outcome: 'unauthorized' });
    return json_({ ok: false, error: 'unauthorized' });
  }
  var op = (e && e.parameter && e.parameter.op) || '';
  if (op !== 'writepkg') {
    appendLog_({ ts: ts, caller: cls, op: op, outcome: 'bad_op' });
    return json_({ ok: false, error: 'unknown POST op; valid: writepkg' });
  }
  var bundle = (e && e.parameter && e.parameter.bundle) || '';
  if (!BIO_ID_RE.test(bundle)) {
    appendLog_({ ts: ts, caller: cls, op: 'writepkg', outcome: 'bad_selector' });
    return json_({ ok: false, error: 'invalid bundle selector' });
  }
  var file = (e && e.parameter && e.parameter.file) || '';
  var body = (e && e.postData && typeof e.postData.contents === 'string') ? e.postData.contents : null;
  var fsw = storeWriteAdapter_();
  if (fsw === null) return json_({ ok: true, op: 'writepkg', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
  var res = writePkgCore_(fsw, sha256Hex_, bundle, file, body);
  appendLog_({ ts: ts, caller: cls, op: 'writepkg', outcome: res.ok ? 'ok' : 'refused', bundle: bundle, file: file });
  return json_(res);
}


/* ---- M3 client read slate (registry: list, read; ratified Q1 slate) ----
   Read-only BY CONSTRUCTION: these ops ride storeReadAdapter_, whose
   object exposes no write capability at all; the conformance harness
   asserts its body contains no Drive write verbs. Content returns as a
   plain UTF-8 JSON string with sha256 over the UTF-8 bytes and an
   encoding field ('utf8' now, 'b64' reserved), per the ratified slate. */

/** Bundle-relative path rail: relative, no traversal, no empty segments. */
var CLIENT_PATH_RE = /^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/;
function safeRelPath_(p) {
  if (typeof p !== 'string' || !CLIENT_PATH_RE.test(p)) return false;
  var parts = p.split('/');
  for (var i = 0; i < parts.length; i++) if (parts[i] === '..' || parts[i] === '.') return false;
  return true;
}

/** Read-only Drive adapter over the store: list and read, nothing else. */
function storeReadAdapter_() {
  var id = props_().getProperty('STORE_FOLDER_ID');
  if (!id) return null; // not set up: callers translate into guidance
  var store = DriveApp.getFolderById(id);
  function bundleFolder_(bundleId) {
    for (var r = 0; r < TYPE_ROOTS_.length; r++) {
      var it = store.getFoldersByName(TYPE_ROOTS_[r]);
      if (!it.hasNext()) continue;
      var bit = it.next().getFoldersByName(bundleId);
      if (bit.hasNext()) return { root: TYPE_ROOTS_[r], folder: bit.next() };
    }
    return null;
  }
  function fileFor_(bundleId, path) {
    var hit = bundleFolder_(bundleId);
    if (!hit) return null;
    var parts = path.split('/');
    var name = parts.pop();
    var f = hit.folder;
    for (var i = 0; i < parts.length; i++) {
      var it = f.getFoldersByName(parts[i]);
      if (!it.hasNext()) return null;
      f = it.next();
    }
    var fit = f.getFilesByName(name);
    return fit.hasNext() ? fit.next() : null;
  }
  return {
    listBundles: function () {
      var out = {};
      for (var r = 0; r < TYPE_ROOTS_.length; r++) {
        out[TYPE_ROOTS_[r]] = [];
        var it = store.getFoldersByName(TYPE_ROOTS_[r]);
        if (!it.hasNext()) continue;
        var bundles = it.next().getFolders();
        while (bundles.hasNext()) out[TYPE_ROOTS_[r]].push(bundles.next().getName());
        out[TYPE_ROOTS_[r]].sort();
      }
      return out;
    },
    listFiles: function (bundleId) {
      var hit = bundleFolder_(bundleId);
      if (!hit) return null;
      var out = [];
      (function walk(folder, prefix) {
        var files = folder.getFiles();
        while (files.hasNext()) {
          var f = files.next();
          out.push({ path: prefix + f.getName(), size: f.getSize(), modified: f.getLastUpdated().toISOString() });
        }
        var subs = folder.getFolders();
        while (subs.hasNext()) {
          var s = subs.next();
          walk(s, prefix + s.getName() + '/');
        }
      })(hit.folder, '');
      out.sort(function (a, b) { return a.path < b.path ? -1 : 1; });
      return { root: hit.root, files: out };
    },
    readText: function (bundleId, path) {
      var f = fileFor_(bundleId, path);
      return f ? f.getBlob().getDataAsString('UTF-8') : null;
    },
    readBytes: function (bundleId, path) {
      var f = fileFor_(bundleId, path);
      return f ? f.getBlob().getBytes() : null;
    },
    bundleLocator: function (bundleId) {
      var hit = bundleFolder_(bundleId);
      return hit ? hit.folder.getId() : null;
    }
  };
}

/* ---- M6 index regeneration (registry: reindex; admitted with its
   consumer, the client). The index is derived, regenerable, and NEVER
   authoritative (State Rules 1.1): it maps canonical IDs to substrate
   locators, is excluded from all integrity guarantees, and can be deleted
   and rebuilt at any time. The writer below can touch exactly one path:
   index/index.json. */

function indexWriteAdapter_() {
  var id = props_().getProperty('STORE_FOLDER_ID');
  if (!id) return null;
  var store = DriveApp.getFolderById(id);
  return {
    writeIndex: function (content) {
      var it = store.getFoldersByName('index');
      var folder = it.hasNext() ? it.next() : store.createFolder('index');
      var existing = folder.getFilesByName('index.json');
      if (existing.hasNext()) existing.next().setContent(content);
      else folder.createFile('index.json', content, 'application/json');
      return { bytes: content.length };
    },
    readIndex: function () {
      var it = store.getFoldersByName('index');
      if (!it.hasNext()) return null;
      var f = it.next().getFilesByName('index.json');
      return f.hasNext() ? f.next().getBlob().getDataAsString('UTF-8') : null;
    }
  };
}

/** Deterministic index content from the read adapter: sorted ids, sorted
    roots, locator per bundle. nowIso injected for testability.
    0.11.5 (P2M8 A2): enriched into the docket and the diff key in one.
    Each bundle carries object_type, title, current_state, last_updated,
    and its bundle.md sha256. C-13 (last_updated always bumps, a Session
    Log entry always lands) makes the bundle.md sha a sound whole-bundle
    change detector, so no per-file shas are needed. sha256fn and parseFm
    are injected (sha256Hex_ and the embed's parseFrontmatter at the call
    site; node equivalents in the batteries), keeping the core pure. */
/* SUBSTRATE-LOCATOR NOTE (July 22, 2026, D1 session census).
   `locator` below is a Drive file ID, and this artifact has exactly one
   generator serving two audiences: op=readindex (internal, where the
   locator is load-bearing for fetching) and the B2 publisher, which
   pushes the SAME bytes to data.believeinoakland.org, where it is not.
   Verified live: the edge index.json was byte-identical to the internal
   one, so every bundle's Drive ID is currently world-readable.

   Deliberately NOT fixed now, per operator direction: whether Drive
   survives the transport-and-storage decision is undecided, and a
   projection split made against a substrate that may be replaced is
   work done twice. Recorded here so the reference cannot be lost.

   When the storage session lands, the fix is a projection split rather
   than a field removal: the internal index keeps whatever the chosen
   plane needs for fetching, and the published index becomes a
   deliberate public projection. The related question of WHICH bundles
   the public projection should carry (today: all of them, including
   collected-but-unratified titles) is a doctrine question, queued for
   intake doctrine v1.2 Section 4b, not an engineering one.

   Cross-references: STATUS-P2M8-DATA-LAYER.md open items; C-6.1, which
   refuses substrate locators inside the store on the principle that
   targets are canonical IDs only, and which this publication path sits
   in tension with. */
function buildIndexCore_(rfsa, nowIso, sha256fn, parseFm) {
  var roots = rfsa.listBundles();
  var bundles = {};
  var rootNames = TYPE_ROOTS_.slice();
  for (var r = 0; r < rootNames.length; r++) {
    var ids = (roots[rootNames[r]] || []).slice().sort();
    for (var i = 0; i < ids.length; i++) {
      var entry = { root: rootNames[r], locator: rfsa.bundleLocator ? rfsa.bundleLocator(ids[i]) : null,
        object_type: null, title: null, current_state: null, last_updated: null, sha256: null };
      var raw = rfsa.readText(ids[i], 'bundle.md');
      if (raw !== null && sha256fn && parseFm) {
        entry.sha256 = sha256fn(raw);
        try {
          var fm = parseFm(raw).data || {};
          entry.object_type = fm.object_type || null;
          entry.title = fm.title || null;
          entry.current_state = fm.current_state || null;
          entry.last_updated = fm.last_updated || null;
        } catch (e) { /* a malformed bundle.md still indexes by sha; the gate reports the defect */ }
      }
      bundles[ids[i]] = entry;
    }
  }
  return JSON.stringify({ generated: nowIso, version: GS_VERSION, bundles: bundles }, null, 2);
}

/** Shared hex sha256 over UTF-8 text (Apps Script side). */
function sha256Hex_(s) {
  // Strings hash over UTF-8 through the native digest (fast path,
  // unchanged). Byte input (0.11.3, KICKOFF-P2M6 4a) hashes through the
  // embedded streaming SHA-256: Uint8Array-native, one byte per element,
  // retiring the signed-conversion pass whose plain number array
  // materialized content at ~8 bytes per element (the OOM profile).
  // Digest agreement with the native path is battery-asserted (checks
  // battery streaming cross-validation; conformance parity T-family).
  if (typeof s === 'string') {
    var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) { var b = (bytes[i] + 256) % 256; hex += (b < 16 ? '0' : '') + b.toString(16); }
    return hex;
  }
  return bioChecksModule_().createSha256().update(s).hex();
}

/* Adapter-driven cores: pure, node-testable through the conformance
   harness's vm technique, exactly like promoteBundleCore_. */
function listStoreCore_(fsa) {
  return { ok: true, op: 'list', version: GS_VERSION, roots: fsa.listBundles() };
}
function listBundleCore_(fsa, bundleId) {
  var res = fsa.listFiles(bundleId);
  if (res === null) return { ok: false, error: 'unknown bundle: ' + bundleId };
  return { ok: true, op: 'list', version: GS_VERSION, bundle: bundleId, root: res.root, files: res.files };
}
/**
 * A bundle folder must not hold two files with the same path.
 *
 * Drive permits duplicate names in one folder, and every read here resolves a
 * file by NAME. When duplicates exist, readText returns whichever the adapter
 * reaches first, so a reader is served one file's bytes under another file's
 * listed size, with a sha256 that correctly describes the WRONG content. That
 * is self-consistent and undetectable downstream: hash verification passes,
 * because the hash is over exactly the bytes that were wrongly served.
 *
 * Observed for real on 2026-07-22, when a malformed write left three files
 * named 'undefined.pending' in one folder and readbundle reported three
 * different sizes carrying one identical hash.
 *
 * The only safe answer is refusal. A folder in this state is not readable by
 * name, so nothing that resolves by name may pretend otherwise.
 */
function duplicatePaths_(listing) {
  var seen = {}, dupes = {};
  for (var i = 0; i < listing.files.length; i++) {
    var p = listing.files[i].path;
    if (seen[p]) dupes[p] = true; else seen[p] = true;
  }
  var out = [];
  for (var k in dupes) if (Object.prototype.hasOwnProperty.call(dupes, k)) out.push(k);
  out.sort();
  return out;
}

function duplicatePathError_(bundleId, dupes) {
  return 'bundle ' + bundleId + ' holds duplicate file names, so reads by name '
    + 'would serve the wrong bytes with a matching hash; remove the duplicates: '
    + dupes.join(', ');
}

function readFileCore_(fsa, sha256fn, bundleId, path) {
  if (!safeRelPath_(path)) return { ok: false, error: 'invalid file path' };
  if (typeof fsa.listFiles === 'function') {
    var lst = fsa.listFiles(bundleId);
    if (lst && lst.files) {
      var dup = duplicatePaths_(lst);
      if (dup.length) return { ok: false, error: duplicatePathError_(bundleId, dup) };
    }
  }
  // Binary-at-rest (0.11.0): non-text files serve through the reserved
  // 'b64' encoding (Q1 slate, held against exactly this future), with
  // sha256 over the RAW bytes so the client verifies against the register.
  if (!isTextStorePath_(path) && typeof fsa.readBytes === 'function') {
    var bytes = fsa.readBytes(bundleId, path);
    if (bytes === null) return { ok: false, error: 'missing file: ' + path };
    return { ok: true, op: 'read', version: GS_VERSION, bundle: bundleId, file: path, encoding: 'b64', sha256: sha256fn(bytes), content: Utilities.base64Encode(bytes) };
  }
  var content = fsa.readText(bundleId, path);
  if (content === null) return { ok: false, error: 'missing file: ' + path };
  return { ok: true, op: 'read', version: GS_VERSION, bundle: bundleId, file: path, encoding: 'utf8', sha256: sha256fn(content), content: content };
}

/** The three-tier eager predicate (P2M8 A2, mirroring the client's A1
    scope): everything is tier 1/2 EXCEPT the document tiers. */
function eagerStorePath_(path) {
  return !(path.indexOf('_history/') === 0 || path.indexOf('snapshots/') === 0);
}

/** op=readbundle (P2M8 A2): a bundle's small files in ONE response, so
    opening a bundle is one round trip instead of N. Read-only by
    construction (rides the read adapter). Excludes snapshots/ and
    _history/ by the same tier predicate the client's A1 sync applies;
    their listing rides in `elided` so the caller keeps presence without
    bytes. Stays small precisely because documents are excluded, so it
    never approaches the endpoint response ceiling. */
function readBundleCore_(fsa, sha256fn, bundleId) {
  var listing = fsa.listFiles(bundleId);
  if (listing === null) return { ok: false, error: 'unknown bundle: ' + bundleId };
  var dupes = duplicatePaths_(listing);
  if (dupes.length) return { ok: false, error: duplicatePathError_(bundleId, dupes) };
  var files = [];
  var elided = [];
  for (var i = 0; i < listing.files.length; i++) {
    var f = listing.files[i];
    if (!eagerStorePath_(f.path)) { elided.push({ path: f.path, size: f.size, modified: f.modified }); continue; }
    var one;
    if (!isTextStorePath_(f.path) && typeof fsa.readBytes === 'function') {
      var bytes = fsa.readBytes(bundleId, f.path);
      if (bytes === null) return { ok: false, error: 'listing named a vanished file: ' + f.path };
      one = { path: f.path, size: f.size, modified: f.modified, encoding: 'b64', sha256: sha256fn(bytes), content: Utilities.base64Encode(bytes) };
    } else {
      var content = fsa.readText(bundleId, f.path);
      if (content === null) return { ok: false, error: 'listing named a vanished file: ' + f.path };
      one = { path: f.path, size: f.size, modified: f.modified, encoding: 'utf8', sha256: sha256fn(content), content: content };
    }
    files.push(one);
  }
  return { ok: true, op: 'readbundle', version: GS_VERSION, bundle: bundleId, root: listing.root, files: files, elided: elided };
}

/* ---- op=lease (P2M8 A2): the edit lease -----------------------------------
   A self-expiring lease at the bundle level, the same shape as the
   promoter's PROMOTING claim one layer out. Cooperative, never
   correctness-load-bearing: the manifest base-sha CAS remains the floor,
   promotion checks the hash and never the lease, and a submission that
   bypasses the lease still diverges safely. What the lease adds: acquire
   returns the CURRENT bundle.md and its sha as the edit base, so
   re-anchor-on-live is structural; presence (holder handle, expiry) lets
   members avoid collision; the per-lease secret makes holdership
   enforceable under the shared class token (possession, not a claim of a
   name). Markers are LEASE-<actor>.json advisory artifacts under C-16.5
   hygiene; a crashed holder's marker sweeps exactly like a crashed
   promoter's. Ten-minute TTL; the holder always wins renewal, with one
   boundary: renewal is conditional on still holding it. */
var LEASE_TTL_MS_ = 10 * 60 * 1000;
var LEASE_ACTOR_RE_ = /^[A-Za-z0-9][A-Za-z0-9-]{0,63}$/;
var LEASE_HANDLE_RE_ = /^[\x20-\x7E]{1,64}$/;
var LEASE_MARKER_RE_ = /^LEASE-([A-Za-z0-9][A-Za-z0-9-]{0,63})\.json$/;

function leaseCore_(lfa, sha256fn, opts) {
  var action = opts.action;
  var actor = opts.actor || '';
  var nowMs = opts.nowMs || Date.now();
  var ttlMs = opts.ttlMs || LEASE_TTL_MS_;
  if (['acquire', 'renew', 'release'].indexOf(action) === -1) return { ok: false, error: "lease action must be one of: acquire, renew, release" };
  if (!LEASE_ACTOR_RE_.test(actor)) return { ok: false, error: 'lease actor must match ' + String(LEASE_ACTOR_RE_) };
  var myMarker = 'LEASE-' + actor + '.json';
  var iso = function (ms) { return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z'); };
  function readParsed(name) {
    var raw = lfa.readMarker(name);
    if (raw === null) return null;
    try { return JSON.parse(raw); } catch (e) { return { unparsable: true }; }
  }
  function liveOthers() {
    // Sweep expired or unparsable markers on sight (C-16.5 hygiene, the
    // promoter's own pattern applied to leases), return fresh competitors.
    var names = lfa.listMarkers();
    var out = [];
    for (var i = 0; i < names.length; i++) {
      var m = LEASE_MARKER_RE_.exec(names[i]);
      if (!m) continue;
      var rec = readParsed(names[i]);
      var expired = !rec || rec.unparsable || !rec.expires || nowMs > Date.parse(rec.expires);
      if (expired) { lfa.removeMarker(names[i]); continue; }
      if (m[1] !== actor) out.push({ name: names[i], actor: m[1], rec: rec });
    }
    return out;
  }

  if (action === 'acquire') {
    var handle = opts.handle || '';
    if (!LEASE_HANDLE_RE_.test(handle)) return { ok: false, error: 'lease handle must be 1-64 printable characters' };
    var others = liveOthers();
    if (others.length) {
      return { ok: true, op: 'lease', action: 'acquire', version: GS_VERSION, bundle: opts.bundle, granted: false,
        holder_handle: others[0].rec.holder_handle || null, expires: others[0].rec.expires };
    }
    var secret = opts.uuidFn();
    var marker = { actor: actor, holder_handle: handle, secret_hash: sha256fn(secret), acquired: iso(nowMs), expires: iso(nowMs + ttlMs) };
    lfa.writeMarker(myMarker, JSON.stringify(marker));
    // Contention re-check, the PROMOTING protocol: yield to an earlier
    // fresh competitor (acquired ts, then actor name as the tie-break).
    var comp = liveOthers();
    for (var c = 0; c < comp.length; c++) {
      var cr = comp[c].rec;
      if (cr.acquired < marker.acquired || (cr.acquired === marker.acquired && comp[c].actor < actor)) {
        lfa.removeMarker(myMarker);
        return { ok: true, op: 'lease', action: 'acquire', version: GS_VERSION, bundle: opts.bundle, granted: false,
          holder_handle: cr.holder_handle || null, expires: cr.expires };
      }
    }
    var live = lfa.readLive();
    if (live === null) { lfa.removeMarker(myMarker); return { ok: false, error: 'bundle has no bundle.md; nothing to lease an edit base from' }; }
    return { ok: true, op: 'lease', action: 'acquire', version: GS_VERSION, bundle: opts.bundle, granted: true,
      secret: secret, holder_handle: handle, acquired: marker.acquired, expires: marker.expires,
      base: { file: 'bundle.md', encoding: 'utf8', sha256: sha256fn(live), content: live } };
  }

  // renew and release both require possession of the secret.
  var secretIn = opts.secret || '';
  var mine = readParsed(myMarker);
  if (action === 'renew') {
    if (!mine || mine.unparsable) return { ok: true, op: 'lease', action: 'renew', version: GS_VERSION, bundle: opts.bundle, renewed: false, reason: 'not_held' };
    if (sha256fn(secretIn) !== mine.secret_hash) return { ok: true, op: 'lease', action: 'renew', version: GS_VERSION, bundle: opts.bundle, renewed: false, reason: 'secret_mismatch' };
    if (nowMs > Date.parse(mine.expires)) {
      lfa.removeMarker(myMarker);
      return { ok: true, op: 'lease', action: 'renew', version: GS_VERSION, bundle: opts.bundle, renewed: false, reason: 'expired' };
    }
    mine.expires = iso(nowMs + ttlMs);
    lfa.writeMarker(myMarker, JSON.stringify(mine));
    return { ok: true, op: 'lease', action: 'renew', version: GS_VERSION, bundle: opts.bundle, renewed: true, expires: mine.expires };
  }
  // release: best-effort, idempotent; the TTL is the backstop.
  if (!mine || mine.unparsable) return { ok: true, op: 'lease', action: 'release', version: GS_VERSION, bundle: opts.bundle, released: true, note: 'already free' };
  if (sha256fn(secretIn) !== mine.secret_hash) return { ok: true, op: 'lease', action: 'release', version: GS_VERSION, bundle: opts.bundle, released: false, reason: 'secret_mismatch' };
  lfa.removeMarker(myMarker);
  return { ok: true, op: 'lease', action: 'release', version: GS_VERSION, bundle: opts.bundle, released: true };
}

/** Lease adapter over Drive: constrained BY CONSTRUCTION to LEASE-*.json
    markers at the bundle's top level plus a read of live bundle.md. It can
    neither write nor remove anything else; promotion remains the sole
    writer of live state. */
function leaseAdapter_(bundleId) {
  var id = props_().getProperty('STORE_FOLDER_ID');
  if (!id) return null;
  var store = DriveApp.getFolderById(id);
  var hit = null;
  for (var r = 0; r < TYPE_ROOTS_.length; r++) {
    var it = store.getFoldersByName(TYPE_ROOTS_[r]);
    if (!it.hasNext()) continue;
    var bit = it.next().getFoldersByName(bundleId);
    if (bit.hasNext()) { hit = bit.next(); break; }
  }
  if (!hit) return null;
  return {
    listMarkers: function () {
      var out = [];
      var files = hit.getFiles();
      while (files.hasNext()) { var n = files.next().getName(); if (LEASE_MARKER_RE_.test(n)) out.push(n); }
      return out;
    },
    readMarker: function (name) {
      if (!LEASE_MARKER_RE_.test(name)) return null;
      var f = hit.getFilesByName(name);
      return f.hasNext() ? f.next().getBlob().getDataAsString('UTF-8') : null;
    },
    writeMarker: function (name, content) {
      if (!LEASE_MARKER_RE_.test(name)) return null;
      var f = hit.getFilesByName(name);
      if (f.hasNext()) f.next().setContent(content); else hit.createFile(name, content, 'application/json');
      return true;
    },
    removeMarker: function (name) {
      if (!LEASE_MARKER_RE_.test(name)) return null;
      var f = hit.getFilesByName(name);
      while (f.hasNext()) f.next().setTrashed(true);
      return true;
    },
    readLive: function () {
      var f = hit.getFilesByName('bundle.md');
      return f.hasNext() ? f.next().getBlob().getDataAsString('UTF-8') : null;
    }
  };
}

/* ---- op=allocid (P2M8 A2): central non-serial ID allocation ---------------
   Replaces the client's nextSeq, whose next-number-from-a-possibly-stale-
   cached-list let concurrent members pick the same NNNN. The endpoint hands
   out a RANDOM unused value in the four-digit field, collision-checked
   against materialized bundle ids plus unexpired reservations, under the
   endpoint's serialization (the same LockService critical-section pattern
   the daemon acquire uses). Non-serial is a requirement, not a preference:
   sequential IDs leak activity level (the German tank problem) to anyone
   enumerating the public index. Reservations expire after 24 hours so an
   allocation that never materializes returns to the pool; the honest
   residual (random-in-range still weakly leaks density to a large-fraction
   enumerator) is recorded in the design doc Section 10 and deferred to a
   grammar-widening spec decision. */
var ALLOC_RESV_TTL_MS_ = 24 * 60 * 60 * 1000;
var ALLOC_TYPES_ = { INFO: 'information', PROB: 'problems', PROJ: 'projects', ACTN: 'actions' };

function allocIdCore_(rfsa, resv, opts) {
  var type = opts.type || '';
  if (!(type in ALLOC_TYPES_)) return { ok: false, error: 'allocid type must be one of: INFO, PROB, PROJ, ACTN' };
  var nowMs = opts.nowMs || Date.now();
  var year = String(opts.year || new Date(nowMs).getUTCFullYear());
  if (!/^\d{4}$/.test(year)) return { ok: false, error: 'allocid year must be four digits' };
  var randFn = opts.randFn || Math.random;
  var key = type + '-' + year;
  // Materialized numbers for this TYPE-YEAR, from the store itself.
  var used = {};
  var ids = (rfsa.listBundles()[ALLOC_TYPES_[type]] || []);
  var re = new RegExp('^' + type + '-' + year + '-(\\d{4})-');
  for (var i = 0; i < ids.length; i++) {
    var m = re.exec(ids[i]);
    if (m) used[m[1]] = true;
  }
  // Reservations: prune expired and materialized, then collision-check.
  var all = resv.read();
  var list = (all[key] || []).filter(function (e) {
    return e && e.n && e.ts && (nowMs - Date.parse(e.ts) < ALLOC_RESV_TTL_MS_) && !used[e.n];
  });
  var reserved = {};
  for (var j = 0; j < list.length; j++) reserved[list[j].n] = true;
  var taken = Object.keys(used).length + list.length;
  if (taken >= 9990) return { ok: false, error: 'the ' + key + ' number space is exhausted; widening the grammar is a spec decision' };
  var number = null;
  for (var t = 0; t < 200; t++) {
    var cand = String(Math.floor(randFn() * 10000));
    while (cand.length < 4) cand = '0' + cand;
    if (!used[cand] && !reserved[cand]) { number = cand; break; }
  }
  if (number === null) return { ok: false, error: 'allocation could not find a free number; retry' };
  list.push({ n: number, ts: new Date(nowMs).toISOString() });
  all[key] = list;
  resv.write(all);
  return { ok: true, op: 'allocid', version: GS_VERSION, type: type, year: year, number: number, id_prefix: type + '-' + year + '-' + number };
}

/** Reservation ledger over Script Properties: endpoint-internal state,
    never store state (the store stays authoritative; a lost ledger costs
    nothing but a transiently narrower random pool). */
function allocResvAdapter_() {
  return {
    read: function () {
      try { return JSON.parse(props_().getProperty('ALLOC_RESERVATIONS') || '{}'); } catch (e) { return {}; }
    },
    write: function (obj) { props_().setProperty('ALLOC_RESERVATIONS', JSON.stringify(obj)); }
  };
}


/* ---- P2M8 B2: the CDN publisher (design Section 6) ------------------------
   A derived edge replica of the PUBLIC subset, never a source of truth:
   wipe it and republish. One genuinely new component, the publisher:
   single-writer, on the accelerator's existing time trigger, writing the
   index plus RELEASED documents to Cloudflare R2 through its S3-compatible
   API via UrlFetchApp. The publish gate and the ratification gate are the
   same gate: only verified information bundles' registered documents reach
   the edge; collected-but-unratified material never does. Documents are
   content-addressed (doc/<capture.sha256>), immutable, cache-forever; the
   index rides a 60-second TTL. Publish documents first, index last (the
   manifest-strictly-last commit order applied to publishing). Trust comes
   from the register hash, never the transport: the client verifies every
   CDN fetch against capture.sha256, so a tampered edge copy is rejected.

   Config: four Script Properties the operator adds in Project Settings
   (R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).
   Unconfigured, every publish pass is a recorded no-op. */

var R2_DOC_CACHE_ = 'public, max-age=31536000, immutable';
var R2_INDEX_CACHE_ = 'public, max-age=60';
var R2_SINGLE_PUT_MAX_ = 32 * 1024 * 1024;  // UrlFetchApp payload headroom
var R2_MIN_PART_ = 5 * 1024 * 1024;         // S3 multipart floor (all but last)
var R2_BUDGET_BYTES_ = 60 * 1024 * 1024;    // per-cadence upload budget

function r2Config_() {
  var p = props_();
  var accountId = p.getProperty('R2_ACCOUNT_ID');
  var bucket = p.getProperty('R2_BUCKET');
  var keyId = p.getProperty('R2_ACCESS_KEY_ID');
  var secret = p.getProperty('R2_SECRET_ACCESS_KEY');
  if (!accountId || !bucket || !keyId || !secret) return null;
  return { accountId: accountId, bucket: bucket, keyId: keyId, secret: secret, host: accountId + '.r2.cloudflarestorage.com' };
}

/* SigV4 over UNSIGNED-PAYLOAD. Unsigned payload is deliberate: hashing a
   31MB byte array through the platform digest is the exact 8-bytes-per-
   element OOM profile 1.11.0 retired, and transport integrity is not the
   trust root anyway (the register hash is; TLS covers the wire). Signed
   headers are host, x-amz-content-sha256, x-amz-date. All primitives are
   injectable so the battery cross-validates the signature against an
   independent node implementation. */
function sigv4AmzDate_(nowMs) {
  return new Date(nowMs).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}
function sigv4UriEncode_(s, keepSlash) {
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (/[A-Za-z0-9\-._~]/.test(c) || (keepSlash && c === '/')) { out += c; continue; }
    var bytes = Utilities.newBlob(c).getBytes();
    for (var b = 0; b < bytes.length; b++) { var v = (bytes[b] + 256) % 256; out += '%' + (v < 16 ? '0' : '') + v.toString(16).toUpperCase(); }
  }
  return out;
}
function sigv4CanonicalQuery_(query) {
  var keys = [];
  for (var k in query) if (Object.prototype.hasOwnProperty.call(query, k)) keys.push(k);
  keys.sort();
  var parts = [];
  for (var i = 0; i < keys.length; i++) parts.push(sigv4UriEncode_(keys[i], false) + '=' + sigv4UriEncode_(String(query[keys[i]]), false));
  return parts.join('&');
}
function sigv4Sign_(cfg, method, path, query, nowMs, hmacFn, sha256fn) {
  var amzDate = sigv4AmzDate_(nowMs);
  var day = amzDate.slice(0, 8);
  var scope = day + '/auto/s3/aws4_request';
  var canonicalHeaders = 'host:' + cfg.host + '\n' + 'x-amz-content-sha256:UNSIGNED-PAYLOAD\n' + 'x-amz-date:' + amzDate + '\n';
  var signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  var canonical = method + '\n' + sigv4UriEncode_(path, true) + '\n' + sigv4CanonicalQuery_(query || {}) + '\n'
    + canonicalHeaders + '\n' + signedHeaders + '\n' + 'UNSIGNED-PAYLOAD';
  var toSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + scope + '\n' + sha256fn(canonical);
  var kDate = hmacFn(day, 'AWS4' + cfg.secret);
  var kRegion = hmacFn('auto', kDate);
  var kService = hmacFn('s3', kRegion);
  var kSigning = hmacFn('aws4_request', kService);
  var sigBytes = hmacFn(toSign, kSigning);
  var hex = '';
  for (var i = 0; i < sigBytes.length; i++) { var v = (sigBytes[i] + 256) % 256; hex += (v < 16 ? '0' : '') + v.toString(16); }
  return {
    amzDate: amzDate,
    authorization: 'AWS4-HMAC-SHA256 Credential=' + cfg.keyId + '/' + scope
      + ', SignedHeaders=' + signedHeaders + ', Signature=' + hex
  };
}
function hmacSha256_(message, key) {
  var msg = typeof message === 'string' ? Utilities.newBlob(message).getBytes() : message;
  var k = typeof key === 'string' ? Utilities.newBlob(key).getBytes() : key;
  return Utilities.computeHmacSha256Signature(msg, k);
}

/** One signed R2 request. fetchFn injectable for the battery; the live
    wrapper rides UrlFetchApp with muteHttpExceptions. */
function r2Request_(cfg, method, key, query, body, contentType, cacheControl, nowMs, fetchFn, extraHeaders) {
  var path = '/' + cfg.bucket + '/' + key;
  var sig = sigv4Sign_(cfg, method, path, query, nowMs, hmacSha256_, sha256Hex_);
  var headers = {
    'x-amz-date': sig.amzDate,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    'Authorization': sig.authorization
  };
  if (cacheControl) headers['Cache-Control'] = cacheControl;
  if (extraHeaders) for (var eh in extraHeaders) if (Object.prototype.hasOwnProperty.call(extraHeaders, eh)) headers[eh] = extraHeaders[eh];
  var qs = sigv4CanonicalQuery_(query || {});
  var url = 'https://' + cfg.host + path + (qs ? '?' + qs : '');
  var opts = { method: method.toLowerCase(), headers: headers, muteHttpExceptions: true };
  if (body !== null && body !== undefined) {
    // Strings ride as-is; byte arrays MUST wrap in a Blob (UrlFetchApp
    // coerces a raw number array to a comma-joined string, which would
    // corrupt every binary document silently).
    if (typeof body === 'string') { opts.payload = body; if (contentType) opts.contentType = contentType; }
    else { opts.payload = Utilities.newBlob(body, contentType || 'application/octet-stream'); }
  }
  var res = fetchFn(url, opts);
  return { code: res.getResponseCode(), text: res.getContentText ? res.getContentText() : '' };
}

/** The R2 adapter the publisher core drives: exists, put, and the
    multipart trio, all against one bucket, nothing else. */
function r2Adapter_(cfg, fetchFn, nowFn) {
  var fx = fetchFn || function (u, o) { return UrlFetchApp.fetch(u, o); };
  var now = nowFn || function () { return Date.now(); };
  return {
    exists: function (key) {
      // UrlFetchApp supports get/post/put/patch/delete, never HEAD: the
      // presence probe is a one-byte ranged GET (200 or 206 = exists,
      // 404 = absent; anything else reads absent, and a redundant PUT of
      // a content-addressed object is harmless).
      var code = r2Request_(cfg, 'GET', key, {}, null, null, null, now(), fx, { 'Range': 'bytes=0-0' }).code;
      return code === 200 || code === 206;
    },
    put: function (key, body, contentType, cacheControl) {
      return r2Request_(cfg, 'PUT', key, {}, body, contentType, cacheControl, now(), fx).code === 200;
    },
    multipartCreate: function (key, contentType, cacheControl) {
      var r = r2Request_(cfg, 'POST', key, { uploads: '' }, '', contentType, cacheControl, now(), fx);
      var m = /<UploadId>([^<]+)<\/UploadId>/.exec(r.text || '');
      return r.code === 200 && m ? m[1] : null;
    },
    multipartPart: function (key, uploadId, partNumber, body) {
      var r = r2Request_(cfg, 'PUT', key, { partNumber: String(partNumber), uploadId: uploadId }, body, 'application/octet-stream', null, now(), fx);
      return r.code === 200;
    },
    multipartComplete: function (key, uploadId, partCount) {
      var xml = '<CompleteMultipartUpload>';
      for (var i = 1; i <= partCount; i++) xml += '<Part><PartNumber>' + i + '</PartNumber></Part>';
      xml += '</CompleteMultipartUpload>';
      return r2Request_(cfg, 'POST', key, { uploadId: uploadId }, xml, 'application/xml', null, now(), fx).code === 200;
    }
  };
}

var R2_MIME_ = { pdf: 'application/pdf', json: 'application/json', md: 'text/markdown', txt: 'text/plain', csv: 'text/csv', svg: 'image/svg+xml', html: 'text/html' };
function r2MimeFor_(name) {
  var m = /\.([a-z0-9]+)$/i.exec(String(name));
  return (m && R2_MIME_[m[1].toLowerCase()]) || 'application/octet-stream';
}

/**
 * The publisher core: pure, adapter-driven, node-testable. env supplies
 * readIndex(), listFiles(id), readText(id,p), readBytes(id,p), decodeB64
 * (the embed's b64ToBytes), and r2 (the adapter above). Scope: verified
 * information bundles' registered documents, content-addressed at
 * doc/<capture.sha256>, skip-if-exists (idempotent; content-addressed
 * objects never mutate). Budgeted per cadence; whatever does not fit
 * resumes next tick. Documents first, index last, every pass.
 */
function publisherCore_(env, opts) {
  var budget = (opts && opts.budgetBytes) || R2_BUDGET_BYTES_;
  var deadlineMs = (opts && opts.deadlineMs) || null;
  var nowFn = (opts && opts.nowFn) || function () { return Date.now(); };
  var idxRaw = env.readIndex();
  if (idxRaw === null) return { status: 'noop', note: 'no index yet' };
  var idx;
  try { idx = JSON.parse(idxRaw); } catch (e) { return { status: 'error', note: 'stored index unreadable' }; }
  var uploaded = [], failed = [], skipped = 0, spent = 0, deferred = 0;
  var ids = [];
  for (var id in idx.bundles) if (Object.prototype.hasOwnProperty.call(idx.bundles, id)) ids.push(id);
  ids.sort();
  for (var i = 0; i < ids.length; i++) {
    var e = idx.bundles[ids[i]];
    // The ratification fence IS the publish gate: verified information only.
    if (!e || e.object_type !== 'information' || e.current_state !== 'verified') continue;
    var provRaw = env.readText(ids[i], 'data/provenance.json');
    if (provRaw === null) continue;
    var reg;
    try { reg = JSON.parse(provRaw); } catch (er) { continue; /* the gate reports */ }
    var docs = reg && reg.documents ? reg.documents : [];
    var sizes = null; // lazily listed, once per bundle that needs an upload
    for (var d = 0; d < docs.length; d++) {
      var doc = docs[d];
      var cap = doc && doc.capture ? doc.capture : {};
      if (!/^[0-9a-f]{64}$/.test(cap.sha256 || '')) continue;
      var key = 'doc/' + cap.sha256;
      if (env.r2.exists(key)) { skipped++; continue; }
      if (sizes === null) {
        sizes = {};
        var listing = env.listFiles(ids[i]);
        var fl = listing ? listing.files : [];
        for (var f = 0; f < fl.length; f++) sizes[fl[f].path] = fl[f].size;
      }
      var parts = (doc.parts && doc.parts.length) ? doc.parts : [{ file: doc.file }];
      var total = 0;
      for (var p0 = 0; p0 < parts.length; p0++) total += sizes[parts[p0].file] || 0;
      if (spent + total > budget && (uploaded.length > 0 || spent > 0)) { deferred++; continue; }
      // The TIME budget outranks the byte budget: Apps Script kills an
      // execution at six minutes, and a killed pass publishes nothing it
      // had not already PUT. Past the deadline, defer; the next pass
      // resumes exactly here (skip-if-exists makes resumption free).
      if (deadlineMs !== null && nowFn() > deadlineMs) { deferred++; continue; }
      var res = publishOneDoc_(env, ids[i], doc, parts, sizes, key);
      if (res.ok) { uploaded.push(key); spent += total; }
      else failed.push({ key: key, note: res.note });
    }
  }
  // Index last, every pass: the public docket, short TTL.
  var indexPublished = env.r2.put('index.json', idxRaw, 'application/json', R2_INDEX_CACHE_);
  return { status: failed.length ? 'partial' : 'ok', uploaded: uploaded, skipped: skipped,
    deferred: deferred, failed: failed, indexPublished: indexPublished, spentBytes: spent };
}

/** One document to the edge: multipart part-by-part when the store holds
    parts (peak residency one part, the 1.11.0 discipline), a single PUT
    otherwise; legacy base64-at-rest decodes per part so the edge serves
    TRUE bytes matching capture.sha256. */
function publishOneDoc_(env, bundleId, doc, parts, sizes, key) {
  var cap = doc.capture || {};
  var mime = r2MimeFor_(doc.file);
  function readPart(pf) {
    if (cap.encoding === 'utf8') return env.readText(bundleId, pf);
    if (cap.encoding === 'base64') { var t = env.readText(bundleId, pf); return t === null ? null : env.decodeB64(t); }
    return env.readBytes(bundleId, pf);
  }
  if (parts.length === 1) {
    var one = readPart(parts[0].file);
    if (one === null) return { ok: false, note: 'missing ' + parts[0].file };
    return env.r2.put(key, one, mime, R2_DOC_CACHE_) ? { ok: true } : { ok: false, note: 'put failed' };
  }
  // Multipart requires every non-final part at the S3 floor; a store whose
  // parts sit below it (never the oversize-split case) falls back to a
  // bounded reassembly.
  var floorOk = true;
  for (var i = 0; i < parts.length - 1; i++) if ((sizes[parts[i].file] || 0) < R2_MIN_PART_) floorOk = false;
  if (!floorOk) {
    var total = 0;
    for (var t0 = 0; t0 < parts.length; t0++) total += sizes[parts[t0].file] || 0;
    if (total > R2_SINGLE_PUT_MAX_) return { ok: false, note: 'parts below the multipart floor and whole exceeds the single-put ceiling' };
    var joined = [];
    for (var j = 0; j < parts.length; j++) {
      var pb = readPart(parts[j].file);
      if (pb === null) return { ok: false, note: 'missing ' + parts[j].file };
      for (var b = 0; b < pb.length; b++) joined.push(pb[b]);
    }
    return env.r2.put(key, joined, mime, R2_DOC_CACHE_) ? { ok: true } : { ok: false, note: 'put failed' };
  }
  var uploadId = env.r2.multipartCreate(key, mime, R2_DOC_CACHE_);
  if (!uploadId) return { ok: false, note: 'multipart create failed' };
  for (var n = 0; n < parts.length; n++) {
    var bytes = readPart(parts[n].file);
    if (bytes === null) return { ok: false, note: 'missing ' + parts[n].file };
    if (!env.r2.multipartPart(key, uploadId, n + 1, bytes)) return { ok: false, note: 'part ' + (n + 1) + ' failed' };
  }
  return env.r2.multipartComplete(key, uploadId, parts.length) ? { ok: true } : { ok: false, note: 'multipart complete failed' };
}

/** The trigger-side publish pass: unconfigured is a silent recorded no-op. */
function publishTick_(opts) {
  var cfg = r2Config_();
  if (cfg === null) return { status: 'noop', note: 'R2 not configured' };
  var rfsa = storeReadAdapter_();
  var ridx = indexWriteAdapter_();
  if (rfsa === null || ridx === null) return { status: 'noop', note: 'store not configured' };
  var env = {
    readIndex: function () { return ridx.readIndex(); },
    listFiles: function (id) { return rfsa.listFiles(id); },
    readText: function (id, p) { return rfsa.readText(id, p); },
    readBytes: function (id, p) { return rfsa.readBytes(id, p); },
    decodeB64: function (t) { return bioChecksModule_().b64ToBytes(t); },
    r2: r2Adapter_(cfg)
  };
  return publisherCore_(env, opts || {});
}

/** Operator entry point, runnable from the editor's function dropdown
    (no trailing underscore): ONE publish pass with a wide deadline and
    the result in the execution log. Run repeatedly to drain a first-pass
    backlog; every pass is idempotent and resumes where the last stopped. */
function publishNow() {
  var r = publishTick_({ deadlineMs: Date.now() + 250 * 1000 });
  appendLog_({ ts: new Date().toISOString(), caller: 'editor', op: 'publish', outcome: r.status || 'noop',
    uploaded: (r.uploaded || []).length, skipped: r.skipped || 0, deferred: r.deferred || 0, failed: (r.failed || []).length });
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}


function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web endpoint: trigger-only or read-only, store-authoritative (Tech Arch
 * 10.4). Token checked strictly BEFORE any work. The op registry is CLOSED:
 * promote, status (read-only), selftest (fixed standing intent against one
 * designated scratch bundle), and the ratified Q1 client slate: list
 * (store or per-bundle enumeration, Drive metadata only), read (one file's
 * content as a UTF-8 JSON string with sha256, encoding utf8), and writepkg
 * (POST, text/plain body, pending paths ONLY: the transport into the
 * pending queue; promotion remains the sole writer of live state). The
 * P2M8 A2 client-enabling slate adds: readbundle (read-only; a bundle's
 * tier-1/2 files in one response, documents and history elided to a
 * listing), lease (acquire/renew/release; writes ONLY a validated
 * self-expiring LEASE-<actor>.json advisory marker and returns the current
 * bundle.md as the edit base; the CAS stays the correctness floor and
 * promotion never consults the lease), and allocid (random unused NNNN
 * under the endpoint serialization; writes only the Script Properties
 * reservation ledger, never store state). No op ingests caller content
 * into live state; general RPC is permanently prohibited; additions
 * require spec-level admission, never convenience.
 */
function doGet(e) {
  var token = (e && e.parameter && e.parameter.token) || '';
  var cls = tokenClass_(token);
  var ts = new Date().toISOString();
  if (!cls) {
    appendLog_({ ts: ts, caller: 'invalid', op: 'unknown', outcome: 'rejected' });
    return json_({ ok: false, error: 'unauthorized' });
  }
  if (e && e.parameter && e.parameter.dev) {
    // Development companion hook: inert unless promotion-service-dev.gs is
    // installed in the project. Production deployments delete that file; the
    // status op reports devMode so its presence is never silent.
    if (typeof devHandler_ === 'function') return devHandler_(e, cls);
    return json_({ ok: false, error: 'dev mode not installed' });
  }
  var op = (e && e.parameter && e.parameter.op) || 'promote';
  if (VALID_OPS.indexOf(op) === -1) {
    appendLog_({ ts: ts, caller: cls, op: op, outcome: 'bad_op' });
    return json_({ ok: false, error: 'unknown op; valid: ' + VALID_OPS.join(', ') });
  }
  var only = (e && e.parameter && e.parameter.bundle) || null;
  if (only && !BIO_ID_RE.test(only)) {
    appendLog_({ ts: ts, caller: cls, op: op, outcome: 'bad_selector' });
    return json_({ ok: false, error: 'invalid bundle selector' });
  }

  if (op === 'tick' || op === 'sweep' || op === 'duescan' || op === 'attest') {
    // Doorbell invocation (slate Sections 1-3): any token class, selector
    // narrows never directs. tick takes an optional bundle selector (already
    // grammar-validated above); sweep takes an optional sweep-id selector
    // validated against the ratified sweep set inside the core (unknown ids
    // are no-ops); duescan is selector-free. Nothing the caller supplies
    // becomes state; every locator fetched is named by the store.
    var dsel = op === 'tick' ? only : (op === 'sweep' ? ((e && e.parameter && e.parameter.sweep) || null) : null);
    var dres = runDaemonOp_(op, dsel, 'endpoint-' + cls);
    appendLog_({ ts: ts, caller: cls, op: op, outcome: dres.status || 'ok', packaged: (dres.packaged || []).length });
    return json_(dres);
  }

  if (op === 'list') {
    var rfsa = storeReadAdapter_();
    if (rfsa === null) return json_({ ok: true, op: 'list', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var lres = only ? listBundleCore_(rfsa, only) : listStoreCore_(rfsa);
    appendLog_({ ts: ts, caller: cls, op: 'list', outcome: lres.ok ? 'ok' : 'error', bundle: only || '' });
    return json_(lres);
  }

  if (op === 'read') {
    var file = (e && e.parameter && e.parameter.file) || '';
    if (!only) { appendLog_({ ts: ts, caller: cls, op: 'read', outcome: 'bad_selector' }); return json_({ ok: false, error: 'read requires a bundle selector' }); }
    var rfsa2 = storeReadAdapter_();
    if (rfsa2 === null) return json_({ ok: true, op: 'read', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var rres = readFileCore_(rfsa2, sha256Hex_, only, file);
    appendLog_({ ts: ts, caller: cls, op: 'read', outcome: rres.ok ? 'ok' : 'error', bundle: only, file: file });
    return json_(rres);
  }

  if (op === 'readbundle') {
    if (!only) { appendLog_({ ts: ts, caller: cls, op: 'readbundle', outcome: 'bad_selector' }); return json_({ ok: false, error: 'readbundle requires a bundle selector' }); }
    var rfsa4 = storeReadAdapter_();
    if (rfsa4 === null) return json_({ ok: true, op: 'readbundle', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var rbres = readBundleCore_(rfsa4, sha256Hex_, only);
    appendLog_({ ts: ts, caller: cls, op: 'readbundle', outcome: rbres.ok ? 'ok' : 'error', bundle: only });
    return json_(rbres);
  }

  if (op === 'lease') {
    if (!only) { appendLog_({ ts: ts, caller: cls, op: 'lease', outcome: 'bad_selector' }); return json_({ ok: false, error: 'lease requires a bundle selector' }); }
    var lfa = leaseAdapter_(only);
    if (lfa === null) {
      var lset = props_().getProperty('STORE_FOLDER_ID');
      if (!lset) return json_({ ok: true, op: 'lease', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
      appendLog_({ ts: ts, caller: cls, op: 'lease', outcome: 'error', bundle: only });
      return json_({ ok: false, error: 'unknown bundle: ' + only });
    }
    // The acquire path is guarded by a brief LockService critical section
    // (the daemon-acquire pattern) to shrink the marker race window; the
    // marker protocol itself remains the coordination story, and the CAS
    // remains the correctness floor either way.
    var lp = e.parameter;
    var lopts = { action: lp.action || '', bundle: only, actor: lp.actor || '', handle: lp.handle || '',
      secret: lp.secret || '', uuidFn: function () { return Utilities.getUuid(); } };
    var lres;
    if (lopts.action === 'acquire' && typeof LockService !== 'undefined') {
      var llk = LockService.getScriptLock();
      var got = llk.tryLock(3000);
      try { lres = leaseCore_(lfa, sha256Hex_, lopts); } finally { if (got) llk.releaseLock(); }
    } else {
      lres = leaseCore_(lfa, sha256Hex_, lopts);
    }
    appendLog_({ ts: ts, caller: cls, op: 'lease', outcome: lres.ok ? (lopts.action + (lres.granted === false ? '_denied' : '')) : 'error', bundle: only });
    return json_(lres);
  }

  if (op === 'allocid') {
    var rfsa5 = storeReadAdapter_();
    if (rfsa5 === null) return json_({ ok: true, op: 'allocid', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var aopts = { type: (e.parameter.type || '').toUpperCase() };
    var ares;
    if (typeof LockService !== 'undefined') {
      var alk = LockService.getScriptLock();
      if (!alk.tryLock(3000)) { appendLog_({ ts: ts, caller: cls, op: 'allocid', outcome: 'busy' }); return json_({ ok: false, error: 'allocation busy; retry' }); }
      try { ares = allocIdCore_(rfsa5, allocResvAdapter_(), aopts); } finally { alk.releaseLock(); }
    } else {
      ares = allocIdCore_(rfsa5, allocResvAdapter_(), aopts);
    }
    appendLog_({ ts: ts, caller: cls, op: 'allocid', outcome: ares.ok ? 'ok' : 'error', type: aopts.type });
    return json_(ares);
  }

  if (op === 'readindex') {
    // 0.11.7 (P2M8 A3 measurement): the client's index poll. ONE Drive
    // read of the stored derived artifact, regenerated by the trigger on
    // its own cadence (timeTick) and by op=reindex on demand. The live
    // A3 fire measured force-and-fetch at 40-45s per poll (29 bundle
    // reads plus hashing per call); reading the cadence-regenerated
    // artifact is the CDN model applied to Phase A, and B3 moves this
    // exact artifact to a static edge read. Freshness is bounded by the
    // trigger cadence and surfaced by the index's own generated stamp.
    var ridx = indexWriteAdapter_();
    if (ridx === null) return json_({ ok: true, op: 'readindex', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var idxRaw = ridx.readIndex();
    if (idxRaw === null) return json_({ ok: false, error: 'no index yet; run op=reindex once' });
    appendLog_({ ts: ts, caller: cls, op: 'readindex', outcome: 'ok' });
    var idxParsed;
    try { idxParsed = JSON.parse(idxRaw); } catch (er) { return json_({ ok: false, error: 'stored index unreadable; run op=reindex' }); }
    return json_({ ok: true, op: 'readindex', version: GS_VERSION, bytes: idxRaw.length, sha256: sha256Hex_(idxRaw), index: idxParsed });
  }

  if (op === 'reindex') {
    var rfsa3 = storeReadAdapter_();
    var ifsw = indexWriteAdapter_();
    if (rfsa3 === null || ifsw === null) return json_({ ok: true, op: 'reindex', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var content = buildIndexCore_(rfsa3, new Date().toISOString(), sha256Hex_, bioChecksModule_().parseFrontmatter);
    var wres = ifsw.writeIndex(content);
    var parsedIdx = JSON.parse(content);
    appendLog_({ ts: ts, caller: cls, op: 'reindex', outcome: 'ok' });
    // 0.11.6 (P2M8 A3): the response carries the index it just built.
    // Force-and-fetch in one call: the client's index poll gets a
    // fresh-by-construction docket with no separate read path and no
    // registry addition (op=read's selector rail correctly rejects the
    // index folder, which is not a bundle). The Phase B CDN replaces this
    // poll with a static edge read of the same artifact.
    return json_({ ok: true, op: 'reindex', version: GS_VERSION, count: Object.keys(parsedIdx.bundles).length, bytes: wres.bytes, sha256: sha256Hex_(content), index: parsedIdx });
  }

  if (op === 'status' && only) {
    var pr = storeReadAdapter_();
    var pw = storeWriteAdapter_();
    var rootsSeen = [];
    if (pr !== null) {
      var rb = pr.listBundles();
      for (var rk in rb) if (rb[rk].length > 0 || true) rootsSeen.push(rk + ':' + rb[rk].length);
    }
    appendLog_({ ts: ts, caller: cls, op: 'status-probe', outcome: 'ok', bundle: only });
    return json_({ ok: true, op: 'status', version: GS_VERSION, probe: {
      bundle: only,
      rootsSeen: rootsSeen,
      readFinds: pr !== null && pr.listFiles(only) !== null,
      writeFinds: pw !== null ? pw.probeBundle(only) : null
    }});
  }

  if (op === 'status') {
    var pend = listPending_(only);
    if (pend === null) return json_({ ok: true, op: 'status', version: GS_VERSION, configured: false, guidance: 'run setup() in the script editor' });
    var names = [];
    for (var i = 0; i < pend.length; i++) names.push({ bundle: pend[i].name, created: pend[i].created });
    var trig = false;
    var trs = ScriptApp.getProjectTriggers();
    for (var g = 0; g < trs.length; g++) if (trs[g].getHandlerFunction() === 'timeTick') trig = true;
    var storeName = '';
    try { storeName = DriveApp.getFolderById(props_().getProperty('STORE_FOLDER_ID')).getName(); } catch (err) { }
    appendLog_({ ts: ts, caller: cls, op: 'status', outcome: 'ok' });
    // gateVersion/gateSha (0.12.3): which bio-checks the DEPLOYED code
    // actually carries. Without these an operator who pastes a new build
    // has no remote way to confirm the paste landed: selftest passes on
    // any coherent embed, old or new, so it proves integrity but never
    // freshness. Read from the same two constants the integrity check in
    // bioChecksModule_ uses, so they cannot drift from what is running.
    // NOTE: no apostrophes in this block. The conformance assertion that
    // setup is unreachable from the endpoint strips single-quoted strings
    // with a regex, and a stray apostrophe unbalances it.
    var dupCount = 0;
    try { dupCount = duplicateBundleIds_(DriveApp.getFolderById(props_().getProperty('STORE_FOLDER_ID'))).length; } catch (er) { dupCount = -1; }
    // registry (0.12.6): whether the key registry the gate injects actually
    // RESOLVED, and against what. Same reasoning as gateVersion: the gate
    // calls releaseRegistry_ on every run, but a registry that silently
    // failed to resolve looks identical from outside while both fences are
    // off, and would only announce itself later, when every release depends
    // on it. Reports no key material, only whether it loaded and its hash.
    var regInfo;
    try {
      var rg = releaseRegistry_();
      if (!rg) regInfo = { configured: false, note: 'no RELEASE_REGISTRY_BUNDLE property; pre-migration assertion' };
      else if (rg.unavailable) regInfo = { configured: true, resolved: false, reason: rg.reason };
      else regInfo = { configured: true, resolved: true, sha256: String(rg.sha256).slice(0, 12),
                       signers: (rg.signers.match(/^[^#\s][^\n]*$/gm) || []).length,
                       rootKeysPinned: rg.rootKeys.length, rootSignature: !!rg.rootSignature,
                       migrationInstant: rg.migrationInstant, rootEnforceFrom: rg.rootEnforceFrom };
    } catch (er) { regInfo = { configured: true, resolved: false, reason: 'status probe threw: ' + (er && er.message) }; }
    return json_({ ok: true, op: 'status', version: GS_VERSION, gateVersion: BIO_CHECKS_VERSION, gateSha: BIO_CHECKS_SHA256.slice(0, 12), duplicateBundleIds: dupCount, registry: regInfo, devMode: (typeof devHandler_ === 'function'), configured: true, store: storeName, triggerInstalled: trig, proxyConfigured: !!props_().getProperty('PROXY_URL'), r2Configured: r2Config_() !== null, pendingQueue: names });
  }

  if (op === 'selftest') {
    var st = selftest_();
    if (st === null) return json_({ ok: false, error: 'not configured yet: open the script editor and run setup()' });
    appendLog_({ ts: ts, caller: cls, op: 'selftest', outcome: st.status, key: st.key || '' });
    return json_({ ok: st.status === 'promoted' && st.verified === true, op: 'selftest', result: st });
  }

  var results = sweepQueue_('endpoint-' + cls, only);
  if (results === null) {
    return json_({ ok: false, error: 'not configured yet: open the script editor and run setup()' });
  }
  appendLog_({ ts: ts, caller: cls, op: 'promote', outcome: 'ok', results: results });
  return json_({ ok: true, results: results });
}

/** The fixed selftest bundle body: conforming information@1, standing intent, no caller content ever. */
function selftestBundle_(created) {
  return '---\n' +
    'id: ' + SELFTEST_ID + '\n' +
    'object_type: information\nschema: information@1\n' +
    'title: "Accelerator selftest bundle: exercised by op=selftest, safe to trash"\n' +
    'current_state: collected\nprior_state: null\n' +
    'created: "' + created + '"\nlast_updated: "' + created + '"\n' +
    'produced_by:\n  mode: interactive_chat\n  capability_tier: standard\n' +
    'group: believe-in-oakland\nreferences: []\nstate_history: []\n' +
    'annotations_open: 0\nreeval_pending: false\nvisuals: []\n' +
    'source:\n  locator: "promotion-service.gs op=selftest"\n  authority: "accelerator standing intent"\n  retrieved: "' + created.slice(0, 10) + '"\n' +
    'source_status: unchanged\ncriticality: supporting\nclassification: fact\n' +
    'monitoring:\n  enabled: false\n  frequency: none\n  last_checked: "' + created + '"\n' +
    'content_hash: ""\n---\n\n' +
    '## Summary\n\nA designated scratch bundle exercised by the accelerator selftest operation. Each run packages and promotes one update here, proving the full loop on the live substrate. Safe to trash; the next selftest recreates it.\n\n' +
    '## Provenance Notes\n\nWritten entirely server-side from standing intent; the endpoint accepts no caller content.\n\n' +
    '## Session Log\n\n' +
    '### Session ' + created.slice(0, 10) + ' | Selftest bundle creation | interactive_chat\nTrigger: "op=selftest"\nReferences loaded: standing intent in promotion-service.gs\nChanges: Selftest bundle created.\nBase: creation\nGate: conforming by construction\n\n' +
    '## Review Notes\n';
}

/** Full-loop selftest: package then promote one update in the designated scratch bundle. */
function selftest_() {
  var id = props_().getProperty('STORE_FOLDER_ID');
  if (!id) return null;
  var store = DriveApp.getFolderById(id);
  var infoIt = store.getFoldersByName('information');
  var infoRoot = infoIt.hasNext() ? infoIt.next() : store.createFolder('information');
  var bIt = infoRoot.getFoldersByName(SELFTEST_ID);
  var bundleFolder = bIt.hasNext() ? bIt.next() : infoRoot.createFolder(SELFTEST_ID);
  var fsa = driveAdapter_(bundleFolder);
  var now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  if (!fsa.exists('bundle.md')) fsa.writeText('bundle.md', selftestBundle_(now));
  var live = fsa.readText('bundle.md');
  var base = fsa.sha256(live);
  var entry = '### Session ' + now.slice(0, 10) + ' | Selftest run ' + now + ' | interactive_chat\nTrigger: "op=selftest"\nReferences loaded: standing intent in promotion-service.gs\nChanges: Selftest package promoted by the accelerator itself.\nBase: ' + base.slice(0, 12) + '\nGate: conforming by construction\n\n';
  var v2 = live.replace(/last_updated: "[^"]*"/, 'last_updated: "' + now + '"').replace('## Review Notes', entry + '## Review Notes');
  fsa.writeText('bundle.md.pending', v2);
  var expect = fsa.sha256(v2);
  fsa.writeText('PENDING_PROMOTION.json', JSON.stringify({ target: SELFTEST_ID, base: base, files: [{ name: 'bundle.md', sha256: expect }], created: now, author: 'selftest', skill_version: '0.1.0' }));
  // Gated (0.11.1, incident hardening): the selftest package is
  // non-mechanical, so it earns promotion against the embedded gate like
  // every member package. The ungated selftest promoter was the hole that
  // carried the P2M4 refusal-test alias forward; DEPLOY-P2M4's pass-side
  // claim is true from this rev on. A selftest refusal is itself the
  // finding: it means live state is malformed and needs the sanctioned
  // repair before the loop can prove anything.
  var rfsaST = storeReadAdapter_();
  var res = promoteBundleCore_(fsa, {
    actor: 'selftest',
    gate: function (image) { return gateCheckBundle_(SELFTEST_ID, image, rfsaST ? { resolveTarget: driveResolveTarget_(rfsaST) } : {}); },
    decode: function (b64text) { return bioChecksModule_().b64ToBytes(b64text); }
  });
  var after = '';
  try { after = fsa.sha256(fsa.readText('bundle.md')); } catch (err) { }
  return { status: res.status, key: res.key || '', note: res.note || '', verified: after === expect };
}

/** Time-driven trigger entry. */
function timeTick() {
  // Ambient cadence (slate Sections 1-3): daemon operations first, each of
  // which promotes its own packages through the convergent promoter, then the
  // general queue sweep for anything else pending. A disabled policy makes
  // every daemon call a recorded no-op; a dead trigger degrades to the kernel
  // guarantee (the due slate is exportable and a member runs it by hand).
  try {
    var tick = runDaemonOp_('tick', null, 'trigger');
    if (tick && tick.status !== 'noop' && (tick.results || []).length) {
      appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'tick', outcome: tick.status, packaged: (tick.packaged || []).length, fetches: tick.fetches || 0 });
    }
    var due = runDaemonOp_('duescan', null, 'trigger');
    if (due && due.status !== 'noop' && (due.packaged || []).length) {
      appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'duescan', outcome: due.status, packaged: due.packaged.length });
    }
    var at = runDaemonOp_('attest', null, 'trigger');
    if (at && at.status !== 'noop' && (at.packaged || []).length) {
      appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'attest', outcome: at.status, packaged: at.packaged.length });
    }
    var sw = runDaemonOp_('sweep', null, 'trigger');
    if (sw && sw.status !== 'noop' && (sw.packaged || []).length) {
      appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'sweep', outcome: sw.status, packaged: sw.packaged.length });
    }
  } catch (e) {
    appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'daemon', outcome: 'error', note: String(e).slice(0, 200) });
  }
  var results = sweepQueue_('trigger');
  if (results && results.length) appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'promote', outcome: 'ok', results: results });
  // 0.11.7: regenerate the derived index each cadence, AFTER promotions
  // land, so the client's readindex poll sees a checkpoint at most one
  // cadence stale (the B2 publish-lag posture, applied in Phase A).
  try {
    var rfsaT = storeReadAdapter_();
    var ifswT = indexWriteAdapter_();
    if (rfsaT !== null && ifswT !== null) {
      ifswT.writeIndex(buildIndexCore_(rfsaT, new Date().toISOString(), sha256Hex_, bioChecksModule_().parseFrontmatter));
    }
  } catch (ei) {
    appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'reindex', outcome: 'error', note: String(ei).slice(0, 200) });
  }
  // B2: the publish pass, AFTER the index regen, so the edge replica
  // publishes the freshest artifact each cadence. Unconfigured R2 makes
  // this a silent no-op; failures log and never disturb the kernel path.
  try {
    var pub = publishTick_({ deadlineMs: Date.now() + 120 * 1000 });
    if (pub && pub.status !== 'noop' && ((pub.uploaded || []).length || (pub.failed || []).length || pub.status === 'error')) {
      appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'publish', outcome: pub.status,
        uploaded: (pub.uploaded || []).length, skipped: pub.skipped || 0, deferred: pub.deferred || 0, failed: (pub.failed || []).length });
    }
  } catch (ep) {
    appendLog_({ ts: new Date().toISOString(), caller: 'trigger', op: 'publish', outcome: 'error', note: String(ep).slice(0, 200) });
  }
}

// ---------------------------------------------------------------------------
// One-run group setup (v0.3). Operator-initiated in the script editor only;
// never reachable from doGet. Idempotent: safe to re-run (e.g., after the web
// app is deployed and WEBAPP_EXEC_URL is set, to stamp the exec URL into the
// credential files).
// Secrets are generated HERE, server-side: no human types them, no AI sees them.
// ---------------------------------------------------------------------------

var DEFAULT_STORE_NAME = 'CivicOS';
var TYPE_ROOT_NAMES = ['information', 'problems', 'projects', 'actions', 'index'];
var TOKEN_KEYS = ['TOKEN_CLIENT', 'TOKEN_CHAT', 'TOKEN_AGENTIC', 'TOKEN_INTERNAL'];

function newToken_() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

/** All LIVE folders with this exact name; Drive name lookups include trashed items, which must never count. */
function liveFoldersNamed_(name) {
  var it = DriveApp.getFoldersByName(name);
  var live = [];
  while (it.hasNext()) { var f = it.next(); if (!f.isTrashed()) live.push(f); }
  return live;
}

function keysFolder_(storeName, store) {
  var existing = liveFoldersNamed_(storeName + '-keys');
  if (existing.length > 0) return existing[0]; // reuse wherever it lives; never create a second
  var parents = store.getParents();
  var parent = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  return parent.createFolder(storeName + '-keys');
}

function writeKeyFile_(folder, name, content) {
  var it = folder.getFilesByName(name);
  if (it.hasNext()) it.next().setContent(content); // overwrite in place: rerunning never duplicates
  else folder.createFile(name, content, 'text/plain');
}

/**
 * Resolve the caller-facing endpoint base. Precedence: PROXY_URL (fetch-proxy
 * Worker, accelerator/proxy/worker.js; preferred when set), then the
 * operator-pasted WEBAPP_EXEC_URL Script Property, then getService().getUrl()
 * ONLY if it is a genuine /exec URL. A /dev URL is refused by construction:
 * getService().getUrl() returns the head deployment's dev-mode URL when
 * invoked from the editor (the only context setup() runs in), and a /dev URL
 * demands editor sign-in, so it is never a valid caller endpoint. v0.6
 * stamped it into the credential files silently; this helper cannot.
 */
function resolveEndpointBase_(props) {
  var proxy = props.getProperty('PROXY_URL') || null;
  if (proxy) return proxy;
  var manual = props.getProperty('WEBAPP_EXEC_URL') || null;
  if (manual) {
    if (manual.indexOf('/exec') === -1 || manual.indexOf('/dev') !== -1) {
      throw new Error("Script Property WEBAPP_EXEC_URL must be the versioned /exec web-app URL " +
        "(Deploy > Manage deployments > Web app URL), not a /dev URL.");
    }
    return manual;
  }
  var svc = null;
  try { svc = ScriptApp.getService().getUrl(); } catch (e) { svc = null; }
  if (svc && svc.indexOf('/exec') !== -1) return svc; // web-app-invoked context only
  return null; // undeployed, or editor context returning /dev: never stamp that
}

/**
 * One-run group setup. SAFE TO RUN AGAIN ANYTIME: rerunning never rotates
 * tokens, never duplicates folders, files, or triggers, and always converges
 * on a correct configuration. Operator-initiated in the editor only; never
 * reachable from the endpoint. Secrets are generated here, server-side.
 */
function setup(groupFolderName) {
  var explicit = groupFolderName !== undefined && groupFolderName !== null && String(groupFolderName).trim() !== '';
  var storeName = explicit ? String(groupFolderName).trim() : DEFAULT_STORE_NAME;

  var matches = liveFoldersNamed_(storeName);
  var store, createdStore = false;
  if (matches.length === 1) {
    store = matches[0];
  } else if (matches.length === 0) {
    if (explicit) {
      throw new Error("No folder named '" + storeName + "' was found in your Drive (folders in the trash do not count). " +
        "Check the spelling and capitalization, or run setup() with no name to create and use '" + DEFAULT_STORE_NAME + "'.");
    }
    store = DriveApp.getRootFolder().createFolder(storeName);
    createdStore = true;
  } else {
    var urls = [];
    for (var u = 0; u < matches.length; u++) urls.push(matches[u].getUrl());
    throw new Error(matches.length + " folders are all named '" + storeName + "', and setup() will not guess. " +
      "Rename the ones that are not the group store, then run setup() again. They are: " + urls.join('   '));
  }

  var props = props_();
  props.setProperty('STORE_FOLDER_ID', store.getId());

  for (var r = 0; r < TYPE_ROOT_NAMES.length; r++) {
    if (!store.getFoldersByName(TYPE_ROOT_NAMES[r]).hasNext()) store.createFolder(TYPE_ROOT_NAMES[r]);
  }

  for (var k = 0; k < TOKEN_KEYS.length; k++) {
    if (!props.getProperty(TOKEN_KEYS[k])) props.setProperty(TOKEN_KEYS[k], newToken_());
  }

  var have = false;
  var triggers = ScriptApp.getProjectTriggers();
  for (var g = 0; g < triggers.length; g++) if (triggers[g].getHandlerFunction() === 'timeTick') have = true;
  if (!have) ScriptApp.newTrigger('timeTick').timeBased().everyMinutes(10).create();

  var keys = keysFolder_(storeName, store);
  var pingBase = resolveEndpointBase_(props);
  var urlLine = pingBase ? pingBase
    : '(deploy the web app, copy its /exec URL into Script Property WEBAPP_EXEC_URL, then run setup() once more)';

  writeKeyFile_(keys, 'README.txt',
    'Caller credentials for the ' + storeName + ' promotion endpoint.\n' +
    'NEVER move these files into the store folder, never mirror them, never paste\n' +
    'them anywhere except the one destination each file names. Rotation: run\n' +
    "rotateToken('client'|'chat'|'agentic'|'internal') in the script editor, then\n" +
    're-copy that one file to its destination. Deleted or edited these files by\n' +
    'accident? Run setup() again; it rewrites them.\n');
  writeKeyFile_(keys, 'client-token.txt',
    'Destination: the group PWA client, Settings > Promotion endpoint.\n' +
    'URL: ' + urlLine + '\nToken: ' + props.getProperty('TOKEN_CLIENT') + '\n');
  writeKeyFile_(keys, 'chat-endpoint.txt',
    'Destination: the claude.ai project knowledge (paste this whole block).\n\n' +
    'Promotion endpoint for this group. After writing a pending package, ping:\n' +
    urlLine + '?token=' + props.getProperty('TOKEN_CHAT') + '\n' +
    'Optionally target one bundle: append &bundle=<CANONICAL-ID>\n' +
    'If the ping fails, nothing is lost: the next client open or agentic session promotes.\n' +
    'If the response is a sign-in page instead of JSON, the web app was deployed with\n' +
    'the wrong access setting: redeploy with Who has access: Anyone.\n');
  writeKeyFile_(keys, 'agentic-token.txt',
    'Destination: the Product A skill package config on the agentic machine.\n' +
    'URL: ' + urlLine + '\nToken: ' + props.getProperty('TOKEN_AGENTIC') + '\n');
  writeKeyFile_(keys, 'internal-token.txt',
    'Destination: none. Reserved for the script itself (future internal calls). Leave here.\n' +
    'Token: ' + props.getProperty('TOKEN_INTERNAL') + '\n');

  var lines = [];
  lines.push('SETUP COMPLETE. Safe to run again anytime: rerunning never rotates tokens and never duplicates anything.');
  lines.push('Group store: ' + storeName + (createdStore ? ' (newly created)' : '') + '  ' + store.getUrl());
  lines.push('Credentials folder: ' + storeName + '-keys  ' + keys.getUrl());
  if (pingBase) {
    if (props.getProperty('PROXY_URL')) {
      lines.push('Proxy URL (' + pingBase + ') captured into the credential files; AI fetchers can now reach the endpoint directly.');
    } else {
      lines.push('Endpoint base (' + pingBase + ') captured into the credential files.');
    }
  } else {
    lines.push('NEXT: deploy the web app (Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone), ' +
      'copy the /exec URL into Script Property WEBAPP_EXEC_URL (Project Settings > Script Properties), ' +
      'then run setup() once more to stamp it into the credential files.');
  }
  lines.push('THEN: open ' + storeName + '-keys and copy each file to the one destination named inside it.');
  return lines.join('\n');
}

/** Rotate one caller class token and rewrite the credential files. */
function rotateToken(callerClass) {
  var cls = String(callerClass === undefined || callerClass === null ? '' : callerClass).trim().toLowerCase();
  var key = 'TOKEN_' + cls.toUpperCase();
  if (TOKEN_KEYS.indexOf(key) === -1) {
    throw new Error("Unknown caller class '" + callerClass + "'. Use one of: rotateToken('client'), rotateToken('chat'), rotateToken('agentic'), rotateToken('internal').");
  }
  props_().setProperty(key, newToken_());
  return setup(); // rewrites the credential files with the new value; idempotent everywhere else
}