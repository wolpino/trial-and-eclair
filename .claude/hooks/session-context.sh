#!/usr/bin/env bash
# SessionStart hook: print the top 3 session log entries so every new session starts with them.
set -euo pipefail
LOG="${CLAUDE_PROJECT_DIR:-.}/.cursor/session_log.mdc"
[[ -f "$LOG" ]] || exit 0
echo "Top 3 entries of .cursor/session_log.mdc. Honor 'Do not redo' and 'Resume with' from the newest AGENT_CONTEXT block:"
echo
awk '/^## /{n++} n>=1 && n<=3' "$LOG"
