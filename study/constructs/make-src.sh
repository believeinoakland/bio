#!/bin/sh
# Rebuild the study's plain-text sources (src/) exactly as phase 1 read them.
# Usage: sh make-src.sh <bio checkout> <study dir>
# Pinned: coord at 5393f63ea5 (archived DEC ledger); product at 31f30a6c7d (tranche/T32), design branch claude/gallant-brown-zg0wc1 at bb387fffb2.
set -e
R=${1:?bio checkout}; S=${2:?study dir}
mkdir -p "$S"; S=$(cd "$S" && pwd)   # absolute, since the script changes directory
P=31f30a6c7dd64b46250f15ca71e6a43377ec93b9
B=bb387fffb27a381f36d6e261e5a26b00a79a167c
cd "$R"; git fetch -q origin claude/gallant-brown-zg0wc1 tranche/T32 || true
mkdir -p "$S/src/req" "$S/src/action-design"
show(){ git show "$1:$2"; }
for f in $(git ls-tree --name-only $P docs/architecture/ docs/development/ | grep '\.md$'); do show $P "$f" | fold -s -w 900 > "$S/src/$(basename "$f" .md).txt"; done
for f in $(git ls-tree -r --name-only $P docs/development/action-design/); do show $P "$f" | fold -s -w 900 > "$S/src/action-design/$(echo "${f#docs/development/action-design/}" | tr / _).txt"; done
for f in $(git ls-tree --name-only $P build/requirements/ | grep '\.md$'); do show $P "$f" | fold -s -w 900 > "$S/src/req/$(basename "$f" .md).txt"; done
h2t(){ show $B "docs/development/ux-substrate/$1" | python3 -c "
import sys,html,re
t=sys.stdin.read(); t=re.sub(r'(?is)<(style|script)[^>]*>.*?</\1>','',t)
t=re.sub(r'(?i)<br\s*/?>|</(p|div|li|h[1-6]|tr|section|article|summary|details|table|ul|ol|dd|dt)>','\n',t)
t=re.sub(r'<[^>]+>','',t); t=html.unescape(t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n\n',t)
print(t)" | fold -s -w 900 > "$S/src/design-$2.txt"; }
h2t journeys.html journeys; h2t design-principles.html principles; h2t brand-and-voice.html brand; h2t measures-map.html measures
for v in matter-page plan-page start-and-send surfaces; do h2t views/$v.html view-$v; done
show $B docs/development/ux-substrate/HANDOFF.md | fold -s -w 900 > "$S/src/design-HANDOFF.txt"
show $B docs/development/ux-substrate/ux-experience.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
for k in ['audiences','useCases','journeyExperience','surfaceRules']:
  open('$S/src/design-ux-'+k+'.txt','w').write(json.dumps(d[k],indent=1,ensure_ascii=False))"
for f in "$S"/src/design-ux-*.txt; do fold -s -w 900 "$f" > "$f.f" && mv "$f.f" "$f"; done
show $B docs/development/DECISIONS.md | fold -s -w 900 > "$S/src/DECISIONS-design-branch.txt"
rm -f "$S/src/DECISIONS.txt"
# Bob's archived rulings DEC-1..DEC-67, on the old process's `coord` branch, split at DEC-34 (line 2057).
git fetch -q origin coord || true
C=5393f63ea5700a8efae2f98cc44efdf3bd238e78
show $C docs/archive/ledgers/DECISIONS-2026-08.md | fold -s -w 900 > "$S/src/.dec-archive"
head -n 2056 "$S/src/.dec-archive" > "$S/src/DECISIONS-archive-part1.txt"; tail -n +2057 "$S/src/.dec-archive" > "$S/src/DECISIONS-archive-part2.txt"; rm -f "$S/src/.dec-archive"
# Build-side Action design papers and research (reader C13).
mkdir -p "$S/src/plan"
for f in build/plan/research-oakland-calendar.md build/plan/draft-planning-skill.md build/plan/draft-filing-templates.md build/plan/action-design/PATH.md build/plan/action-design/UX-ANSWERS.md build/plan/action-design/action-plans.md build/plan/action-design/deltas.md build/plan/action-design/HANDOFF.md build/plan/action-design/tests.md; do
  n=$(echo "${f#build/plan/}" | tr / _); show $P "$f" | fold -s -w 900 > "$S/src/plan/${n%.md}.txt"; done
echo "src rebuilt: $(find "$S/src" -type f | wc -l) files"
