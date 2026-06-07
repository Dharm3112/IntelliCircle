import path from "node:path";
import { FormDataArrayHandling, GetterPropType, NamingConvention, OutputClient, OutputHttpClient, OutputMode, PropertySortOrder, RefComponentSuffix, asyncReduce, conventionName, createLogger, createSuccessMessage, dynamicImport, fixCrossDirectoryImports, fixRegularSchemaImports, generateComponentDefinition, generateDependencyImports, generateParameterDefinition, generateSchemasDefinition, generateVerbsOptions, getFileInfo, getFullRoute, getMockFileExtensionByTypeName, getRoute, isBoolean, isFunction, isNullish, isObject, isReference, isString, isUrl, jsDoc, log, logError, logVerbose, pascal, removeFilesAndEmptyFolders, resolveInstalledVersions, resolveRef, splitSchemasByType, upath, writeSchemas, writeSingleMode, writeSplitMode, writeSplitTagsMode, writeTagsMode } from "@orval/core";
import { bundle } from "@scalar/json-magic/bundle";
import { fetchUrls, parseJson, parseYaml, readFiles } from "@scalar/json-magic/bundle/plugins/node";
import { upgrade, validate } from "@scalar/openapi-parser";
import { isNullish as isNullish$1, unique } from "remeda";
import * as mock from "@orval/mock";
import { DEFAULT_MOCK_OPTIONS, generateMockImports } from "@orval/mock";
import angular from "@orval/angular";
import axios from "@orval/axios";
import fetchClient from "@orval/fetch";
import hono from "@orval/hono";
import mcp from "@orval/mcp";
import query from "@orval/query";
import solidStart from "@orval/solid-start";
import swr from "@orval/swr";
import zod, { dereference, generateZodValidationSchemaDefinition, isZodVersionV4, parseZodValidationSchemaDefinition } from "@orval/zod";
import { styleText } from "node:util";
import { ExecaError, execa } from "execa";
import fs from "fs-extra";
import fs$1, { access } from "node:fs/promises";
import { parseArgsStringToArgv } from "string-argv";
import { clearTimeout, setTimeout } from "node:timers";
import { findUp, findUpMultiple } from "find-up";
import yaml from "js-yaml";
import { parse } from "tsconfck";
import fs$2 from "node:fs";
import { createJiti } from "jiti";

//#region package.json
var name = "orval";
var description = "A swagger client generator for typescript";
var version = "8.5.3";

//#endregion
//#region src/client.ts
const DEFAULT_CLIENT = OutputClient.AXIOS;
const getGeneratorClient = (outputClient, output) => {
	const GENERATOR_CLIENT = {
		axios: axios({ type: "axios" })(),
		"axios-functions": axios({ type: "axios-functions" })(),
		angular: angular()(),
		"angular-query": query({
			output,
			type: "angular-query"
		})(),
		"react-query": query({
			output,
			type: "react-query"
		})(),
		"solid-start": solidStart()(),
		"solid-query": query({
			output,
			type: "solid-query"
		})(),
		"svelte-query": query({
			output,
			type: "svelte-query"
		})(),
		"vue-query": query({
			output,
			type: "vue-query"
		})(),
		swr: swr()(),
		zod: zod()(),
		hono: hono()(),
		fetch: fetchClient()(),
		mcp: mcp()()
	};
	return isFunction(outputClient) ? outputClient(GENERATOR_CLIENT) : GENERATOR_CLIENT[outputClient];
};
const generateClientImports = ({ client, implementation, imports, projectName, hasSchemaDir, isAllowSyntheticDefaultImports, hasGlobalMutator, hasTagsMutator, hasParamsSerializerOptions, packageJson, output }) => {
	const { dependencies } = getGeneratorClient(client, output);
	return generateDependencyImports(implementation, dependencies ? [...dependencies(hasGlobalMutator, hasParamsSerializerOptions, packageJson, output.httpClient, hasTagsMutator, output.override), ...imports] : imports, projectName, hasSchemaDir, isAllowSyntheticDefaultImports);
};
const generateClientHeader = ({ outputClient = DEFAULT_CLIENT, isRequestOptions, isGlobalMutator, isMutator, provideIn, hasAwaitedType, titles, output, verbOptions, tag, clientImplementation }) => {
	const { header } = getGeneratorClient(outputClient, output);
	return {
		implementation: header ? header({
			title: titles.implementation,
			isRequestOptions,
			isGlobalMutator,
			isMutator,
			provideIn,
			hasAwaitedType,
			output,
			verbOptions,
			tag,
			clientImplementation
		}) : "",
		implementationMock: `export const ${titles.implementationMock} = () => [\n`
	};
};
const generateClientFooter = ({ outputClient, operationNames, hasMutator, hasAwaitedType, titles, output }) => {
	const { footer } = getGeneratorClient(outputClient, output);
	if (!footer) return {
		implementation: "",
		implementationMock: `\n]\n`
	};
	let implementation;
	try {
		if (isFunction(outputClient)) {
			implementation = footer(operationNames);
			console.warn("[WARN] Passing an array of strings for operations names to the footer function is deprecated and will be removed in a future major release. Please pass them in an object instead: { operationNames: string[] }.");
		} else implementation = footer({
			operationNames,
			title: titles.implementation,
			hasMutator,
			hasAwaitedType
		});
	} catch {
		implementation = footer({
			operationNames,
			title: titles.implementation,
			hasMutator,
			hasAwaitedType
		});
	}
	return {
		implementation,
		implementationMock: `]\n`
	};
};
const generateClientTitle = ({ outputClient = DEFAULT_CLIENT, title, customTitleFunc, output }) => {
	const { title: generatorTitle } = getGeneratorClient(outputClient, output);
	if (!generatorTitle) return {
		implementation: "",
		implementationMock: `get${pascal(title)}Mock`
	};
	if (customTitleFunc) {
		const customTitle = customTitleFunc(title);
		return {
			implementation: generatorTitle(customTitle),
			implementationMock: `get${pascal(customTitle)}Mock`
		};
	}
	return {
		implementation: generatorTitle(title),
		implementationMock: `get${pascal(title)}Mock`
	};
};
const generateMock = (verbOption, options) => {
	if (!options.mock) return {
		implementation: {
			function: "",
			handler: "",
			handlerName: ""
		},
		imports: []
	};
	if (isFunction(options.mock)) return options.mock(verbOption, options);
	return mock.generateMock(verbOption, options);
};
const generateOperations = (outputClient = DEFAULT_CLIENT, verbsOptions, options, output) => {
	return asyncReduce(verbsOptions, async (acc, verbOption) => {
		const { client: generatorClient } = getGeneratorClient(outputClient, output);
		const client = await generatorClient(verbOption, options, outputClient, output);
		if (!client.implementation) return acc;
		const generatedMock = generateMock(verbOption, options);
		acc[verbOption.operationId] = {
			implementation: verbOption.doc + client.implementation,
			imports: client.imports,
			implementationMock: generatedMock.implementation,
			importsMock: generatedMock.imports,
			tags: verbOption.tags,
			mutator: verbOption.mutator,
			clientMutators: client.mutators,
			formData: verbOption.formData,
			formUrlEncoded: verbOption.formUrlEncoded,
			paramsSerializer: verbOption.paramsSerializer,
			operationName: verbOption.operationName,
			fetchReviver: verbOption.fetchReviver
		};
		return acc;
	}, {});
};
const generateExtraFiles = (outputClient = DEFAULT_CLIENT, verbsOptions, output, context) => {
	const { extraFiles: generateExtraFiles } = getGeneratorClient(outputClient, output);
	if (!generateExtraFiles) return Promise.resolve([]);
	return generateExtraFiles(verbsOptions, output, context);
};

//#endregion
//#region src/api.ts
async function getApiBuilder({ input, output, context }) {
	const api = await asyncReduce(Object.entries(context.spec.paths ?? {}), async (acc, [pathRoute, verbs]) => {
		const route = getRoute(pathRoute);
		let resolvedVerbs = verbs;
		if (isReference(verbs)) {
			const { schema } = resolveRef(verbs, context);
			resolvedVerbs = schema;
		}
		let verbsOptions = await generateVerbsOptions({
			verbs: resolvedVerbs,
			input,
			output,
			route,
			pathRoute,
			context
		});
		if (output.override.useDeprecatedOperations === false) verbsOptions = verbsOptions.filter((verb) => {
			return !verb.deprecated;
		});
		const schemas = [];
		for (const { queryParams, headers, body, response, props } of verbsOptions) {
			schemas.push(...props.flatMap((param) => param.type === GetterPropType.NAMED_PATH_PARAMS ? param.schema : []));
			if (queryParams) schemas.push(queryParams.schema, ...queryParams.deps);
			if (headers) schemas.push(headers.schema, ...headers.deps);
			schemas.push(...body.schemas, ...response.schemas);
		}
		const fullRoute = getFullRoute(route, verbs.servers ?? context.spec.servers, output.baseUrl);
		if (!output.target) throw new Error("Output does not have a target");
		const pathOperations = await generateOperations(output.client, verbsOptions, {
			route: fullRoute,
			pathRoute,
			override: output.override,
			context,
			mock: output.mock,
			output: output.target
		}, output);
		for (const verbOption of verbsOptions) acc.verbOptions[verbOption.operationId] = verbOption;
		acc.schemas.push(...schemas);
		acc.operations = {
			...acc.operations,
			...pathOperations
		};
		return acc;
	}, {
		operations: {},
		verbOptions: {},
		schemas: []
	});
	const extraFiles = await generateExtraFiles(output.client, api.verbOptions, output, context);
	return {
		operations: api.operations,
		schemas: api.schemas,
		verbOptions: api.verbOptions,
		title: generateClientTitle,
		header: generateClientHeader,
		footer: generateClientFooter,
		imports: generateClientImports,
		importsMock: generateMockImports,
		extraFiles
	};
}

