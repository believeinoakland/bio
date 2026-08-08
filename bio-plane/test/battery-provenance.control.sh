#!/bin/sh
# M0-15 / D-238 — the negative-control arms for the battery's provenance report,
# committed so the next session RE-RUNS them in one step instead of re-deriving
# how to break the subject. `battery-provenance.test.mjs` declares them; this
# file is what runs the two that cannot live inside a suite.
#
#   sh test/battery-provenance.control.sh arm1   plant an untracked suite HERE
#   sh test/battery-provenance.control.sh arm2   re-arm the MECHANISM (git stash)
#   sh test/battery-provenance.control.sh arm3   neuter the check; reach must fail
#
# EVERY PATH IS DERIVED FROM THIS FILE'S OWN LOCATION. M0-10's finding was a
# harness rooted at a hardcoded absolute path that wiped a shared ground, and
# this item's own subject is one tree reaching into another — so nothing here
# is written by hand.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)      # bio-plane/test
PLANE=$(cd "$HERE/.." && pwd)            # bio-plane
WORK=$(cd "$PLANE/.." && pwd)            # this worktree
ARM=${1:-}

case "$ARM" in
arm1)
  # (1) THE ARM THIS ITEM EXISTS FOR, run against the REAL tree: plant an
  # UNTRACKED .test.mjs and the battery must NAME it. Held open beside it, arm
  # (4): a tracked suite and an untracked NON-suite must both pass without a word.
  # DECLARED must-fire: the phantom is named. DECLARED must-not-fire: the .md.
  LIST=$(mktemp); BEFORE=$(mktemp); AFTER=$(mktemp)
  ( cd "$PLANE" && git ls-tree -r --name-only HEAD -- test scripts ) | sort > "$LIST"
  # NOTE, a control finding rather than a typo: the first version of this used
  # `xargs -a`, which BSD xargs does not have. The manifest came out EMPTY, `cmp`
  # compared two empty files, and the restore reported "byte-identical" with
  # sha256 e3b0c442... — the digest of the EMPTY STRING. A headline assertion
  # passing over an empty corpus, caught only because the corpus size is PRINTED.
  # That is why the guard below exists and why the count is echoed.
  while IFS= read -r f; do shasum -a 256 "$PLANE/$f"; done < "$LIST" | sort > "$BEFORE"
  N=$(wc -l < "$BEFORE" | tr -d ' ')
  echo "tracked estate snapshot: $N files"
  [ "$N" -lt 50 ] && { echo "CORPUS TOO SMALL — this check would prove NOTHING. Aborting."; exit 2; }

  PH="$PLANE/test/m015-arm1-phantom.test.mjs"
  ND="$PLANE/test/m015-arm1-notes.md"
  printf 'console.log("m015-arm1: 57 pass, 0 fail");\n' > "$PH"
  printf 'not a suite, and untracked on purpose\n' > "$ND"
  ( cd "$PLANE" && node scripts/battery.mjs m015-arm1 surfaced-by ) | tail -14
  rm -f "$PH" "$ND"
  while IFS= read -r f; do shasum -a 256 "$PLANE/$f"; done < "$LIST" | sort > "$AFTER"
  echo "restore: manifest lines before=$N after=$(wc -l < "$AFTER" | tr -d ' ')"
  cmp "$BEFORE" "$AFTER" && echo "restore: tracked estate byte-identical (cmp, not only sha256)"
  rm -f "$LIST" "$BEFORE" "$AFTER"
  ;;

