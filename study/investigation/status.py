#!/usr/bin/env python3
"""Each unit's state from its output alone (missing / partial / done); rewrites STATE.md."""
import json, os
S = os.path.dirname(os.path.abspath(__file__))
U = json.load(open(f"{S}/units.json"))
rows = []
for uid, u in U.items():
    p = f"{S}/{u['out']}"
    if not os.path.exists(p): st = "missing"
    else:
        t = open(p, encoding="utf-8").read()
        st = "done" if "## Sources opened" in t and "<!-- next:" not in t else "partial"
    rows.append((u["phase"], uid, st, u["out"]))
out = "# State\n\n| phase | unit | state | output |\n| --- | --- | --- | --- |\n" + "".join(f"| {a} | {b} | {c} | `{d}` |\n" for a, b, c, d in rows)
open(f"{S}/STATE.md", "w").write(out); print(out)