//#endregion
//#region src/import-open-api.ts
async function importOpenApi({ spec, input, output, target, workspace, projectName }) {
	const transformedOpenApi = await applyTransformer(spec, input.override.transformer, workspace);
	const schemas = getApiSchemas({
		input,
		output,
		target,
		workspace,
		spec: transformedOpenApi
	});
	const api = await getApiBuilder({
		input,
		output,
		context: {
			projectName,
			target,
			workspace,
			spec: transformedOpenApi,
			output
		}
	});
	return {
		...api,
		schemas: [...schemas, ...api.schemas],
		target,
		info: transformedOpenApi.info,
		spec: transformedOpenApi
	};
}
async function applyTransformer(openApi, transformer, workspace) {
	const transformerFn = transformer ? await dynamicImport(transformer, workspace) : void 0;
	if (!transformerFn) return openApi;
	const transformedOpenApi = transformerFn(openApi);
	const { valid, errors } = await validate(transformedOpenApi);
	if (!valid) throw new Error(`Validation failed`, { cause: errors });
	return transformedOpenApi;
}
function getApiSchemas({ input, output, target, workspace, spec }) {
	const context = {
		target,
		workspace,
		spec,
		output
	};
	const schemaDefinition = generateSchemasDefinition(spec.components?.schemas, context, output.override.components.schemas.suffix, input.filters);
	const responseDefinition = generateComponentDefinition(spec.components?.responses, context, output.override.components.responses.suffix);
	const swaggerResponseDefinition = generateComponentDefinition("responses" in spec ? spec.responses : void 0, context, "");
	const bodyDefinition = generateComponentDefinition(spec.components?.requestBodies, context, output.override.components.requestBodies.suffix);
	const parameters = generateParameterDefinition(spec.components?.parameters, context, output.override.components.parameters.suffix);
	return [
		...schemaDefinition,
		...responseDefinition,
		...swaggerResponseDefinition,
		...bodyDefinition,
		...parameters
	];
}

//#endregion
//#region src/import-specs.ts
async function resolveSpec(input, parserOptions) {
	const dereferencedData = dereferenceExternalRef(await bundle(input, {
		plugins: [
			readFiles(),
			fetchUrls({ headers: parserOptions?.headers }),
			parseJson(),
			parseYaml()
		],
		treeShake: false
	}));
	const { valid, errors } = await validate(dereferencedData);
	if (!valid) throw new Error("Validation failed", { cause: errors });
	const { specification } = upgrade(dereferencedData);
	return specification;
}
async function importSpecs(workspace, options, projectName) {
	const { input, output } = options;
	return importOpenApi({
		spec: await resolveSpec(input.target, input.parserOptions),
		input,
		output,
		target: input.target,
		workspace,
		projectName
	});
}
/**
* The plugins from `@scalar/json-magic` does not dereference $ref.
* Instead it fetches them and puts them under x-ext, and changes the $ref to point to #x-ext/<name>.
* This function:
* 1. Merges external schemas into main spec's components.schemas (with collision handling)
* 2. Replaces x-ext refs with standard component refs or inlined content
*/
function dereferenceExternalRef(data) {
	const extensions = data["x-ext"] ?? {};
	const schemaNameMappings = mergeExternalSchemas(data, extensions);
	const result = {};
	for (const [key, value] of Object.entries(data)) if (key !== "x-ext") result[key] = replaceXExtRefs(value, extensions, schemaNameMappings);
	return result;
}
/**
* Merge external document schemas into main spec's components.schemas
* Returns mapping of original schema names to final names (with suffixes for collisions)
*/
function mergeExternalSchemas(data, extensions) {
	const schemaNameMappings = {};
	if (Object.keys(extensions).length === 0) return schemaNameMappings;
	data.components ??= {};
	const mainComponents = data.components;
	mainComponents.schemas ??= {};
	const mainSchemas = mainComponents.schemas;
	for (const [extKey, extDoc] of Object.entries(extensions)) {
		schemaNameMappings[extKey] = {};
		if (isObject(extDoc) && "components" in extDoc) {
			const extComponents = extDoc.components;
			if (isObject(extComponents) && "schemas" in extComponents) {
				const extSchemas = extComponents.schemas;
				for (const [schemaName, schema] of Object.entries(extSchemas)) {
					const existingSchema = mainSchemas[schemaName];
					const isXExtRef = isObject(existingSchema) && "$ref" in existingSchema && isString(existingSchema.$ref) && existingSchema.$ref.startsWith("#/x-ext/");
					let finalSchemaName = schemaName;
					if (schemaName in mainSchemas && !isXExtRef) {
						finalSchemaName = `${schemaName}_${extKey.replaceAll(/[^a-zA-Z0-9]/g, "_")}`;
						schemaNameMappings[extKey][schemaName] = finalSchemaName;
					} else schemaNameMappings[extKey][schemaName] = schemaName;
					mainSchemas[finalSchemaName] = scrubUnwantedKeys(schema);
				}
			}
		}
	}
	for (const [extKey, mapping] of Object.entries(schemaNameMappings)) for (const [, finalName] of Object.entries(mapping)) {
		const schema = mainSchemas[finalName];
		if (schema) mainSchemas[finalName] = updateInternalRefs(schema, extKey, schemaNameMappings);
	}
	return schemaNameMappings;
}
/**
* Remove unwanted keys like $schema and $id from objects
*/
function scrubUnwantedKeys(obj) {
	const UNWANTED_KEYS = new Set(["$schema", "$id"]);
	if (obj === null || obj === void 0) return obj;
	if (Array.isArray(obj)) return obj.map((x) => scrubUnwantedKeys(x));
	if (isObject(obj)) {
		const rec = obj;
		const out = {};
		for (const [k, v] of Object.entries(rec)) {
			if (UNWANTED_KEYS.has(k)) continue;
			out[k] = scrubUnwantedKeys(v);
		}
		return out;
	}
	return obj;
}
/**
* Update internal refs within an external schema to use suffixed names
*/
function updateInternalRefs(obj, extKey, schemaNameMappings) {
	if (obj === null || obj === void 0) return obj;
	if (Array.isArray(obj)) return obj.map((element) => updateInternalRefs(element, extKey, schemaNameMappings));
	if (isObject(obj)) {
		const record = obj;
		if ("$ref" in record && isString(record.$ref)) {
			const refValue = record.$ref;
			if (refValue.startsWith("#/components/schemas/")) {
				const schemaName = refValue.replace("#/components/schemas/", "");
				const mappedName = schemaNameMappings[extKey][schemaName];
				if (mappedName) return { $ref: `#/components/schemas/${mappedName}` };
			}
		}
		const result = {};
		for (const [key, value] of Object.entries(record)) result[key] = updateInternalRefs(value, extKey, schemaNameMappings);
		return result;
	}
	return obj;
}
/**
* Replace x-ext refs with either standard component refs or inlined content
*/
function replaceXExtRefs(obj, extensions, schemaNameMappings) {
	if (isNullish$1(obj)) return obj;
	if (Array.isArray(obj)) return obj.map((element) => replaceXExtRefs(element, extensions, schemaNameMappings));
	if (isObject(obj)) {
		const record = obj;
		if ("$ref" in record && isString(record.$ref)) {
			const refValue = record.$ref;
			if (refValue.startsWith("#/x-ext/")) {
				const parts = refValue.replace("#/x-ext/", "").split("/");
				const extKey = parts.shift();
				if (extKey) {
					if (parts.length >= 3 && parts[0] === "components" && parts[1] === "schemas") {
						const schemaName = parts.slice(2).join("/");
						return { $ref: `#/components/schemas/${schemaNameMappings[extKey][schemaName] || schemaName}` };
					}
					let refObj = extensions[extKey];
					for (const p of parts) if (refObj && (isObject(refObj) || Array.isArray(refObj)) && p in refObj) refObj = refObj[p];
					else {
						refObj = void 0;
						break;
					}
					if (refObj) return replaceXExtRefs(scrubUnwantedKeys(refObj), extensions, schemaNameMappings);
				}
			}
		}
		const result = {};
		for (const [key, value] of Object.entries(record)) result[key] = replaceXExtRefs(value, extensions, schemaNameMappings);
		return result;
	}
	return obj;
}

