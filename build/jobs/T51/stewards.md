# stewards (T51)

**Status** · session_01UTbi5VPuYNMbViZaenQLKS · depth 2 · WORKING · handled B1

## J1 · QUESTION

stewards' modules.json uses is [test-support, instance-setup]; converting its 56 words findings needs localize from bio-plane/src/setup-words/index.mjs, in src and in tests, and checks/architecture.mjs rejects an import of a module not in uses. instance-setup does not re-export localize/word. My best reading: BOB adds setup-words to stewards' uses in build/modules.json and to its requirements' Uses section (the same edit every other converted module got). I am proceeding on that reading with the imports in place; the architecture check will name this one line until you add it. If you would rather route the words some other way, answer and I will follow.
