/**
 * pi-rtk — Pi extension that uses `rtk rewrite` to optimize shell commands.
 *
 * The extension participates in two Pi execution paths:
 * - agent-initiated `bash` tool calls via a replacement bash tool
 * - user-issued `!<cmd>` shell commands via the `user_bash` event
 *
 * In both paths, optimization is best-effort: when `rtk rewrite` succeeds,
 * Pi executes the rewritten command; when rewrite fails, times out, or `rtk`
 * is unavailable, execution falls back to Pi's normal shell behavior.
 *
 * Commands entered with `!!<cmd>` are intentionally not intercepted so the
 * user's choice to exclude shell output from model context is preserved.
 *
 * ---
 *
 * Vendored from @sherif-fanous/pi-rtk v0.3.0
 *   Upstream: https://github.com/sherif-fanous/pi-rtk
 *   Original author: Sherif Fanous
 *   License: MIT (see below)
 *
 * Local change: import path updated from `@mariozechner/pi-coding-agent`
 * (pre-rebrand) to `@earendil-works/pi-coding-agent`.
 *
 * ---
 *
 * MIT License
 *
 * Copyright (c) 2026 Sherif Fanous
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  createBashTool,
  createLocalBashOperations,
} from "@earendil-works/pi-coding-agent";
import { execFileSync } from "node:child_process";

const REWRITE_TIMEOUT_MS = 5000;

function rtkRewriteCommand(command: string): string | undefined {
  try {
    return execFileSync("rtk", ["rewrite", command], {
      encoding: "utf-8",
      timeout: REWRITE_TIMEOUT_MS,
    }).trimEnd();
  } catch {
    return undefined;
  }
}

export default function (pi: ExtensionAPI) {
  const cwd = process.cwd();
  const localBashOperations = createLocalBashOperations();

  const bashTool = createBashTool(cwd, {
    spawnHook: ({ command, cwd, env }) => {
      return { command: rtkRewriteCommand(command) ?? command, cwd, env };
    },
  });

  pi.registerTool(bashTool);

  pi.on("user_bash", (event) => {
    if (event.excludeFromContext) {
      return;
    }

    if (!rtkRewriteCommand(event.command)) {
      return;
    }

    return {
      operations: {
        exec: (command, cwd, options) => {
          return localBashOperations.exec(
            rtkRewriteCommand(command) ?? command,
            cwd,
            options,
          );
        },
      },
    };
  });
}