//#endregion
//#region src/formatters/prettier.ts
/**
* Format files with prettier.
* Tries the programmatic API first (project dependency),
* then falls back to the globally installed CLI.
*/
async function formatWithPrettier(paths, projectTitle) {
	const prettier = await tryImportPrettier();
	if (prettier) {
		const filePaths = await collectFilePaths(paths);
		const config = await prettier.resolveConfig(filePaths[0]);
		await Promise.all(filePaths.map(async (filePath) => {
			const content = await fs$1.readFile(filePath, "utf8");
			try {
				const formatted = await prettier.format(content, {
					...config,
					filepath: filePath
				});
				await fs$1.writeFile(filePath, formatted);
			} catch (error) {
				if (error instanceof Error) if (error.name === "UndefinedParserError") {} else log(styleText("yellow", `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}Failed to format file ${filePath}: ${error.toString()}`));
				else log(styleText("yellow", `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}Failed to format file ${filePath}: unknown error}`));
			}
		}));
		return;
	}
	try {
		await execa("prettier", ["--write", ...paths]);
	} catch {
		log(styleText("yellow", `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}prettier not found. Install it as a project dependency or globally.`));
	}
}
/**
* Try to import prettier from the project's dependencies.
* Returns undefined if prettier is not installed.
*/
async function tryImportPrettier() {
	try {
		return await import("prettier");
	} catch {
		return;
	}
}
/**
* Recursively collect absolute file paths from a mix of files and directories.
*/
async function collectFilePaths(paths) {
	const results = [];
	for (const p of paths) {
		const absolute = path.resolve(p);
		try {
			const stat = await fs$1.stat(absolute);
			if (stat.isFile()) results.push(absolute);
			else if (stat.isDirectory()) {
				const subFiles = await collectFilePaths((await fs$1.readdir(absolute)).map((entry) => path.join(absolute, entry)));
				results.push(...subFiles);
			}
		} catch {}
	}
	return results;
}

//#endregion
//#region src/utils/execute-hook.ts
const executeHook = async (name, commands = [], args = []) => {
	log(styleText("white", `Running ${name} hook...`));
	for (const command of commands) try {
		if (isString(command)) await executeCommand(command, args);
		else if (isFunction(command)) await command(args);
		else if (isObject(command)) await executeObjectCommand(command, args);
	} catch (error) {
		logError(error, `Failed to run ${name} hook`);
	}
};
async function executeCommand(command, args) {
	const [cmd, ..._args] = [...parseArgsStringToArgv(command), ...args];
	await execa(cmd, _args);
}
async function executeObjectCommand(command, args) {
	if (command.injectGeneratedDirsAndFiles === false) args = [];
	if (isString(command.command)) await executeCommand(command.command, args);
	else if (isFunction(command.command)) await command.command();
}

//#endregion
//#region src/utils/package-json.ts
const loadPackageJson = async (packageJson, workspace = process.cwd()) => {
	if (!packageJson) {
		const pkgPath = await findUp(["package.json"], { cwd: workspace });
		if (pkgPath) {
			const pkg = await dynamicImport(pkgPath, workspace);
			if (isPackageJson(pkg)) return resolveAndAttachVersions(await maybeReplaceCatalog(pkg, workspace), workspace, pkgPath);
			else throw new Error("Invalid package.json file");
		}
		return;
	}
	const normalizedPath = normalizePath(packageJson, workspace);
	if (fs.existsSync(normalizedPath)) {
		const pkg = await dynamicImport(normalizedPath);
		if (isPackageJson(pkg)) return resolveAndAttachVersions(await maybeReplaceCatalog(pkg, workspace), workspace, normalizedPath);
		else throw new Error(`Invalid package.json file: ${normalizedPath}`);
	}
};
const isPackageJson = (obj) => isObject(obj);
const resolvedCache = /* @__PURE__ */ new Map();
const resolveAndAttachVersions = (pkg, workspace, cacheKey) => {
	const cached = resolvedCache.get(cacheKey);
	if (cached) {
		pkg.resolvedVersions = cached;
		return pkg;
	}
	const resolved = resolveInstalledVersions(pkg, workspace);
	if (Object.keys(resolved).length > 0) {
		pkg.resolvedVersions = resolved;
		resolvedCache.set(cacheKey, resolved);
		for (const [name, version] of Object.entries(resolved)) logVerbose(styleText("dim", `Detected ${styleText("white", name)} v${styleText("white", version)}`));
	}
	return pkg;
};
const hasCatalogReferences = (pkg) => {
	return [
		...Object.entries(pkg.dependencies ?? {}),
		...Object.entries(pkg.devDependencies ?? {}),
		...Object.entries(pkg.peerDependencies ?? {})
	].some(([, value]) => isString(value) && value.startsWith("catalog:"));
};
const loadPnpmWorkspaceCatalog = async (workspace) => {
	const filePath = await findUp("pnpm-workspace.yaml", { cwd: workspace });
	if (!filePath) return void 0;
	try {
		const file = await fs.readFile(filePath, "utf8");
		const data = yaml.load(file);
		if (!data?.catalog && !data?.catalogs) return void 0;
		return {
			catalog: data.catalog,
			catalogs: data.catalogs
		};
	} catch {
		return;
	}
};
const loadPackageJsonCatalog = async (workspace) => {
	const filePaths = await findUpMultiple("package.json", { cwd: workspace });
	for (const filePath of filePaths) try {
		const pkg = await fs.readJson(filePath);
		if (pkg.catalog || pkg.catalogs) return {
			catalog: pkg.catalog,
			catalogs: pkg.catalogs
		};
	} catch {}
};
const loadYarnrcCatalog = async (workspace) => {
	const filePath = await findUp(".yarnrc.yml", { cwd: workspace });
	if (!filePath) return void 0;
	try {
		const file = await fs.readFile(filePath, "utf8");
		const data = yaml.load(file);
		if (!data?.catalog && !data?.catalogs) return void 0;
		return {
			catalog: data.catalog,
			catalogs: data.catalogs
		};
	} catch {
		return;
	}
};
const maybeReplaceCatalog = async (pkg, workspace) => {
	if (!hasCatalogReferences(pkg)) return pkg;
	const catalogData = await loadPnpmWorkspaceCatalog(workspace) ?? await loadPackageJsonCatalog(workspace) ?? await loadYarnrcCatalog(workspace);
	if (!catalogData) {
		log(`⚠️  ${styleText("yellow", "package.json contains catalog: references, but no catalog source was found (checked: pnpm-workspace.yaml, package.json, .yarnrc.yml).")}`);
		return pkg;
	}
	performSubstitution(pkg.dependencies, catalogData);
	performSubstitution(pkg.devDependencies, catalogData);
	performSubstitution(pkg.peerDependencies, catalogData);
	return pkg;
};
const performSubstitution = (dependencies, catalogData) => {
	if (!dependencies) return;
	for (const [packageName, version] of Object.entries(dependencies)) if (version === "catalog:" || version === "catalog:default") {
		if (!catalogData.catalog) {
			log(`⚠️  ${styleText("yellow", `catalog: substitution for the package '${packageName}' failed as there is no default catalog.`)}`);
			continue;
		}
		const sub = catalogData.catalog[packageName];
		if (!sub) {
			log(`⚠️  ${styleText("yellow", `catalog: substitution for the package '${packageName}' failed as there is no matching package in the default catalog.`)}`);
			continue;
		}
		dependencies[packageName] = sub;
	} else if (version.startsWith("catalog:")) {
		const catalogName = version.slice(8);
		const catalog = catalogData.catalogs?.[catalogName];
		if (!catalog) {
			log(`⚠️  ${styleText("yellow", `'${version}' substitution for the package '${packageName}' failed as there is no matching catalog named '${catalogName}'. (available named catalogs are: ${Object.keys(catalogData.catalogs ?? {}).join(", ")})`)}`);
			continue;
		}
		const sub = catalog[packageName];
		if (!sub) {
			log(`⚠️  ${styleText("yellow", `'${version}' substitution for the package '${packageName}' failed as there is no package in the catalog named '${catalogName}'. (packages in the catalog are: ${Object.keys(catalog).join(", ")})`)}`);
			continue;
		}
		dependencies[packageName] = sub;
	}
};

