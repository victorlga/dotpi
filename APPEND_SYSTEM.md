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
- Adding files under `~/.pi/agent/prompts/` or `~/.pi/agent/themes/`

### Workflow for EXISTING (already symlinked) files

1. Edit them at either path — `~/.pi/agent/...` or the repo path. They're the same file.
2. From the dotpi repo: `git add -A && git commit -m "<concise msg>" && git push`.
3. Mention in your reply that dotpi was updated and pushed.

### Workflow for NEW files (this is the easy mistake)

`~/.pi/agent/extensions/` and `~/.pi/agent/skills/` are real directories that **contain** symlinks. Creating a file directly inside them produces a regular file that is NOT in the repo — `git add -A` from the repo would silently miss it.

For any new file or directory:

1. Resolve the repo path:
   ```bash
   REPO=$(readlink -f ~/.pi/agent/APPEND_SYSTEM.md | xargs dirname)
   ```
2. Create the file under the repo path, e.g. `$REPO/extensions/foo.ts` (or `$REPO/skills/foo/SKILL.md`, etc.).
3. Run `"$REPO/install.sh"` to symlink the new entry into `~/.pi/agent/...` and to run `npm install` if the new entry has a `package.json`.
4. Then `git -C "$REPO" add -A && git -C "$REPO" commit -m "<msg>" && git -C "$REPO" push`.

### Modifiers

- If the user explicitly says "don't push" or "local only", skip the push step but still commit.
- If a commit would be empty (no tracked changes), skip silently.
- If `git push` fails due to auth or network, report the error to the user and leave the local commit in place — do not amend or reset.

## When NOT to touch dotpi

- Changes inside arbitrary project directories (anything outside `~/.pi/agent/`)
- Anything under `~/.pi/agent/sessions/`, `~/.pi/agent/auth.json`, `~/.pi/agent/bin/`, or any `node_modules/` — these are intentionally not tracked
- Experimental edits the user is clearly testing and hasn't accepted yet

## Notes

- `auth.json` must never be committed. The `.gitignore` already excludes it; do not work around that.
- Personal absolute paths (e.g. the user's home directory layout) should not leak into committed files. Prefer `~`, `$HOME`, or `readlink`-based resolution over hardcoded paths.
