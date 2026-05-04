# dotpi maintenance

The user's pi configuration (extensions, skills, settings, and this file) lives in a git repo called **dotpi**. The contents of `~/.pi/agent/` are symlinks into that repo, so any edit to an extension, skill, or system-prompt file in `~/.pi/agent/` is also an edit inside the repo.

To find the repo on this machine, resolve the symlink for this file:

```bash
readlink -f ~/.pi/agent/APPEND_SYSTEM.md | xargs dirname
```

That directory is the dotpi working tree.

## When to update dotpi automatically

After you (the assistant) help the user with any of the following, **commit and push the change to dotpi** without being asked:

- Creating, modifying, or deleting a file under `~/.pi/agent/extensions/`
- Creating, modifying, or deleting a file under `~/.pi/agent/skills/`
- Editing `~/.pi/agent/settings.json`
- Editing `~/.pi/agent/SYSTEM.md`, `~/.pi/agent/APPEND_SYSTEM.md`, or `~/.pi/agent/AGENTS.md`
- Adding new system-prompt files of the same kinds

Workflow:

1. Make the change directly under `~/.pi/agent/...` (or equivalently in the repo path — they're the same files via symlink).
2. If a new top-level file was added (e.g. a brand-new extension dir, a new skill, a new `AGENTS.md`), run the repo's `install.sh` so the symlink exists.
3. From the dotpi repo: `git add -A && git commit -m "<concise message>" && git push`.
4. Mention in your reply that dotpi was updated and pushed.

If the user explicitly says "don't push" or "local only", skip the push step but still commit. If a commit would be empty (no tracked changes), skip silently.

## When NOT to touch dotpi

- Changes inside arbitrary project directories (anything outside `~/.pi/agent/`)
- Anything under `~/.pi/agent/sessions/`, `~/.pi/agent/auth.json`, `~/.pi/agent/bin/`, or any `node_modules/` — these are intentionally not tracked
- Experimental edits the user is clearly testing and hasn't accepted yet

## Notes

- `auth.json` must never be committed. The `.gitignore` already excludes it; do not work around that.
- Personal absolute paths (e.g. the user's home directory layout) should not leak into committed files. Prefer `~`, `$HOME`, or `readlink`-based resolution over hardcoded paths.
