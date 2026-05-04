---
name: mcporter
description: Invoke tools from MCP (Model Context Protocol) servers as CLI commands via mcporter. Use whenever a task could be served by an MCP server's tools (e.g. Linear, GitHub, Notion, Slack, custom MCP servers configured in Claude/Cursor/Codex). Provides discovery (list servers/tools/schemas) and invocation (call tool with key=value args) without speaking the MCP protocol directly.
---

# mcporter

`mcporter` exposes MCP server tools as plain CLI commands. Pi has no native MCP support — use this skill instead.

It auto-loads server definitions from editor configs (`~/.claude.json`, Cursor, Codex, etc.) plus its own configs at `./config/mcporter.json` and `~/.mcporter/mcporter.json`.

## Discovery

Always discover before calling — tool names, arguments, and availability change per server.

```bash
# List all configured MCP servers (shows health + tool count)
mcporter list

# List tools for a specific server with full JSON-Schema docs
mcporter list <server> --schema

# Machine-readable
mcporter list --json
mcporter list <server> --schema --json
```

## Invocation

Tools are addressed as `<server>.<tool>`. Arguments are passed as `key=value` (or `key:=<json>` for non-string values via mcporter's parser — check `mcporter call --help` if in doubt).

```bash
# Call a tool
mcporter call <server>.<tool> arg1=value1 arg2=value2

# Examples
mcporter call linear.list_issues limit=5
mcporter call token-counter.count text="hello world"
```

If a server is marked `offline` in `mcporter list`, calls will fail — surface that to the user rather than retrying blindly.

## Resources

Some MCP servers expose resources (read-only data) in addition to tools:

```bash
mcporter resource <server>           # list resource URIs
mcporter resource <server> <uri>     # read one
```

## Configuration

```bash
mcporter config list                       # show local + imported sources
mcporter config import claude              # copy Claude Desktop servers into local config
mcporter config add <name> -- <cmd> ...    # add a stdio server
mcporter config add <name> --url <url>     # add an HTTP server
mcporter config remove <name>
mcporter auth <server>                     # run OAuth flow for a server
```

Config files (in precedence order):
- `./config/mcporter.json` (project)
- `~/.mcporter/mcporter.json` (user)
- Imported: `~/.claude.json`, Cursor, Codex, etc.

## Workflow

1. Run `mcporter list` to see what's available.
2. Run `mcporter list <server> --schema` to learn a tool's exact arguments.
3. Run `mcporter call <server>.<tool> key=value ...` to invoke it.
4. On auth errors, run `mcporter auth <server>`. On offline servers, check the source config.

## Tips

- Use `--log-level debug` to debug failing calls.
- Use `--json` on `list` for reliable parsing.
- For repeated/scripted use of one server, `mcporter generate-cli --server <name> --compile ./bin` produces a standalone CLI.
- Run `mcporter <command> --help` for any subcommand's full flag list.
