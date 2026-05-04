/**
 * /dotpi-reload
 *
 * Pulls the latest changes from the dotpi repo, re-runs its install.sh so any
 * newly-added extensions/skills/system-prompt files get symlinked into
 * ~/.pi/agent/, and then triggers a full pi reload of the current session.
 *
 * The repo path is discovered at runtime by resolving the symlink at
 * ~/.pi/agent/APPEND_SYSTEM.md, so this works on any machine where dotpi was
 * installed via install.sh — no hardcoded paths.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

async function findRepoDir(): Promise<string> {
	const sentinel = path.join(os.homedir(), ".pi", "agent", "APPEND_SYSTEM.md");
	let target: string;
	try {
		target = await fs.realpath(sentinel);
	} catch {
		throw new Error(
			`Could not resolve dotpi repo: ${sentinel} is missing. ` +
				`Run install.sh from the dotpi repo first.`,
		);
	}
	const repoDir = path.dirname(target);
	// Sanity-check it really looks like the repo
	try {
		await fs.access(path.join(repoDir, "install.sh"));
		await fs.access(path.join(repoDir, ".git"));
	} catch {
		throw new Error(
			`Resolved path ${repoDir} does not look like the dotpi repo (missing install.sh or .git).`,
		);
	}
	return repoDir;
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("dotpi-reload", {
		description: "git pull dotpi, re-run install.sh, then reload pi",
		handler: async (_args, ctx) => {
			let repo: string;
			try {
				repo = await findRepoDir();
			} catch (err) {
				ctx.ui.notify((err as Error).message, "error");
				return;
			}

			ctx.ui.setStatus("dotpi-reload", "git pull…");
			const pull = await pi.exec("git", ["-C", repo, "pull", "--ff-only"], {
				timeout: 60_000,
			});
			if (pull.code !== 0) {
				ctx.ui.setStatus("dotpi-reload", "");
				ctx.ui.notify(
					`git pull failed (exit ${pull.code}):\n${pull.stderr || pull.stdout}`,
					"error",
				);
				return;
			}
			const pullSummary = (pull.stdout || "").trim().split("\n").slice(-1)[0] || "up to date";
			ctx.ui.notify(`dotpi: ${pullSummary}`, "info");

			ctx.ui.setStatus("dotpi-reload", "install.sh…");
			const install = await pi.exec("bash", [path.join(repo, "install.sh")], {
				timeout: 120_000,
			});
			if (install.code !== 0) {
				ctx.ui.setStatus("dotpi-reload", "");
				ctx.ui.notify(
					`install.sh failed (exit ${install.code}):\n${install.stderr || install.stdout}`,
					"error",
				);
				return;
			}

			ctx.ui.setStatus("dotpi-reload", "reloading pi…");
			ctx.ui.notify("dotpi synced — reloading", "success");

			// Per pi docs: treat reload as terminal for the handler.
			await ctx.reload();
			return;
		},
	});
}
