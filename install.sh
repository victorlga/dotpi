#!/usr/bin/env bash
# Bootstrap a fresh machine: symlink this repo's contents into ~/.pi/agent/
# and run `npm install` for any extension/skill that needs deps.
#
# Idempotent: re-running is safe. Existing files are backed up to *.backup.<ts>.

set -euo pipefail

REPO_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="${HOME}/.pi/agent"
TS="$(date +%Y%m%d-%H%M%S)"

echo "==> Repo: $REPO_DIR"
echo "==> Target: $PI_DIR"

mkdir -p "$PI_DIR/extensions" "$PI_DIR/skills" "$PI_DIR/prompts" "$PI_DIR/themes"

link() {
  local src="$1" dst="$2"
  if [[ -L "$dst" ]]; then
    # Already a symlink — replace silently
    rm "$dst"
  elif [[ -e "$dst" ]]; then
    echo "    backup: $dst -> $dst.backup.$TS"
    mv "$dst" "$dst.backup.$TS"
  fi
  ln -s "$src" "$dst"
  echo "    link:   $dst -> $src"
}

echo "==> Linking top-level config files"
for name in settings.json SYSTEM.md APPEND_SYSTEM.md AGENTS.md; do
  [[ -f "$REPO_DIR/$name" ]] && link "$REPO_DIR/$name" "$PI_DIR/$name"
done

echo "==> Linking extensions"
shopt -s nullglob
for entry in "$REPO_DIR/extensions"/*; do
  link "$entry" "$PI_DIR/extensions/$(basename "$entry")"
done

echo "==> Linking skills"
for entry in "$REPO_DIR/skills"/*; do
  link "$entry" "$PI_DIR/skills/$(basename "$entry")"
done

echo "==> Linking prompt templates"
for entry in "$REPO_DIR/prompts"/*.md; do
  link "$entry" "$PI_DIR/prompts/$(basename "$entry")"
done

echo "==> Linking themes"
for entry in "$REPO_DIR/themes"/*.json; do
  link "$entry" "$PI_DIR/themes/$(basename "$entry")"
done

echo "==> Installing npm deps where needed"
# Find any package.json under extensions/ or skills/ (one level deep into
# subdirs, two levels for skills/<name>/scripts/) and run npm install.
while IFS= read -r -d '' pkg; do
  dir="$(dirname "$pkg")"
  echo "    npm install in $dir"
  ( cd "$dir" && npm install --silent )
done < <(find "$REPO_DIR/extensions" "$REPO_DIR/skills" \
            -name node_modules -prune -o \
            -name package.json -print0 2>/dev/null)

echo
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║ install.sh finished. Manual steps below.                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo
echo "  1. Sign in to your model provider(s). API keys are NOT synced via dotpi."
echo "        pi          # then run /login inside pi"
echo
echo "  2. Reload the current pi session (or just start a new one):"
echo "        /reload      # inside an existing pi session"
echo
echo "  3. Optional, per-extension/skill prerequisites:"
echo
echo "     - extensions/review.ts   PR mode needs: gh auth status   (run 'gh auth login')"
echo "     - skills/web-browser     needs Google Chrome or Chromium installed"
echo "                              (override path with BROWSER_BIN=/path/to/chrome)"
echo "     - skills/mcporter        needs 'mcporter' CLI installed if you use it"
echo
echo "  4. Personalize AGENTS.md (loaded as a context file on every session):"
echo "        \$EDITOR ${REPO_DIR}/AGENTS.md"
echo
echo "  5. Per-project templates (NOT auto-linked, copy as needed):"
echo "        ls ${REPO_DIR}/templates/"
echo "     For example, in a project that has a .pi/ dir:"
echo "        cp ${REPO_DIR}/templates/REVIEW_GUIDELINES.md <project>/   # used by /review"
echo
echo "  6. After future updates on another machine:"
echo "        /dotpi-reload      # pulls + re-runs install.sh + reloads pi"
echo