arm2)
  # (2) RE-ARM THE NAMED MECHANISM AND THE PHANTOM MUST REAPPEAR. This is what
  # turns a hypothesis into a diagnosis.
  #
  # IT RUNS IN A THROWAWAY REPOSITORY DELIBERATELY, and that is a finding rather
  # than timidity: the real repository's ONE shared stash stack has live workers
  # on it, and a `push` there would put a phantom where any of them could `pop`
  # it. The behaviour under test is git's, not this repository's.
  # DECLARED must-fire: A's untracked suite appears in B, byte-identical.
  T=$(mktemp -d "${TMPDIR:-/tmp}/m015-arm2-XXXXXX"); R="$T/repo"
  mkdir -p "$R" && git -C "$R" init -q -b main
  git -C "$R" -c user.email=m015@example.invalid -c user.name=M0-15 commit -q --allow-empty -m base
  git -C "$R" worktree add -q -b wtA "$R/.wt/A" main
  git -C "$R" worktree add -q -b wtB "$R/.wt/B" main
  mkdir -p "$R/.wt/A/bio-plane/test"
  printf 'console.log("phantom: 57 pass, 0 fail");\n' > "$R/.wt/A/bio-plane/test/m015-phantom.test.mjs"
  A=$(shasum -a 256 "$R/.wt/A/bio-plane/test/m015-phantom.test.mjs" | cut -d' ' -f1)
  git -C "$R/.wt/A" stash push -u -q -m "arm2: A's untracked suite"
  echo "refs/stash in the COMMON git dir:  $(ls "$R/.git/refs/stash" 2>&1)"
  echo "refs/stash in A's own worktree dir: $(ls "$R/.git/worktrees/A/refs/stash" 2>&1)"
  git -C "$R/.wt/B" stash pop >/dev/null 2>&1
  if [ -f "$R/.wt/B/bio-plane/test/m015-phantom.test.mjs" ]; then
    B=$(shasum -a 256 "$R/.wt/B/bio-plane/test/m015-phantom.test.mjs" | cut -d' ' -f1)
    [ "$A" = "$B" ] && echo "RESULT: PHANTOM REAPPEARED IN B, byte-identical ($A). Mechanism re-armed." \
                    || echo "RESULT: present but CONTENT DIFFERS — investigate."
  else
    echo "RESULT: NO PHANTOM IN B — the hypothesis is WRONG and must be withdrawn."
  fi
  rm -rf "$T"
  ;;

arm3)
  # (3) NEUTER THE CHECK AND ITS REACH MUST FAIL AS A DELTA, CORPUS PRINTED.
  # DECLARED: 23 pass -> 14 pass / 9 fail over a corpus of 7; arms (d)(g)(h) and
  # the reach arm stay GREEN, which is what makes it a delta rather than a
  # collapse. The snapshot is UNIQUELY NAMED per arm: a harness that named two
  # snapshots from the PATH alone overwrote the first with the second (UI-38).
  F="$PLANE/scripts/battery.mjs"
  SNAP=$(mktemp "${TMPDIR:-/tmp}/arm3.battery.mjs.pristine.XXXXXX")
  cp "$F" "$SNAP"; echo "pristine: $(shasum -a 256 "$SNAP" | cut -d' ' -f1)"
  node -e '
    const {readFileSync,writeFileSync}=require("fs"); const p=process.argv[1];
    const s=readFileSync(p,"utf8"); const A="    if (off.length) {";
    const i=s.indexOf(A);
    if(i<0){console.error("ANCHOR NOT FOUND — the arm would have ARMED BLIND.");process.exit(2);}
    if(s.indexOf(A,i+1)>=0){console.error("ANCHOR OCCURS TWICE — arming blind.");process.exit(2);}
    const e=s.indexOf("\n    }\n",i);
    if(e<0){console.error("BLOCK END NOT FOUND.");process.exit(2);}
    writeFileSync(p, s.slice(0,i)+"    if (false) { /* arm 3: NEUTERED */\n"+s.slice(e));
  ' "$F" || { cp "$SNAP" "$F"; echo "arm aborted, restored"; exit 2; }
  node --check "$F" || { cp "$SNAP" "$F"; echo "syntax broken, restored"; exit 2; }
  ( cd "$PLANE" && node test/battery-provenance.test.mjs ) | tail -3
  cp "$SNAP" "$F"
  cmp "$F" "$SNAP" && echo "restore: byte-identical by cmp; sha256 $(shasum -a 256 "$F" | cut -d' ' -f1)"
  ( cd "$PLANE" && node test/battery-provenance.test.mjs ) | tail -3
  rm -f "$SNAP"
  ;;

*)
  echo "usage: sh test/battery-provenance.control.sh arm1|arm2|arm3"; exit 1 ;;
esac
