---
name: civicos-job
description: CivicOS module job: invoke at the start of every module job session, before anything else.
hooks:
  PreToolUse:
    - hooks:
        - type: command
          command: 'node "/home/user/civicos-process/tools/hooks.mjs" job pre'
  Stop:
    - hooks:
        - type: command
          command: 'node "/home/user/civicos-process/tools/hooks.mjs" job stop'
---
!`cat "/home/user/civicos-process/roles/JOB.md" || echo "STOP: the process repository is not at /home/user/civicos-process; attach it, then invoke this skill again."`
