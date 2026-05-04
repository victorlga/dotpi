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

mkdir -p "$PI_DIR/extensions" "$PI_DIR/skills"

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

echo "==> Done. Restart pi (or run /reload) to pick up changes."