//#endregion
//#region src/utils/tsconfig.ts
const loadTsconfig = async (tsconfig, workspace = process.cwd()) => {
	if (isNullish(tsconfig)) {
		const configPath = await findUp(["tsconfig.json", "jsconfig.json"], { cwd: workspace });
		if (configPath) return (await parse(configPath)).tsconfig;
		return;
	}
	if (isString(tsconfig)) {
		const normalizedPath = normalizePath(tsconfig, workspace);
		if (fs.existsSync(normalizedPath)) {
			const config = await parse(normalizedPath);
			return config.referenced?.find(({ tsconfigFile }) => tsconfigFile === normalizedPath)?.tsconfig ?? config.tsconfig;
		}
		return;
	}
	if (isObject(tsconfig)) return tsconfig;
};

//#endregion
//#region src/utils/options.ts
/**
* Type helper to make it easier to use orval.config.ts
* accepts a direct {@link ConfigExternal} object.
*/
function defineConfig(options) {
	return options;
}
/**
* Type helper to make it easier to write input transformers.
* accepts a direct {@link InputTransformerFn} function.
*/
function defineTransformer(transformer) {
	return transformer;
}
function createFormData(workspace, formData) {
	const defaultArrayHandling = FormDataArrayHandling.SERIALIZE;
	if (formData === void 0) return {
		disabled: false,
		arrayHandling: defaultArrayHandling
	};
	if (isBoolean(formData)) return {
		disabled: !formData,
		arrayHandling: defaultArrayHandling
	};
	if (isString(formData)) return {
		disabled: false,
		mutator: normalizeMutator(workspace, formData),
		arrayHandling: defaultArrayHandling
	};
	if ("mutator" in formData || "arrayHandling" in formData) return {
		disabled: false,
		mutator: normalizeMutator(workspace, formData.mutator),
		arrayHandling: formData.arrayHandling ?? defaultArrayHandling
	};
	return {
		disabled: false,
		mutator: normalizeMutator(workspace, formData),
		arrayHandling: defaultArrayHandling
	};
}
function normalizeSchemasOption(schemas, workspace) {
	if (!schemas) return;
	if (isString(schemas)) return normalizePath(schemas, workspace);
	return {
		path: normalizePath(schemas.path, workspace),
		type: schemas.type
	};
}
async function normalizeOptions(optionsExport, workspace = process.cwd(), globalOptions = {}) {
	const options = await (isFunction(optionsExport) ? optionsExport() : optionsExport);
	if (!options.input) throw new Error(styleText("red", `Config require an input`));
	if (!options.output) throw new Error(styleText("red", `Config require an output`));
	const inputOptions = isString(options.input) || Array.isArray(options.input) ? { target: options.input } : options.input;
	const outputOptions = isString(options.output) ? { target: options.output } : options.output;
	const outputWorkspace = normalizePath(outputOptions.workspace ?? "", workspace);
	const { clean, prettier, client, httpClient, mode, biome } = globalOptions;
	const tsconfig = await loadTsconfig(outputOptions.tsconfig ?? globalOptions.tsconfig, workspace);
	const packageJson = await loadPackageJson(outputOptions.packageJson ?? globalOptions.packageJson, workspace);
	const mockOption = outputOptions.mock ?? globalOptions.mock;
	let mock;
	if (isBoolean(mockOption) && mockOption) mock = DEFAULT_MOCK_OPTIONS;
	else if (isFunction(mockOption)) mock = mockOption;
	else if (mockOption) mock = {
		...DEFAULT_MOCK_OPTIONS,
		...mockOption
	};
	else mock = void 0;
	const defaultFileExtension = ".ts";
	const globalQueryOptions = {
		useQuery: true,
		useMutation: true,
		signal: true,
		shouldExportMutatorHooks: true,
		shouldExportHttpClient: true,
		shouldExportQueryKey: true,
		shouldSplitQueryKey: false,
		...normalizeQueryOptions(outputOptions.override?.query, workspace)
	};
	let resolvedInputTarget;
	if (globalOptions.input) resolvedInputTarget = Array.isArray(globalOptions.input) ? await resolveFirstValidTarget(globalOptions.input, process.cwd(), inputOptions.parserOptions) : normalizePathOrUrl(globalOptions.input, process.cwd());
	else if (Array.isArray(inputOptions.target)) resolvedInputTarget = await resolveFirstValidTarget(inputOptions.target, workspace, inputOptions.parserOptions);
	else resolvedInputTarget = normalizePathOrUrl(inputOptions.target, workspace);
	const normalizedOptions = {
		input: {
			target: resolvedInputTarget,
			override: { transformer: normalizePath(inputOptions.override?.transformer, workspace) },
			filters: inputOptions.filters,
			parserOptions: inputOptions.parserOptions
		},
		output: {
			target: globalOptions.output ? normalizePath(globalOptions.output, process.cwd()) : normalizePath(outputOptions.target, outputWorkspace),
			schemas: normalizeSchemasOption(outputOptions.schemas, outputWorkspace),
			operationSchemas: outputOptions.operationSchemas ? normalizePath(outputOptions.operationSchemas, outputWorkspace) : void 0,
			namingConvention: outputOptions.namingConvention ?? NamingConvention.CAMEL_CASE,
			fileExtension: outputOptions.fileExtension ?? defaultFileExtension,
			workspace: outputOptions.workspace ? outputWorkspace : void 0,
			client: outputOptions.client ?? client ?? OutputClient.AXIOS_FUNCTIONS,
			httpClient: outputOptions.httpClient ?? httpClient ?? ((outputOptions.client ?? client) === OutputClient.ANGULAR_QUERY ? OutputHttpClient.ANGULAR : OutputHttpClient.FETCH),
			mode: normalizeOutputMode(outputOptions.mode ?? mode),
			mock,
			clean: outputOptions.clean ?? clean ?? false,
			docs: outputOptions.docs ?? false,
			prettier: outputOptions.prettier ?? prettier ?? false,
			biome: outputOptions.biome ?? biome ?? false,
			tsconfig,
			packageJson,
			headers: outputOptions.headers ?? false,
			indexFiles: outputOptions.indexFiles ?? true,
			baseUrl: outputOptions.baseUrl,
			unionAddMissingProperties: outputOptions.unionAddMissingProperties ?? false,
			override: {
				...outputOptions.override,
				mock: {
					arrayMin: outputOptions.override?.mock?.arrayMin ?? 1,
					arrayMax: outputOptions.override?.mock?.arrayMax ?? 10,
					stringMin: outputOptions.override?.mock?.stringMin ?? 10,
					stringMax: outputOptions.override?.mock?.stringMax ?? 20,
					fractionDigits: outputOptions.override?.mock?.fractionDigits ?? 2,
					...outputOptions.override?.mock
				},
				operations: normalizeOperationsAndTags(outputOptions.override?.operations ?? {}, outputWorkspace, { query: globalQueryOptions }),
				tags: normalizeOperationsAndTags(outputOptions.override?.tags ?? {}, outputWorkspace, { query: globalQueryOptions }),
				mutator: normalizeMutator(outputWorkspace, outputOptions.override?.mutator),
				formData: createFormData(outputWorkspace, outputOptions.override?.formData),
				formUrlEncoded: (isBoolean(outputOptions.override?.formUrlEncoded) ? outputOptions.override.formUrlEncoded : normalizeMutator(outputWorkspace, outputOptions.override?.formUrlEncoded)) ?? true,
				paramsSerializer: normalizeMutator(outputWorkspace, outputOptions.override?.paramsSerializer),
				header: outputOptions.override?.header === false ? false : isFunction(outputOptions.override?.header) ? outputOptions.override.header : getDefaultFilesHeader,
				requestOptions: outputOptions.override?.requestOptions ?? true,
				namingConvention: outputOptions.override?.namingConvention ?? {},
				components: {
					schemas: {
						suffix: RefComponentSuffix.schemas,
						itemSuffix: outputOptions.override?.components?.schemas?.itemSuffix ?? "Item",
						...outputOptions.override?.components?.schemas
					},
					responses: {
						suffix: RefComponentSuffix.responses,
						...outputOptions.override?.components?.responses
					},
					parameters: {
						suffix: RefComponentSuffix.parameters,
						...outputOptions.override?.components?.parameters
					},
					requestBodies: {
						suffix: RefComponentSuffix.requestBodies,
						...outputOptions.override?.components?.requestBodies
					}
				},
				hono: normalizeHonoOptions(outputOptions.override?.hono, workspace),
				jsDoc: normalizeJSDocOptions(outputOptions.override?.jsDoc),
				query: globalQueryOptions,
				zod: {
					strict: {
						param: outputOptions.override?.zod?.strict?.param ?? false,
						query: outputOptions.override?.zod?.strict?.query ?? false,
						header: outputOptions.override?.zod?.strict?.header ?? false,
						body: outputOptions.override?.zod?.strict?.body ?? false,
						response: outputOptions.override?.zod?.strict?.response ?? false
					},
					generate: {
						param: outputOptions.override?.zod?.generate?.param ?? true,
						query: outputOptions.override?.zod?.generate?.query ?? true,
						header: outputOptions.override?.zod?.generate?.header ?? true,
						body: outputOptions.override?.zod?.generate?.body ?? true,
						response: outputOptions.override?.zod?.generate?.response ?? true
					},
					coerce: {
						param: outputOptions.override?.zod?.coerce?.param ?? false,
						query: outputOptions.override?.zod?.coerce?.query ?? false,
						header: outputOptions.override?.zod?.coerce?.header ?? false,
						body: outputOptions.override?.zod?.coerce?.body ?? false,
						response: outputOptions.override?.zod?.coerce?.response ?? false
					},
					preprocess: {
						...outputOptions.override?.zod?.preprocess?.param ? { param: normalizeMutator(workspace, outputOptions.override.zod.preprocess.param) } : {},
						...outputOptions.override?.zod?.preprocess?.query ? { query: normalizeMutator(workspace, outputOptions.override.zod.preprocess.query) } : {},
						...outputOptions.override?.zod?.preprocess?.header ? { header: normalizeMutator(workspace, outputOptions.override.zod.preprocess.header) } : {},
						...outputOptions.override?.zod?.preprocess?.body ? { body: normalizeMutator(workspace, outputOptions.override.zod.preprocess.body) } : {},
						...outputOptions.override?.zod?.preprocess?.response ? { response: normalizeMutator(workspace, outputOptions.override.zod.preprocess.response) } : {}
					},
					generateEachHttpStatus: outputOptions.override?.zod?.generateEachHttpStatus ?? false,
					dateTimeOptions: outputOptions.override?.zod?.dateTimeOptions ?? {},
					timeOptions: outputOptions.override?.zod?.timeOptions ?? {}
				},
				swr: {
					generateErrorTypes: false,
					...outputOptions.override?.swr
				},
				angular: {
					provideIn: outputOptions.override?.angular?.provideIn ?? "root",
					runtimeValidation: outputOptions.override?.angular?.runtimeValidation ?? false
				},
				fetch: {
					includeHttpResponseReturnType: outputOptions.override?.fetch?.includeHttpResponseReturnType ?? true,
					forceSuccessResponse: outputOptions.override?.fetch?.forceSuccessResponse ?? false,
					runtimeValidation: outputOptions.override?.fetch?.runtimeValidation ?? false,
					...outputOptions.override?.fetch,
					...outputOptions.override?.fetch?.jsonReviver ? { jsonReviver: normalizeMutator(outputWorkspace, outputOptions.override.fetch.jsonReviver) } : {}
				},
				useDates: outputOptions.override?.useDates ?? false,
				useDeprecatedOperations: outputOptions.override?.useDeprecatedOperations ?? true,
				enumGenerationType: outputOptions.override?.enumGenerationType ?? "const",
				suppressReadonlyModifier: outputOptions.override?.suppressReadonlyModifier ?? false,
				aliasCombinedTypes: outputOptions.override?.aliasCombinedTypes ?? false
			},
			allParamsOptional: outputOptions.allParamsOptional ?? false,
			urlEncodeParameters: outputOptions.urlEncodeParameters ?? false,
			optionsParamRequired: outputOptions.optionsParamRequired ?? false,
			propertySortOrder: outputOptions.propertySortOrder ?? PropertySortOrder.SPECIFICATION
		},
		hooks: options.hooks ? normalizeHooks(options.hooks) : {}
	};
	if (!normalizedOptions.input.target) throw new Error(styleText("red", `Config require an input target`));
	if (!normalizedOptions.output.target && !normalizedOptions.output.schemas) throw new Error(styleText("red", `Config require an output target or schemas`));
	return normalizedOptions;
}
function normalizeMutator(workspace, mutator) {
	if (isObject(mutator)) {
		if (!mutator.path) throw new Error(styleText("red", `Mutator need a path`));
		return {
			...mutator,
			path: path.resolve(workspace, mutator.path),
			default: mutator.default ?? !mutator.name
		};
	}
	if (isString(mutator)) return {
		path: path.resolve(workspace, mutator),
		default: true
	};
	return mutator;
}
const TARGET_RESOLVE_TIMEOUT_MS = 5e3;
async function resolveFirstValidTarget(targets, workspace, parserOptions) {
	for (const target of targets) if (isUrl(target)) try {
		const headers = getHeadersForUrl(target, parserOptions?.headers);
		const controller = new AbortController();
		const timer = setTimeout(() => {
			controller.abort();
		}, TARGET_RESOLVE_TIMEOUT_MS);
		try {
			const response = await fetch(target, {
				method: "HEAD",
				headers,
				signal: controller.signal
			});
			if (response.ok) return target;
			if (response.status === 405 || response.status === 501) {
				if ((await fetch(target, {
					method: "GET",
					headers,
					signal: controller.signal
				})).ok) return target;
			}
		} finally {
			clearTimeout(timer);
		}
	} catch {
		continue;
	}
	else {
		const resolved = path.resolve(workspace, target);
		try {
			await access(resolved);
			return resolved;
		} catch {
			continue;
		}
	}
	throw new Error(styleText("red", `None of the input targets could be resolved:\n${targets.map((t) => `  - ${t}`).join("\n")}`));
}
function getHeadersForUrl(url, headersConfig) {
	if (!headersConfig) return {};
	const { hostname } = new URL(url);
	const matched = {};
	for (const entry of headersConfig) if (entry.domains.some((d) => hostname === d || hostname.endsWith(`.${d}`))) Object.assign(matched, entry.headers);
	return matched;
}
function normalizePathOrUrl(path, workspace) {
	if (isString(path) && !isUrl(path)) return normalizePath(path, workspace);
	return path;
}
function normalizePath(path$1, workspace) {
	if (!isString(path$1)) return path$1;
	return path.resolve(workspace, path$1);
}
function normalizeOperationsAndTags(operationsOrTags, workspace, global) {
	return Object.fromEntries(Object.entries(operationsOrTags).map(([key, { transformer, mutator, formData, formUrlEncoded, paramsSerializer, query, zod, ...rest }]) => {
		return [key, {
			...rest,
			...query ? { query: normalizeQueryOptions(query, workspace, global.query) } : {},
			...zod ? { zod: {
				strict: {
					param: zod.strict?.param ?? false,
					query: zod.strict?.query ?? false,
					header: zod.strict?.header ?? false,
					body: zod.strict?.body ?? false,
					response: zod.strict?.response ?? false
				},
				generate: {
					param: zod.generate?.param ?? true,
					query: zod.generate?.query ?? true,
					header: zod.generate?.header ?? true,
					body: zod.generate?.body ?? true,
					response: zod.generate?.response ?? true
				},
				coerce: {
					param: zod.coerce?.param ?? false,
					query: zod.coerce?.query ?? false,
					header: zod.coerce?.header ?? false,
					body: zod.coerce?.body ?? false,
					response: zod.coerce?.response ?? false
				},
				preprocess: {
					...zod.preprocess?.param ? { param: normalizeMutator(workspace, zod.preprocess.param) } : {},
					...zod.preprocess?.query ? { query: normalizeMutator(workspace, zod.preprocess.query) } : {},
					...zod.preprocess?.header ? { header: normalizeMutator(workspace, zod.preprocess.header) } : {},
					...zod.preprocess?.body ? { body: normalizeMutator(workspace, zod.preprocess.body) } : {},
					...zod.preprocess?.response ? { response: normalizeMutator(workspace, zod.preprocess.response) } : {}
				},
				generateEachHttpStatus: zod.generateEachHttpStatus ?? false,
				dateTimeOptions: zod.dateTimeOptions ?? {},
				timeOptions: zod.timeOptions ?? {}
			} } : {},
			...transformer ? { transformer: normalizePath(transformer, workspace) } : {},
			...mutator ? { mutator: normalizeMutator(workspace, mutator) } : {},
			...createFormData(workspace, formData),
			...formUrlEncoded ? { formUrlEncoded: isBoolean(formUrlEncoded) ? formUrlEncoded : normalizeMutator(workspace, formUrlEncoded) } : {},
			...paramsSerializer ? { paramsSerializer: normalizeMutator(workspace, paramsSerializer) } : {}
		}];
	}));
}
function normalizeOutputMode(mode) {
	if (!mode) return OutputMode.SINGLE;
	if (!Object.values(OutputMode).includes(mode)) {
		createLogger().warn(styleText("yellow", `Unknown the provided mode => ${mode}`));
		return OutputMode.SINGLE;
	}
	return mode;
}
function normalizeHooks(hooks) {
	const keys = Object.keys(hooks);
	const result = {};
	for (const key of keys) if (isString(hooks[key])) result[key] = [hooks[key]];
	else if (Array.isArray(hooks[key])) result[key] = hooks[key];
	else if (isFunction(hooks[key])) result[key] = [hooks[key]];
	else if (isObject(hooks[key])) result[key] = [hooks[key]];
	return result;
}
function normalizeHonoOptions(hono = {}, workspace) {
	return {
		...hono.handlers ? { handlers: path.resolve(workspace, hono.handlers) } : {},
		compositeRoute: hono.compositeRoute ? path.resolve(workspace, hono.compositeRoute) : "",
		validator: hono.validator ?? true,
		validatorOutputPath: hono.validatorOutputPath ? path.resolve(workspace, hono.validatorOutputPath) : ""
	};
}
function normalizeJSDocOptions(jsdoc = {}) {
	return { ...jsdoc };
}
function normalizeQueryOptions(queryOptions = {}, outputWorkspace, globalOptions = {}) {
	if (queryOptions.options) console.warn("[WARN] Using query options is deprecated and will be removed in a future major release. Please use queryOptions or mutationOptions instead.");
	return {
		...isNullish(queryOptions.usePrefetch) ? {} : { usePrefetch: queryOptions.usePrefetch },
		...isNullish(queryOptions.useInvalidate) ? {} : { useInvalidate: queryOptions.useInvalidate },
		...isNullish(queryOptions.useQuery) ? {} : { useQuery: queryOptions.useQuery },
		...isNullish(queryOptions.useSuspenseQuery) ? {} : { useSuspenseQuery: queryOptions.useSuspenseQuery },
		...isNullish(queryOptions.useMutation) ? {} : { useMutation: queryOptions.useMutation },
		...isNullish(queryOptions.useInfinite) ? {} : { useInfinite: queryOptions.useInfinite },
		...isNullish(queryOptions.useSuspenseInfiniteQuery) ? {} : { useSuspenseInfiniteQuery: queryOptions.useSuspenseInfiniteQuery },
		...queryOptions.useInfiniteQueryParam ? { useInfiniteQueryParam: queryOptions.useInfiniteQueryParam } : {},
		...queryOptions.options ? { options: queryOptions.options } : {},
		...globalOptions.queryKey ? { queryKey: globalOptions.queryKey } : {},
		...queryOptions.queryKey ? { queryKey: normalizeMutator(outputWorkspace, queryOptions.queryKey) } : {},
		...globalOptions.queryOptions ? { queryOptions: globalOptions.queryOptions } : {},
		...queryOptions.queryOptions ? { queryOptions: normalizeMutator(outputWorkspace, queryOptions.queryOptions) } : {},
		...globalOptions.mutationOptions ? { mutationOptions: globalOptions.mutationOptions } : {},
		...queryOptions.mutationOptions ? { mutationOptions: normalizeMutator(outputWorkspace, queryOptions.mutationOptions) } : {},
		...isNullish(globalOptions.shouldExportQueryKey) ? {} : { shouldExportQueryKey: globalOptions.shouldExportQueryKey },
		...isNullish(queryOptions.shouldExportQueryKey) ? {} : { shouldExportQueryKey: queryOptions.shouldExportQueryKey },
		...isNullish(globalOptions.shouldExportHttpClient) ? {} : { shouldExportHttpClient: globalOptions.shouldExportHttpClient },
		...isNullish(queryOptions.shouldExportHttpClient) ? {} : { shouldExportHttpClient: queryOptions.shouldExportHttpClient },
		...isNullish(globalOptions.shouldExportMutatorHooks) ? {} : { shouldExportMutatorHooks: globalOptions.shouldExportMutatorHooks },
		...isNullish(queryOptions.shouldExportMutatorHooks) ? {} : { shouldExportMutatorHooks: queryOptions.shouldExportMutatorHooks },
		...isNullish(globalOptions.shouldSplitQueryKey) ? {} : { shouldSplitQueryKey: globalOptions.shouldSplitQueryKey },
		...isNullish(queryOptions.shouldSplitQueryKey) ? {} : { shouldSplitQueryKey: queryOptions.shouldSplitQueryKey },
		...isNullish(globalOptions.signal) ? {} : { signal: globalOptions.signal },
		...isNullish(globalOptions.useOperationIdAsQueryKey) ? {} : { useOperationIdAsQueryKey: globalOptions.useOperationIdAsQueryKey },
		...isNullish(queryOptions.useOperationIdAsQueryKey) ? {} : { useOperationIdAsQueryKey: queryOptions.useOperationIdAsQueryKey },
		...isNullish(globalOptions.signal) ? {} : { signal: globalOptions.signal },
		...isNullish(queryOptions.signal) ? {} : { signal: queryOptions.signal },
		...isNullish(globalOptions.version) ? {} : { version: globalOptions.version },
		...isNullish(queryOptions.version) ? {} : { version: queryOptions.version },
		...queryOptions.mutationInvalidates ? { mutationInvalidates: queryOptions.mutationInvalidates } : {},
		...isNullish(globalOptions.runtimeValidation) ? {} : { runtimeValidation: globalOptions.runtimeValidation },
		...isNullish(queryOptions.runtimeValidation) ? {} : { runtimeValidation: queryOptions.runtimeValidation }
	};
}
function getDefaultFilesHeader({ title, description, version: version$1 } = {}) {
	return [
		`Generated by ${name} v${version} 🍺`,
		`Do not edit manually.`,
		...title ? [title] : [],
		...description ? [description] : [],
		...version$1 ? [`OpenAPI spec version: ${version$1}`] : []
	];
}

