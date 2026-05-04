/**
 * /dotpi-reload + footer hint
 *
 * 1. `/dotpi-reload` command — pulls the latest changes from the dotpi repo,
 *    re-runs its install.sh, and triggers a full pi reload of the current
 *    session.
 *
 * 2. Footer hint — on session start, runs `git fetch` in the background and
 *    sets a footer status if local is behind origin. Does NOT modify the
 *    working tree. Lets you decide when to run `/dotpi-reload`.
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

const STATUS_KEY = "dotpi";

async function checkBehind(pi: ExtensionAPI, repo: string): Promise<number | null> {
	// Quietly fetch; ignore network failures.
	const fetchRes = await pi.exec("git", ["-C", repo, "fetch", "--quiet"], { timeout: 15_000 });
	if (fetchRes.code !== 0) return null;

	// Need an upstream to compare against. If there's none, silently bail.
	const upstream = await pi.exec(
		"git",
		["-C", repo, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
		{ timeout: 5_000 },
	);
	if (upstream.code !== 0) return null;

	const behind = await pi.exec(
		"git",
		["-C", repo, "rev-list", "--count", "HEAD..@{u}"],
		{ timeout: 5_000 },
	);
	if (behind.code !== 0) return null;

	const n = Number.parseInt((behind.stdout || "").trim(), 10);
	return Number.isFinite(n) ? n : null;
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (event, ctx) => {
		// Only check on initial startup or after a reload — not on every /new or /resume.
		if (event.reason !== "startup" && event.reason !== "reload") return;

		let repo: string;
		try {
			repo = await findRepoDir();
		} catch {
			return; // silent: not a dotpi-managed install
		}

		// Fire-and-forget so we don't delay the rest of session_start handlers.
		(async () => {
			const behind = await checkBehind(pi, repo);
			if (behind === null) return; // network or upstream missing — quiet
			if (behind <= 0) {
				ctx.ui.setStatus(STATUS_KEY, "");
				return;
			}
			const plural = behind === 1 ? "commit" : "commits";
			ctx.ui.setStatus(
				STATUS_KEY,
				`dotpi: ${behind} ${plural} behind \u2014 /dotpi-reload`,
			);
		})().catch(() => {
			/* swallow: footer hint is best-effort */
		});
	});

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

			// Clear the "behind" hint — next session_start will recompute.
			ctx.ui.setStatus(STATUS_KEY, "");

			// Per pi docs: treat reload as terminal for the handler.
			await ctx.reload();
			return;
		},
	});
}
