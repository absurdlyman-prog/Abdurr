#!/bin/bash
set -euo pipefail

# Only needed in remote (Claude Code on the web) containers, which start
# without node_modules. Local sessions manage their own installs.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# npm install (not ci) so the cached container state is reused across sessions.
npm install --no-audit --no-fund