//#endregion
//#region src/utils/watcher.ts
/**
* Start a file watcher and invoke an async callback on file changes.
*
* If `watchOptions` is falsy the watcher is not started. Supported shapes:
*  - boolean: when true the `defaultTarget` is watched
*  - string: a single path to watch
*  - string[]: an array of paths to watch
*
* @param watchOptions - false to disable watching, or a path/paths to watch
* @param watchFn - async callback executed on change events
* @param defaultTarget - path(s) to watch when `watchOptions` is `true` (default: '.')
* @returns Resolves once the watcher has been started (or immediately if disabled)
*
* @example
* await startWatcher(true, async () => { await buildProject(); }, 'src');
*/
async function startWatcher(watchOptions, watchFn, defaultTarget = ".") {
	if (!watchOptions) return;
	const { watch } = await import("chokidar");
	const ignored = ["**/{.git,node_modules}/**"];
	const watchPaths = isBoolean(watchOptions) ? defaultTarget : watchOptions;
	log(`Watching for changes in ${Array.isArray(watchPaths) ? watchPaths.map((v) => "\"" + v + "\"").join(" | ") : "\"" + watchPaths + "\""}`);
	watch(watchPaths, {
		ignorePermissionErrors: true,
		ignored
	}).on("all", (type, file) => {
		log(`Change detected: ${type} ${file}`);
		watchFn().catch((error) => {
			logError(error);
		});
	});
}

