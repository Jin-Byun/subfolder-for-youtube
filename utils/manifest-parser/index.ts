type Manifest = chrome.runtime.ManifestV3;

class ManifestParser {
	private constructor() {}

	static convertManifestToString(manifest: Manifest): string {
		if (!process.env.__FIREFOX__) {
			return JSON.stringify(manifest, null, 2);
		}
		return JSON.stringify(
			ManifestParser.convertToFirefoxCompatibleManifest(manifest),
			null,
			2,
		);
	}

	static convertToFirefoxCompatibleManifest(manifest: Manifest) {
		const { options_page, ...manifestCopy } = manifest as Record<
			string,
			unknown
		>;

		manifestCopy.background = {
			scripts: [manifest.background?.service_worker],
			type: "module",
		};
		manifestCopy.options_ui = {
			page: manifest.options_page,
			browser_style: false,
		};
		manifestCopy.content_security_policy = {
			extension_pages: "script-src 'self'; object-src 'self'",
		};
		return manifestCopy as Manifest;
	}
}

export default ManifestParser;
