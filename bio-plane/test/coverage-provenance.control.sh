#!/bin/sh
# M0-16 / D-238 — the negative-control arms for the walks this item guarded,
# committed so the next session RE-RUNS them in one step instead of re-deriving
# how to break the subject. `coverage-provenance.test.mjs` declares them; this
# file runs the ones that must be armed against the REAL tree.
#
#   sh test/coverage-provenance.control.sh arm1   plant an untracked SUITE here
#   sh test/coverage-provenance.control.sh arm2   plant an untracked FLEET MANIFEST here
#   sh test/coverage-provenance.control.sh arm3   the same file merely IGNORED
#   sh test/coverage-provenance.control.sh arm4   neuter the check; reach must fail
#   sh test/coverage-provenance.control.sh arm5   over-strictness: plant nothing
#
# EVERY PATH IS DERIVED FROM THIS FILE'S OWN LOCATION (M0-10's finding: a harness
# rooted at a hardcoded absolute path wiped a shared ground), and every restore is
# checked by sha256 AND by `cmp` against a UNIQUELY NAMED per-arm pristine copy —
# a harness that named two snapshots from the path alone overwrote the first with
# the second (UI-38).
#
# AND THE CORPUS IS PRINTED AND FLOORED IN EVERY ARM THAT TAKES A SNAPSHOT. M0-15's
# own harness used `xargs -a`, which BSD xargs does not have; the manifest came out
# EMPTY, `cmp` compared two empty files, and the restore reported "byte-identical"
# with the sha256 of the EMPTY STRING. A headline assertion passing over an empty
# corpus, caught only because the size was printed. That is why the guard is here.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)      # bio-plane/test
PLANE=$(cd "$HERE/.." && pwd)            # bio-plane
WORK=$(cd "$PLANE/.." && pwd)            # this worktree
ARM=${1:-}

snapshot () {   # $1 = manifest file, $2 = digest file ; prints and floors the corpus
  ( cd "$WORK" && git ls-tree -r --name-only HEAD -- bio-plane/test bio-plane/scripts ) | sort > "$1"
  while IFS= read -r f; do shasum -a 256 "$WORK/$f"; done < "$1" | sort > "$2"
  N=$(wc -l < "$2" | tr -d ' ')
  echo "tracked estate snapshot: $N files"
  [ "$N" -lt 50 ] && { echo "CORPUS TOO SMALL — this check would prove NOTHING. Aborting."; exit 2; }
  return 0
}

report () {     # what the two guarded instruments say about the tree right now
  echo "--- coverage.mjs ---"
  ( cd "$PLANE" && node scripts/coverage.mjs 2>&1 ) | sed -n '/^provenance:/,/See scripts/p'
  echo "--- hygiene.test.mjs (provenance block) ---"
  ( cd "$PLANE" && node test/hygiene.test.mjs 2>&1 ) | sed -n '/M0-16/,$p' | grep -e '^provenance:' -e '^ *PASS' -e '^ *FAIL' -e 'class census' -e '(UNTRACKED)' -e 'staged,'
}

case "$ARM" in
arm1)
  # (1a) PLANT AN UNTRACKED SUITE IN THE REAL TREE. Every unguarded-until-now walk
  # must NAME it. Held open beside it, the over-strictness half: an untracked
  # NON-suite in the same directory must produce no word at all.
  # DECLARED must-fire: coverage names m016-arm1-phantom.test.mjs as UNTRACKED, and
  #   prints contaminated vs reproducible register figures; hygiene names it too.
  # DECLARED must-not-fire: the .md, and every committed suite.
  LIST=$(mktemp); BEFORE=$(mktemp); AFTER=$(mktemp)
  snapshot "$LIST" "$BEFORE" || exit 2
  PH="$PLANE/test/m016-arm1-phantom.test.mjs"
  ND="$PLANE/test/m016-arm1-notes.md"
  printf '/* no control declared: this file is a phantom, not a suite anybody wrote here */\nconsole.log("m016-arm1: 57 pass, 0 fail");\n' > "$PH"
  printf 'not a suite, and untracked on purpose\n' > "$ND"
  report
  rm -f "$PH" "$ND"
  while IFS= read -r f; do shasum -a 256 "$WORK/$f"; done < "$LIST" | sort > "$AFTER"
  echo "restore: manifest lines before=$(wc -l < "$BEFORE" | tr -d ' ') after=$(wc -l < "$AFTER" | tr -d ' ')"
  cmp "$BEFORE" "$AFTER" && echo "restore: tracked estate byte-identical (cmp, not only sha256)"
  rm -f "$LIST" "$BEFORE" "$AFTER"
  ;;

