# pi-scaffold

My personal [pi](https://github.com/badlogic/pi) configuration: extensions, skills, and settings — synced across machines via this repo.

`~/.pi/agent/{extensions,skills,settings.json}` are **symlinks** into this repo. Edits in either place are the same edit; commit them from here.

## Layout

```
.
├── settings.json           # ~/.pi/agent/settings.json
├── extensions/             # ~/.pi/agent/extensions/
│   ├── answer.ts           # /answer — Q&A extractor (Ctrl+.)
│   ├── review.ts           # /review — code review modes
│   └── todos/              # /todos — file-backed todo manager
└── skills/                 # ~/.pi/agent/skills/
    ├── mcporter/           # invoke MCP server tools as CLI
    └── web-browser/        # Chrome DevTools Protocol browser control
```

## Bootstrap a new machine

```bash
git clone git@github.com:<you>/pi-scaffold.git ~/Playground/pi-scaffold
cd ~/Playground/pi-scaffold
./install.sh
```

`install.sh`:
- Creates `~/.pi/agent/{extensions,skills}` if missing
- Symlinks every entry from this repo into `~/.pi/agent/...`
- Runs `npm install` in any sub-dir that has a `package.json`
- Backs up any pre-existing non-symlink files as `*.backup.<timestamp>`

After it finishes: open pi and run `/reload` (or just start a new session).

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

cd ~/Playground/pi-scaffold
git add -A && git commit -m "tweak answer prompt" && git push
```

On the other machine:

```bash
cd ~/Playground/pi-scaffold && git pull
# If a new extension/skill with deps was added:
./install.sh
```

## Adding a new extension or skill

Just create it under `extensions/` or `skills/` in this repo, then re-run `./install.sh` to symlink it into `~/.pi/agent/...`. Commit and push.
