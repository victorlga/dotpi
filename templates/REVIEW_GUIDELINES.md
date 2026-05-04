# Review guidelines

Project-specific review rules. The `/review` pi extension appends this file to its prompt when it finds it next to a `.pi/` directory.

Replace each `_e.g._` with the real rules for this project. Delete sections you don't need.

## Focus areas (in priority order)

1. **Correctness** — does the code do what the change description claims?
2. **Tests** — _e.g. every behavioral change ships with a test; bug fixes include a regression test._
3. **Security** — _e.g. no secrets in code, no SQL string concat, no `eval`._
4. **Public API stability** — _e.g. backward-compatible unless `BREAKING:` in the PR title._
5. **Performance** — only call out regressions on hot paths, not theoretical micro-optimizations.
6. **Readability** — naming, structure, comments that explain *why*.

## Project conventions

- **Language version:** _e.g. TypeScript 5.x, Python 3.12_
- **Style:** _e.g. ruff/prettier/eslint must pass; functional style preferred._
- **Commits:** _e.g. Conventional Commits (`feat:`, `fix:`, `chore:` …)._
- **Imports:** _e.g. no relative `../../..`; use path aliases._
- **Errors:** _e.g. no swallowed exceptions; log with structured fields._
- **Logging:** _e.g. no `console.log` in committed code; use the project logger._

## Always flag

- New dependencies (justify each addition)
- Schema/migration changes
- Public API changes
- Files >300 lines that grew in this PR
- Disabled or skipped tests
- TODO/FIXME comments without an owner or ticket reference
- Use of `any` / `# type: ignore` without an explanatory comment

## Do not flag

- Pure stylistic preferences the linter doesn't enforce
- Theoretical perf concerns without measurement
- Naming bikeshedding (suggest once, then drop it)
- Missing tests for code that already had no tests, unless the PR touches behavior

## Output format

- Group findings by severity: **Blocking** / **Recommended** / **Nit**.
- For each finding: file path, line range, what's wrong, suggested fix.
- End with a one-line overall verdict: `LGTM` / `Needs changes` / `Needs discussion`.