arm2)
  # (2) THE LARGER HOLE: AN UNTRACKED FLEET MANIFEST, which enrols a whole
  # DIRECTORY rather than one file. Armed ALONE, arm1 held open (no phantom suite).
  # DECLARED must-fire: coverage NAMES ghost-worker/fleet-member.json as a MANIFEST,
  #   names the suite it admitted, and the FLEET count rises from 2 to 3.
  # DECLARED must-not-fire: nothing in bio-plane/test/ is named.
  LIST=$(mktemp); BEFORE=$(mktemp); AFTER=$(mktemp)
  snapshot "$LIST" "$BEFORE" || exit 2
  G="$WORK/m016-ghost-worker"
  mkdir -p "$G/src" "$G/test"
  printf '{"name":"m016-ghost-worker"}\n' > "$G/fleet-member.json"
  printf 'const SURFACE = {\n  version: { mutating: false },\n};\nexport { SURFACE };\n' > "$G/src/index.mjs"
  printf 'console.log("/version");\n' > "$G/test/ghost.test.mjs"
  echo "--- coverage.mjs FLEET line and provenance ---"
  ( cd "$PLANE" && node scripts/coverage.mjs 2>&1 ) | grep -e '^FLEET' -e '^provenance:' -e 'ghost' -e 'NOT IN ANY COMMIT'
  rm -rf "$G"
  while IFS= read -r f; do shasum -a 256 "$WORK/$f"; done < "$LIST" | sort > "$AFTER"
  echo "restore: manifest lines before=$(wc -l < "$BEFORE" | tr -d ' ') after=$(wc -l < "$AFTER" | tr -d ' ')"
  cmp "$BEFORE" "$AFTER" && echo "restore: tracked estate byte-identical (cmp, not only sha256)"
  echo "ghost directory removed: $([ -e "$G" ] && echo NO || echo yes)"
  rm -f "$LIST" "$BEFORE" "$AFTER"
  ;;

arm3)
  # (3) THE ARM THAT PROVES `ls-tree` AND NOT `git status`, and the one that would
  # have caught the ORIGINAL defect: the same phantom, merely IGNORED.
  #
  # THE IGNORING IS DONE WITH AN UNTRACKED `.gitignore` THAT LISTS ITSELF, and the
  # first version of this arm did it with `.git/info/exclude` instead — which is a
  # CONTROL FINDING and not a typo. In a worktree `.git` is a FILE pointing at
  # `<common>/worktrees/<id>`, which has no `info/` directory, so the append failed
  # with ENOENT, the exclude was NEVER WRITTEN, `git status` was NOT empty, and the
  # arm measured arm (1) over again while looking like it had fired. It was caught
  # by the printed digest of the pristine copy: `e3b0c442...`, the sha256 of the
  # EMPTY STRING — the identical instrument failure M0-15's own harness had, in the
  # same place, for a different reason. The rule that caught both is the same one:
  # PRINT the thing you are about to trust. (Using the COMMON dir's exclude would
  # also have been wrong on this item's own terms: it is shared by all sixty
  # worktrees, which is the hazard D-238 is about.)
  # DECLARED must-fire: `git status --porcelain` is EMPTY, and both instruments
  #   STILL name the file as UNTRACKED.
  LIST=$(mktemp); BEFORE=$(mktemp); AFTER=$(mktemp)
  snapshot "$LIST" "$BEFORE" || exit 2
  PH="$PLANE/test/m016-arm3-phantom.test.mjs"
  GI="$PLANE/test/.gitignore"
  [ -e "$GI" ] && { echo "test/.gitignore ALREADY EXISTS — this arm would clobber it. Aborting."; exit 2; }
  printf 'console.log("m016-arm3: 57 pass, 0 fail");\n' > "$PH"
  printf 'm016-arm3-phantom.test.mjs\n.gitignore\n' > "$GI"
  echo "armed: phantom $(shasum -a 256 "$PH" | cut -d' ' -f1)"
  echo "armed: ignore  $(shasum -a 256 "$GI" | cut -d' ' -f1)"
  echo "git status --porcelain (must be EMPTY — if anything prints, THE ARM DID NOT ARM):"
  ( cd "$WORK" && git status --porcelain ) | sed 's/^/  |/'
  echo "  (end of git status)"
  report
  rm -f "$PH" "$GI"
  echo "disarmed: phantom gone $([ -e "$PH" ] && echo NO || echo yes) · ignore gone $([ -e "$GI" ] && echo NO || echo yes)"
  while IFS= read -r f; do shasum -a 256 "$WORK/$f"; done < "$LIST" | sort > "$AFTER"
  echo "restore: manifest lines before=$(wc -l < "$BEFORE" | tr -d ' ') after=$(wc -l < "$AFTER" | tr -d ' ')"
  cmp "$BEFORE" "$AFTER" && echo "restore: tracked estate byte-identical (cmp, not only sha256)"
  rm -f "$LIST" "$BEFORE" "$AFTER"
  ;;

