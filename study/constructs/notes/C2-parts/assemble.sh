#!/bin/bash
# usage: assemble.sh "<certificate line>"
P=/tmp/claude-0/-home-user-bio/cff08118-2267-58b9-b5ac-fdc5ba0d3e81/scratchpad/notes/C2-parts
OUT=/tmp/claude-0/-home-user-bio/cff08118-2267-58b9-b5ac-fdc5ba0d3e81/scratchpad/notes/C2.md
{
echo "# C2: DECISIONS-design-branch.txt"
echo "## Reading certificate"
echo "$1"
echo "## What these documents are (3–6 lines each)"
cat $P/ABOUT.md
for s in TIME ORGANISATIONS LAW COURTS ANALYSIS QUESTIONS DOCTRINE; do
  echo "## $s"
  if [ -s $P/$s.md ]; then cat $P/$s.md; else echo "none in DECISIONS-design-branch.txt"; fi
done
echo "## Cross-construct observations (connections between constructs these documents make or imply)"
cat $P/CROSS.md
} > $OUT
