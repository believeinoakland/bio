---
name: neoprocess
description: "neoProcess: invoke at the start of every session with your role as the argument (bob, job, lane or root), before anything else."
---
!`node "/home/user/neoprocess/tools/proc.mjs" reading --role "$ARGUMENTS" --product "." || echo "STOP: the process repository is not at /home/user/neoprocess, or the role is not bob, job, lane or root; attach it, then invoke this skill again with your role."`
