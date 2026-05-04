# Personal preferences (global AGENTS.md)

This file is loaded by pi as a **context file** on every session. It's the place for personal preferences and reference info that should *inform* the assistant — not strict rules. Strict rules go in `APPEND_SYSTEM.md`.

Per-project `AGENTS.md` (in a project's root or any ancestor) is layered on top of this one.

## About me

<!-- TODO: fill in. Examples below — replace with your actual preferences. -->

- **OS:** macOS
- **Shell:** _e.g. zsh, fish_
- **Editor:** _e.g. Neovim, VS Code, Cursor_
- **Package manager preferences:** _e.g. prefer `pnpm` over `npm`, `uv` over `pip`_

## Communication style

<!-- How you want the assistant to talk to you. -->

- Be concise. Skip filler ("Great question!", "Let me explain…").
- Show the answer first, then justification if needed.
- Use code blocks and tables liberally for structured info.
- Don't ask permission for obviously safe operations (reading files, listing dirs).

## Default toolchains

<!-- Languages / frameworks you reach for, so the assistant can match. -->

- **TypeScript / Node:** _e.g. tsx for scripts, vitest for tests_
- **Python:** _e.g. uv + ruff + pytest_
- **Other:** _e.g. Go, Rust_

## Conventions I like

<!-- Coding conventions, repo layout, commit style, etc. -->

- Prefer functional/expression style over imperative when readability is equal.
- Conventional Commits (`feat:`, `fix:`, `chore:` …).
- Keep PRs small and focused.

## Things to avoid

- _e.g. don't suggest deprecated APIs without flagging them_
- _e.g. don't add comments that just restate the code_