arm4)
  # (4) NEUTER THE ONE CHECK AND EVERY CALLER'S REACH MUST FAIL AS A DELTA, WITH
  # THE CORPUS PRINTED. This is also the arm that proves the three walks share ONE
  # mechanism: a single edit in scripts/provenance.mjs must move all of them.
  # DECLARED must-fire: coverage-provenance falls from 28 pass to a DELTA;
  #   battery-provenance falls from 23 pass to a DELTA; hygiene's provenance arms fail.
  # DECLARED must-not-fire: nothing else in hygiene moves.
  F="$PLANE/scripts/provenance.mjs"
  SNAP=$(mktemp "${TMPDIR:-/tmp}/arm4.provenance.mjs.pristine.XXXXXX")
  cp "$F" "$SNAP"; echo "pristine: $(shasum -a 256 "$SNAP" | cut -d' ' -f1)"
  node -e '
    const {readFileSync,writeFileSync}=require("fs"); const p=process.argv[1];
    const s=readFileSync(p,"utf8"); const A="  if (!c.off.length) return c;";
    const i=s.indexOf(A);
    if(i<0){console.error("ANCHOR NOT FOUND — the arm would have ARMED BLIND.");process.exit(2);}
    if(s.indexOf(A,i+1)>=0){console.error("ANCHOR OCCURS TWICE — arming blind.");process.exit(2);}
    writeFileSync(p, s.slice(0,i)+"  if (true) return c; /* arm 4: NEUTERED */\n"+s.slice(i+A.length));
  ' "$F" || { cp "$SNAP" "$F"; echo "arm aborted, restored"; exit 2; }
  node --check "$F" || { cp "$SNAP" "$F"; echo "syntax broken, restored"; exit 2; }
  echo "--- coverage-provenance.test.mjs ---"
  ( cd "$PLANE" && node test/coverage-provenance.test.mjs 2>&1 ) | tail -4
  echo "--- battery-provenance.test.mjs ---"
  ( cd "$PLANE" && node test/battery-provenance.test.mjs 2>&1 ) | tail -3
  echo "--- hygiene.test.mjs ---"
  ( cd "$PLANE" && node test/hygiene.test.mjs 2>&1 ) | tail -2
  cp "$SNAP" "$F"
  cmp "$F" "$SNAP" && echo "restore: byte-identical by cmp; sha256 $(shasum -a 256 "$F" | cut -d' ' -f1)"
  echo "--- re-run after restore ---"
  ( cd "$PLANE" && node test/coverage-provenance.test.mjs 2>&1 ) | tail -2
  ( cd "$PLANE" && node test/battery-provenance.test.mjs 2>&1 ) | tail -2
  ( cd "$PLANE" && node test/hygiene.test.mjs 2>&1 ) | tail -2
  rm -f "$SNAP"
  ;;

arm5)
  # (5) OVER-STRICTNESS, ON THE REAL TREE: plant NOTHING. An instrument that cries
  # phantom on honest work gets ignored, which is the same end as one that never
  # fires — so silence here is a result, not the absence of one.
  # DECLARED must-not-fire: no NOT-IN-ANY-COMMIT block anywhere, from either walk.
  report
  ;;

*)
  echo "usage: sh test/coverage-provenance.control.sh arm1|arm2|arm3|arm4|arm5"; exit 1 ;;
esac
