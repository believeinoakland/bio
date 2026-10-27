---
name: civicos-bob
description: CivicOS BOB, the architecture session: invoke at the start of every BOB session, before anything else.
hooks:
  PreToolUse:
    - hooks:
        - type: command
          command: 'node "/home/user/civicos-process/tools/hooks.mjs" bob pre'
  Stop:
    - hooks:
        - type: command
          command: 'node "/home/user/civicos-process/tools/hooks.mjs" bob stop'
---
!`cat "/home/user/civicos-process/roles/BOB.md" || echo "STOP: the process repository is not at /home/user/civicos-process; attach it, then invoke this skill again."`