//#endregion
//#region src/write-zod-specs.ts
function generateZodSchemaFileContent(header, schemas) {
	return `${header}import { z as zod } from 'zod';

${schemas.map(({ schemaName, consts, zodExpression }) => {
		return `${consts ? `${consts}\n` : ""}export const ${schemaName} = ${zodExpression}

export type ${schemaName} = zod.input<typeof ${schemaName}>;`;
	}).join("\n\n")}
`;
}
const isValidSchemaIdentifier = (name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
const isPrimitiveSchemaName = (name) => [
	"string",
	"number",
	"boolean",
	"void",
	"unknown",
	"Blob"
].includes(name);
const dedupeSchemasByName = (schemas) => {
	const uniqueSchemas = /* @__PURE__ */ new Map();
	for (const schema of schemas) if (!uniqueSchemas.has(schema.name)) uniqueSchemas.set(schema.name, schema);
	return [...uniqueSchemas.values()];
};
const groupSchemasByFilePath = (schemas) => {
	const grouped = /* @__PURE__ */ new Map();
	for (const schema of schemas) {
		const key = schema.filePath.toLowerCase();
		const existingGroup = grouped.get(key);
		if (existingGroup) existingGroup.push(schema);
		else grouped.set(key, [schema]);
	}
	return [...grouped.values()].map((group) => [...group].toSorted((a, b) => a.filePath.localeCompare(b.filePath))).toSorted((a, b) => a[0].filePath.localeCompare(b[0].filePath));
};
async function writeZodSchemaIndex(schemasPath, fileExtension, header, schemaNames, namingConvention, shouldMergeExisting = false) {
	const importFileExtension = fileExtension.replace(/\.ts$/, "");
	const indexPath = path.join(schemasPath, `index${fileExtension}`);
	let existingExports = "";
	if (shouldMergeExisting && await fs.pathExists(indexPath)) {
		const existingContent = await fs.readFile(indexPath, "utf8");
		const headerMatch = /^(\/\*\*[\s\S]*?\*\/\n)?/.exec(existingContent);
		const headerPart = headerMatch ? headerMatch[0] : "";
		existingExports = existingContent.slice(headerPart.length).trim();
	}
	const newExports = schemaNames.map((schemaName) => {
		return `export * from './${conventionName(schemaName, namingConvention)}${importFileExtension}';`;
	}).toSorted().join("\n");
	const allExports = existingExports ? `${existingExports}\n${newExports}` : newExports;
	const uniqueExports = [...new Set(allExports.split("\n"))].filter((line) => line.trim()).toSorted().join("\n");
	await fs.outputFile(indexPath, `${header}\n${uniqueExports}\n`);
}
async function writeZodSchemas(builder, schemasPath, fileExtension, header, output) {
	const schemasWithOpenApiDef = builder.schemas.filter((s) => s.schema);
	const schemasToWrite = [];
	const isZodV4 = !!output.packageJson && isZodVersionV4(output.packageJson);
	const strict = output.override.zod.strict.body;
	const coerce = output.override.zod.coerce.body;
	for (const generatorSchema of schemasWithOpenApiDef) {
		const { name, schema: schemaObject } = generatorSchema;
		if (!schemaObject) continue;
		const fileName = conventionName(name, output.namingConvention);
		const filePath = path.join(schemasPath, `${fileName}${fileExtension}`);
		const context = {
			spec: builder.spec,
			target: builder.target,
			workspace: "",
			output
		};
		const parsedZodDefinition = parseZodValidationSchemaDefinition(generateZodValidationSchemaDefinition(dereference(schemaObject, context), context, name, strict, isZodV4, { required: true }), context, coerce, strict, isZodV4);
		schemasToWrite.push({
			schemaName: name,
			filePath,
			consts: parsedZodDefinition.consts,
			zodExpression: parsedZodDefinition.zod
		});
	}
	const groupedSchemasToWrite = groupSchemasByFilePath(schemasToWrite);
	for (const schemaGroup of groupedSchemasToWrite) {
		const fileContent = generateZodSchemaFileContent(header, schemaGroup);
		await fs.outputFile(schemaGroup[0].filePath, fileContent);
	}
	if (output.indexFiles) await writeZodSchemaIndex(schemasPath, fileExtension, header, groupedSchemasToWrite.map((schemaGroup) => schemaGroup[0].schemaName), output.namingConvention, false);
}
async function writeZodSchemasFromVerbs(verbOptions, schemasPath, fileExtension, header, output, context) {
	const zodContext = context;
	const verbOptionsArray = Object.values(verbOptions);
	if (verbOptionsArray.length === 0) return;
	const isZodV4 = !!output.packageJson && isZodVersionV4(output.packageJson);
	const strict = output.override.zod.strict.body;
	const coerce = output.override.zod.coerce.body;
	const uniqueVerbsSchemas = dedupeSchemasByName(verbOptionsArray.flatMap((verbOption) => {
		const operation = verbOption.originalOperation;
		const requestBody = operation.requestBody;
		const bodySchema = (requestBody && "content" in requestBody ? requestBody.content : void 0)?.["application/json"]?.schema;
		const bodySchemas = bodySchema ? [{
			name: `${pascal(verbOption.operationName)}Body`,
			schema: dereference(bodySchema, zodContext)
		}] : [];
		const parameters = operation.parameters;
		const queryParams = parameters?.filter((p) => "in" in p && p.in === "query");
		const queryParamsSchemas = queryParams && queryParams.length > 0 ? [{
			name: `${pascal(verbOption.operationName)}Params`,
			schema: {
				type: "object",
				properties: Object.fromEntries(queryParams.filter((p) => "schema" in p && p.schema).map((p) => [p.name, dereference(p.schema, zodContext)])),
				required: queryParams.filter((p) => p.required).map((p) => p.name).filter((name) => name !== void 0)
			}
		}] : [];
		const headerParams = parameters?.filter((p) => "in" in p && p.in === "header");
		const headerParamsSchemas = headerParams && headerParams.length > 0 ? [{
			name: `${pascal(verbOption.operationName)}Headers`,
			schema: {
				type: "object",
				properties: Object.fromEntries(headerParams.filter((p) => "schema" in p && p.schema).map((p) => [p.name, dereference(p.schema, zodContext)])),
				required: headerParams.filter((p) => p.required).map((p) => p.name).filter((name) => name !== void 0)
			}
		}] : [];
		const responseSchemas = [...verbOption.response.types.success, ...verbOption.response.types.errors].filter((responseType) => !!responseType.originalSchema && !responseType.isRef && isValidSchemaIdentifier(responseType.value) && !isPrimitiveSchemaName(responseType.value)).map((responseType) => ({
			name: responseType.value,
			schema: dereference(responseType.originalSchema, zodContext)
		}));
		return dedupeSchemasByName([
			...bodySchemas,
			...queryParamsSchemas,
			...headerParamsSchemas,
			...responseSchemas
		]);
	}));
	const schemasToWrite = [];
	for (const { name, schema } of uniqueVerbsSchemas) {
		const fileName = conventionName(name, output.namingConvention);
		const filePath = path.join(schemasPath, `${fileName}${fileExtension}`);
		const parsedZodDefinition = parseZodValidationSchemaDefinition(generateZodValidationSchemaDefinition(schema, zodContext, name, strict, isZodV4, { required: true }), zodContext, coerce, strict, isZodV4);
		schemasToWrite.push({
			schemaName: name,
			filePath,
			consts: parsedZodDefinition.consts,
			zodExpression: parsedZodDefinition.zod
		});
	}
	const groupedSchemasToWrite = groupSchemasByFilePath(schemasToWrite);
	for (const schemaGroup of groupedSchemasToWrite) {
		const fileContent = generateZodSchemaFileContent(header, schemaGroup);
		await fs.outputFile(schemaGroup[0].filePath, fileContent);
	}
	if (output.indexFiles && uniqueVerbsSchemas.length > 0) await writeZodSchemaIndex(schemasPath, fileExtension, header, groupedSchemasToWrite.map((schemaGroup) => schemaGroup[0].schemaName), output.namingConvention, true);
}

//#endregion
//#region src/write-specs.ts
function getHeader(option, info) {
	if (!option) return "";
	const header = option(info);
	return Array.isArray(header) ? jsDoc({ description: header }) : header;
}
/**
* Add re-export of operation schemas from the main schemas index file.
* Handles the case where the index file doesn't exist (no regular schemas).
*/
async function addOperationSchemasReExport(schemaPath, operationSchemasPath, fileExtension, header) {
	const schemaIndexPath = path.join(schemaPath, `index${fileExtension}`);
	const esmImportPath = upath.getRelativeImportPath(schemaIndexPath, operationSchemasPath);
	const exportLine = `export * from '${esmImportPath}';\n`;
	if (await fs.pathExists(schemaIndexPath)) {
		const existingContent = await fs.readFile(schemaIndexPath, "utf8");
		if (!new RegExp(String.raw`export\s*\*\s*from\s*['"]${esmImportPath.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)}['"]`).test(existingContent)) await fs.appendFile(schemaIndexPath, exportLine);
	} else {
		const content = header && header.trim().length > 0 ? `${header}\n${exportLine}` : exportLine;
		await fs.outputFile(schemaIndexPath, content);
	}
}
async function writeSpecs(builder, workspace, options, projectName) {
	const { info, schemas, target } = builder;
	const { output } = options;
	const projectTitle = projectName ?? info.title;
	const header = getHeader(output.override.header, info);
	if (output.schemas) if (isString(output.schemas)) {
		const fileExtension = output.fileExtension || ".ts";
		const schemaPath = output.schemas;
		if (output.operationSchemas) {
			const { regularSchemas, operationSchemas: opSchemas } = splitSchemasByType(schemas);
			const regularSchemaNames = new Set(regularSchemas.map((s) => s.name));
			const operationSchemaNames = new Set(opSchemas.map((s) => s.name));
			fixCrossDirectoryImports(opSchemas, regularSchemaNames, schemaPath, output.operationSchemas, output.namingConvention, fileExtension);
			fixRegularSchemaImports(regularSchemas, operationSchemaNames, schemaPath, output.operationSchemas, output.namingConvention, fileExtension);
			if (regularSchemas.length > 0) await writeSchemas({
				schemaPath,
				schemas: regularSchemas,
				target,
				namingConvention: output.namingConvention,
				fileExtension,
				header,
				indexFiles: output.indexFiles
			});
			if (opSchemas.length > 0) {
				await writeSchemas({
					schemaPath: output.operationSchemas,
					schemas: opSchemas,
					target,
					namingConvention: output.namingConvention,
					fileExtension,
					header,
					indexFiles: output.indexFiles
				});
				if (output.indexFiles) await addOperationSchemasReExport(schemaPath, output.operationSchemas, fileExtension, header);
			}
		} else await writeSchemas({
			schemaPath,
			schemas,
			target,
			namingConvention: output.namingConvention,
			fileExtension,
			header,
			indexFiles: output.indexFiles
		});
	} else if (output.schemas.type === "typescript") {
		const fileExtension = output.fileExtension || ".ts";
		if (output.operationSchemas) {
			const { regularSchemas, operationSchemas: opSchemas } = splitSchemasByType(schemas);
			const regularSchemaNames = new Set(regularSchemas.map((s) => s.name));
			const operationSchemaNames = new Set(opSchemas.map((s) => s.name));
			fixCrossDirectoryImports(opSchemas, regularSchemaNames, output.schemas.path, output.operationSchemas, output.namingConvention, fileExtension);
			fixRegularSchemaImports(regularSchemas, operationSchemaNames, output.schemas.path, output.operationSchemas, output.namingConvention, fileExtension);
			if (regularSchemas.length > 0) await writeSchemas({
				schemaPath: output.schemas.path,
				schemas: regularSchemas,
				target,
				namingConvention: output.namingConvention,
				fileExtension,
				header,
				indexFiles: output.indexFiles
			});
			if (opSchemas.length > 0) {
				await writeSchemas({
					schemaPath: output.operationSchemas,
					schemas: opSchemas,
					target,
					namingConvention: output.namingConvention,
					fileExtension,
					header,
					indexFiles: output.indexFiles
				});
				if (output.indexFiles) await addOperationSchemasReExport(output.schemas.path, output.operationSchemas, fileExtension, header);
			}
		} else await writeSchemas({
			schemaPath: output.schemas.path,
			schemas,
			target,
			namingConvention: output.namingConvention,
			fileExtension,
			header,
			indexFiles: output.indexFiles
		});
	} else {
		const fileExtension = ".zod.ts";
		await writeZodSchemas(builder, output.schemas.path, fileExtension, header, output);
		await writeZodSchemasFromVerbs(builder.verbOptions, output.schemas.path, fileExtension, header, output, {
			spec: builder.spec,
			target: builder.target,
			workspace,
			output
		});
	}
	let implementationPaths = [];
	if (output.target) implementationPaths = await getWriteMode(output.mode)({
		builder,
		workspace,
		output,
		projectName,
		header,
		needSchema: !output.schemas && output.client !== "zod"
	});
	if (output.workspace) {
		const workspacePath = output.workspace;
		const indexFile = path.join(workspacePath, "index.ts");
		const imports = implementationPaths.filter((p) => !output.mock || !p.endsWith(`.${getMockFileExtensionByTypeName(output.mock)}.ts`)).map((p) => upath.getRelativeImportPath(indexFile, getFileInfo(p).pathWithoutExtension, true));
		if (output.schemas) {
			const schemasPath = isString(output.schemas) ? output.schemas : output.schemas.path;
			imports.push(upath.getRelativeImportPath(indexFile, getFileInfo(schemasPath).dirname));
		}
		if (output.operationSchemas) imports.push(upath.getRelativeImportPath(indexFile, getFileInfo(output.operationSchemas).dirname));
		if (output.indexFiles) {
			if (await fs.pathExists(indexFile)) {
				const data = await fs.readFile(indexFile, "utf8");
				const importsNotDeclared = imports.filter((imp) => !data.includes(imp));
				await fs.appendFile(indexFile, unique(importsNotDeclared).map((imp) => `export * from '${imp}';\n`).join(""));
			} else await fs.outputFile(indexFile, unique(imports).map((imp) => `export * from '${imp}';`).join("\n") + "\n");
			implementationPaths = [indexFile, ...implementationPaths];
		}
	}
	if (builder.extraFiles.length > 0) {
		await Promise.all(builder.extraFiles.map(async (file) => fs.outputFile(file.path, file.content)));
		implementationPaths = [...implementationPaths, ...builder.extraFiles.map((file) => file.path)];
	}
	const paths = [
		...output.schemas ? [getFileInfo(isString(output.schemas) ? output.schemas : output.schemas.path).dirname] : [],
		...output.operationSchemas ? [getFileInfo(output.operationSchemas).dirname] : [],
		...implementationPaths
	];
	if (options.hooks.afterAllFilesWrite) await executeHook("afterAllFilesWrite", options.hooks.afterAllFilesWrite, paths);
	if (output.prettier) await formatWithPrettier(paths, projectTitle);
	if (output.biome) try {
		await execa("biome", [
			"check",
			"--write",
			...paths
		]);
	} catch (error) {
		let message = `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}biome not found`;
		if (error instanceof ExecaError && error.exitCode === 1) message = error.message;
		log(styleText("yellow", message));
	}
	if (output.docs) try {
		let config = {};
		let configPath;
		if (isObject(output.docs)) {
			({configPath, ...config} = output.docs);
			if (configPath) config.options = configPath;
		}
		const getTypedocApplication = async () => {
			const { Application } = await import("typedoc");
			return Application;
		};
		const app = await (await getTypedocApplication()).bootstrapWithPlugins({
			entryPoints: paths.map((x) => upath.toUnix(x)),
			theme: "markdown",
			...config,
			plugin: ["typedoc-plugin-markdown", ...config.plugin ?? []]
		});
		if (!app.options.isSet("readme")) app.options.setValue("readme", "none");
		if (!app.options.isSet("logLevel")) app.options.setValue("logLevel", "None");
		const project = await app.convert();
		if (project) {
			const outputPath = app.options.getValue("out");
			await app.generateDocs(project, outputPath);
			if (output.prettier) await formatWithPrettier([outputPath], projectTitle);
		} else throw new Error("TypeDoc not initialized");
	} catch (error) {
		log(styleText("yellow", error instanceof Error ? error.message : `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}Unable to generate docs`));
	}
	createSuccessMessage(projectTitle);
}
function getWriteMode(mode) {
	switch (mode) {
		case OutputMode.SPLIT: return writeSplitMode;
		case OutputMode.TAGS: return writeTagsMode;
		case OutputMode.TAGS_SPLIT: return writeSplitTagsMode;
		default: return writeSingleMode;
	}
}

//#endregion
//#region src/generate-spec.ts
/**
* Generate client/spec files for a single Orval project.
*
* @param workspace - Absolute or relative workspace path used to resolve imports.
* @param options - Normalized generation options for this project.
* @param projectName - Optional project name used in logging output.
* @returns A promise that resolves once generation (and optional cleaning) completes.
*
* @example
* await generateSpec(process.cwd(), normalizedOptions, 'my-project');
*/
async function generateSpec(workspace, options, projectName) {
	if (options.output.clean) {
		const extraPatterns = Array.isArray(options.output.clean) ? options.output.clean : [];
		if (options.output.target) await removeFilesAndEmptyFolders([
			"**/*",
			"!**/*.d.ts",
			...extraPatterns
		], getFileInfo(options.output.target).dirname);
		if (options.output.schemas) {
			const schemasPath = isString(options.output.schemas) ? options.output.schemas : options.output.schemas.path;
			await removeFilesAndEmptyFolders([
				"**/*",
				"!**/*.d.ts",
				...extraPatterns
			], getFileInfo(schemasPath).dirname);
		}
		log(`${projectName} Cleaning output folder`);
	}
	await writeSpecs(await importSpecs(workspace, options, projectName), workspace, options, projectName);
}

//#endregion
//#region src/utils/config.ts
/**
* Resolve the Orval config file path.
*
* @param configFilePath - Optional path to the config file (absolute or relative).
* @returns The absolute path to the resolved config file.
* @throws If a provided path does not exist or if no config file is found.
*
* @example
* // explicit path
* const p = findConfigFile('./orval.config.ts');
*
* @example
* // automatic discovery (searches process.cwd())
* const p = findConfigFile();
*/
function findConfigFile(configFilePath) {
	if (configFilePath) {
		const absolutePath = path.isAbsolute(configFilePath) ? configFilePath : path.resolve(process.cwd(), configFilePath);
		if (!fs$2.existsSync(absolutePath)) throw new Error(`Config file ${configFilePath} does not exist`);
		return absolutePath;
	}
	const root = process.cwd();
	for (const ext of [
		".ts",
		".js",
		".mjs",
		".mts"
	]) {
		const fullPath = path.resolve(root, `orval.config${ext}`);
		if (fs$2.existsSync(fullPath)) return fullPath;
	}
	throw new Error(`No config file found in ${root}`);
}
/**
* Load an Orval config file
* @param configFilePath - Path to the config file (absolute or relative).
* @returns The resolved Orval `Config` object.
* @throws If the module does not provide a default export or the default export resolves to `undefined`.
*
* @example
* // load a config object
* const cfg = await loadConfigFile('./orval.config.ts');
*/
async function loadConfigFile(configFilePath) {
	const configExternal = await createJiti(process.cwd(), { interopDefault: true }).import(configFilePath, { default: true });
	if (configExternal === void 0) throw new Error(`${configFilePath} doesn't have a default export`);
	return await (isFunction(configExternal) ? configExternal() : configExternal);
}

//#endregion
export { defineConfig as a, description as c, startWatcher as i, name as l, loadConfigFile as n, defineTransformer as o, generateSpec as r, normalizeOptions as s, findConfigFile as t, version as u };
//# sourceMappingURL=config-Q13xuAhd.mjs.map