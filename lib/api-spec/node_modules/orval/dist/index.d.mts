import { ConfigExternal, GlobalOptions, InputTransformerFn, Options, OptionsExport } from "@orval/core";
export * from "@orval/core";

//#region src/generate.d.ts
declare function generate(optionsExport?: string | OptionsExport, workspace?: string, options?: GlobalOptions): Promise<void>;
//#endregion
//#region src/utils/options.d.ts
/**
 * Type helper to make it easier to use orval.config.ts
 * accepts a direct {@link ConfigExternal} object.
 */
declare function defineConfig(options: ConfigExternal): ConfigExternal;
/**
 * Type helper to make it easier to write input transformers.
 * accepts a direct {@link InputTransformerFn} function.
 */
declare function defineTransformer(transformer: InputTransformerFn): InputTransformerFn;
//#endregion
export { type Options, generate as default, generate, defineConfig, defineTransformer };
//# sourceMappingURL=index.d.mts.map