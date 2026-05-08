import { a as defineConfig, i as startWatcher, n as loadConfigFile, o as defineTransformer, r as generateSpec, s as normalizeOptions, t as findConfigFile } from "./config-Q13xuAhd.mjs";
import { isString, logError, setVerbose } from "@orval/core";

export * from "@orval/core"

//#region src/generate.ts
async function generate(optionsExport, workspace = process.cwd(), options) {
	setVerbose(!!options?.verbose);
	if (!optionsExport || isString(optionsExport)) {
		const configFile = await loadConfigFile(findConfigFile(optionsExport));
		const configs = Object.entries(configFile);
		let hasErrors = false;
		for (const [projectName, config] of configs) {
			const normalizedOptions = await normalizeOptions(config, workspace, options);
			if (options?.watch === void 0) try {
				await generateSpec(workspace, normalizedOptions, projectName);
			} catch (error) {
				hasErrors = true;
				logError(error, projectName);
			}
			else {
				const fileToWatch = isString(normalizedOptions.input.target) ? normalizedOptions.input.target : void 0;
				await startWatcher(options.watch, async () => {
					try {
						await generateSpec(workspace, normalizedOptions, projectName);
					} catch (error) {
						logError(error, projectName);
					}
				}, fileToWatch);
			}
		}
		if (hasErrors) logError("One or more project failed, see above for details");
		return;
	}
	const normalizedOptions = await normalizeOptions(optionsExport, workspace, options);
	if (options?.watch) await startWatcher(options.watch, async () => {
		try {
			await generateSpec(workspace, normalizedOptions);
		} catch (error) {
			logError(error);
		}
	}, normalizedOptions.input.target);
	else try {
		await generateSpec(workspace, normalizedOptions);
	} catch (error) {
		logError(error);
	}
}

//#endregion
export { generate as default, generate, defineConfig, defineTransformer };
//# sourceMappingURL=index.mjs.map