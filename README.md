# dotpi

My personal [pi](https://github.com/badlogic/pi) configuration: extensions, skills, and settings — synced across machines via this repo.

`~/.pi/agent/{extensions,skills,settings.json}` are **symlinks** into this repo. Edits in either place are the same edit; commit them from here.

## Layout

```
.
├── settings.json           # ~/.pi/agent/settings.json
├── APPEND_SYSTEM.md        # ~/.pi/agent/APPEND_SYSTEM.md  (rules appended to system prompt)
├── AGENTS.md               # ~/.pi/agent/AGENTS.md         (personal context file)
├── prompts/                # ~/.pi/agent/prompts/*.md      (custom /<name> templates)
├── themes/                 # ~/.pi/agent/themes/*.json     (custom color themes)
├── templates/              # starter files to copy into projects (not auto-linked)
├── extensions/             # ~/.pi/agent/extensions/
│   ├── answer.ts           # /answer — Q&A extractor (Ctrl+.)
│   ├── review.ts           # /review — code review modes
│   └── todos/              # /todos — file-backed todo manager
└── skills/                 # ~/.pi/agent/skills/
    ├── mcporter/           # invoke MCP server tools as CLI

```

## Bootstrap a new machine

Prereq: macOS with [Homebrew](https://brew.sh). Then:

```bash
git clone git@github.com:victorlga/dotpi.git
cd dotpi
./install.sh
```

`install.sh`:
1. Runs `brew bundle` against [`Brewfile`](./Brewfile) (`node`, `git`, `ripgrep`, `gh`).
2. `npm i -g` the required global tools (`pi`, `lat.md`, `mcporter`).
3. Creates `~/.pi/agent/{extensions,skills,prompts,themes}` if missing.
4. Symlinks every entry from this repo into `~/.pi/agent/...`.
5. Runs `npm install` in any sub-dir that has a `package.json`.
6. Backs up any pre-existing non-symlink files as `*.backup.<timestamp>`.

Set `SKIP_BOOTSTRAP=1` to skip steps 1–2 if you manage prerequisites yourself.

After it finishes:
- `pi` then `/login` to authenticate your model provider (API keys are **not** synced)
- Optional: `brew install --cask google-chrome` for the `web-browser` skill
- In an already-open pi session, `/reload` to pick up changes

### Prerequisites on the new machine

- [pi](https://github.com/badlogic/pi) installed (`npm i -g @mariozechner/pi-coding-agent`)
- `node` ≥ 20, `npm`, `git`
- For the `web-browser` skill: Google Chrome or Chromium (or set `BROWSER_BIN=...`)
- For `review.ts` PR mode: `gh` CLI authenticated

### What is NOT synced (intentional)

| Path | Why |
|---|---|
| `~/.pi/agent/auth.json` | API keys — sign in fresh on each machine |
| `~/.pi/agent/sessions/` | Conversation history — machine-local |
| `~/.pi/agent/bin/` | Cached binaries |
| `**/node_modules/` | Reinstalled by `install.sh` |

## Daily workflow

```bash
# Edit anywhere — through ~/.pi/agent/... or directly in the repo
$EDITOR ~/.pi/agent/extensions/answer.ts   # same file as repo

cd /path/to/dotpi
git add -A && git commit -m "tweak answer prompt" && git push
```

On the other machine:

```bash
cd /path/to/dotpi && git pull
# If a new extension/skill with deps was added:
./install.sh
```

## Adding a new extension or skill

Just create it under `extensions/` or `skills/` in this repo, then re-run `./install.sh` to symlink it into `~/.pi/agent/...`. Commit and push.
