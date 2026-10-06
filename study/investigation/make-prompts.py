#!/usr/bin/env python3
"""Writes prompts/<id>.txt from units.json. STUDY stays a placeholder: the starter replaces it with the folder's absolute path."""
import json, os
S = os.path.dirname(os.path.abspath(__file__))
U = json.load(open(f"{S}/units.json"))
for uid, u in U.items():
    p = (f"You are unit {uid} of the investigation study for BIO/CivicOS (phase {u['phase']}). The study folder is STUDY; "
         f"the product tree is STUDY/../.. (a git worktree; do not run git). Read STUDY/RESUME.md and STUDY/PROTOCOL.md whole, first, "
         f"and follow PROTOCOL.md's general rules and its section {u['section']}. Your output file: STUDY/{u['out']} "
         f"(if it exists, you are resuming: follow the checkpoint rule). Your scope: {u['scope']}\n"
         f"When done, reply with three lines only: your unit id, your output path, and its size in words.\n")
    open(f"{S}/prompts/{uid}.txt", "w").write(p)
print(len(U), "prompts written")
