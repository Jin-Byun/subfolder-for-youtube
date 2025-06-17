import * as fs from "node:fs";
import { resolve } from "node:path";
import colorLog from "../log";
import ManifestParser from "../manifest-parser";
import type { PluginOption } from "vite";
import { zip } from "zip-a-folder";

export default function makeManifest(
	manifest: chrome.runtime.ManifestV3,
	distDir: string,
	rootDir: string,
	isProduction: boolean,
	config: { contentScriptCssKey?: string },
): PluginOption {
	function makeManifest() {
		if (!fs.existsSync(distDir)) {
			fs.mkdirSync(distDir);
		}
		const manifestPath = resolve(distDir, "manifest.json");

		// Naming change for cache invalidation
		if (config.contentScriptCssKey) {
			for (const script of manifest.content_scripts) {
				script.css = script.css.map((css) =>
					css.replace("<KEY>", config.contentScriptCssKey),
				);
			}
		}
		fs.writeFileSync(
			manifestPath,
			ManifestParser.convertManifestToString(manifest),
		);

		colorLog(`\nManifest file copy complete: ${manifestPath}`, "success");
	}

	function zipDist() {
		if (!isProduction) return;
		zip(distDir, resolve(rootDir, `${manifest.version}.zip`)).then(() => {
			colorLog("\nZip complete", "success");
		});
	}

	return {
		name: "make-manifest",
		closeBundle() {
			makeManifest();
			zipDist();
		},
	};
}
