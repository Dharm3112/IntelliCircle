'use strict';

var promises = require('node:fs/promises');
var path = require('node:path');

function isStringArray(entryPoints) {
  if (Array.isArray(entryPoints) && entryPoints.some((entrypoint) => typeof entrypoint === "string"))
    return true;
  return false;
}
function transformToObject(entryPoints, outbase) {
  const separator = entryPoints[0].includes("\\") ? path.win32.sep : path.posix.sep;
  let tmpOutbase = "";
  if (!outbase) {
    const hierarchy = entryPoints[0].split(separator);
    let i = 0;
    let nextOutbase = "";
    do {
      tmpOutbase = nextOutbase;
      i++;
      nextOutbase = hierarchy.slice(0, i).join(separator);
    } while (entryPoints.every(
      (entrypoint) => entrypoint.startsWith(`${nextOutbase}${separator}`)
    ));
  }
  const newEntrypoints = {};
  for (const entrypoint of entryPoints) {
    const destination = (tmpOutbase ? entrypoint.replace(`${tmpOutbase}${separator}`, "") : entrypoint).replace(/.(js|ts)$/, "");
    newEntrypoints[destination] = entrypoint;
  }
  return newEntrypoints;
}
function transformToNewEntryPointsType(entryPoints) {
  const newEntrypointsType = [];
  for (const [key, value] of Object.entries(entryPoints)) {
    newEntrypointsType.push({ in: value, out: key });
  }
  return newEntrypointsType;
}
function esbuildPluginPino({
  transports = []
} = {}) {
  return {
    name: "pino",
    async setup(currentBuild) {
      const pino = path.dirname(require.resolve("pino"));
      const threadStream = path.dirname(require.resolve("thread-stream"));
      const { entryPoints, outbase, outExtension } = currentBuild.initialOptions;
      const customEntrypoints = {
        "thread-stream-worker": path.join(threadStream, "lib/worker.js"),
        "pino-worker": path.join(pino, "lib/worker.js"),
        "pino-file": path.join(pino, "file.js")
      };
      try {
        const pinoPipelineWorker = path.join(pino, "lib/worker-pipeline.js");
        await promises.stat(pinoPipelineWorker);
        customEntrypoints["pino-pipeline-worker"] = pinoPipelineWorker;
      } catch (_err) {
      }
      const transportsEntrypoints = Object.fromEntries(
        transports.map((transport) => [transport, require.resolve(transport)])
      );
      let newEntrypoints = [];
      if (isStringArray(entryPoints)) {
        newEntrypoints = transformToNewEntryPointsType({
          ...transformToObject(entryPoints, outbase),
          ...customEntrypoints,
          ...transportsEntrypoints
        });
      } else if (Array.isArray(entryPoints)) {
        newEntrypoints = [
          ...entryPoints,
          ...transformToNewEntryPointsType({
            ...customEntrypoints,
            ...transportsEntrypoints
          })
        ];
      } else {
        newEntrypoints = transformToNewEntryPointsType({
          ...entryPoints,
          ...customEntrypoints,
          ...transportsEntrypoints
        });
      }
      currentBuild.initialOptions.entryPoints = newEntrypoints;
      let pinoBundlerRan = false;
      currentBuild.onEnd(() => {
        pinoBundlerRan = false;
      });
      currentBuild.onLoad({ filter: /pino\.js$/ }, async (args) => {
        if (pinoBundlerRan) return;
        pinoBundlerRan = true;
        const contents = await promises.readFile(args.path, "utf8");
        const { outdir = "dist" } = currentBuild.initialOptions;
        let functionDeclaration = "";
        if (path.isAbsolute(outdir)) {
          functionDeclaration = `
          function pinoBundlerAbsolutePath(p) {
            try {
              const path = require('path');
              // Always resolve to the absolute output directory where worker files are located
              const outputDir = "${outdir.replace(/\\/g, "\\\\")}";
              return path.resolve(outputDir, p.replace(/^\\.\\//, ''));
            } catch(e) {
              // ESM fallback: resolve relative to this bundle's location  
              const f = new Function('p', 'return new URL(p, import.meta.url).pathname');
              return f(p);
            }
          }
        `;
        } else {
          const workingDirTemplate = currentBuild.initialOptions.absWorkingDir ? `"${currentBuild.initialOptions.absWorkingDir.replace(
            /\\/g,
            "\\\\"
          )}"` : "process.cwd()";
          functionDeclaration = `
          function pinoBundlerAbsolutePath(p) {
            try {
              const path = require('path');
              // Runtime resolution: resolve relative to working directory at runtime
              const workingDir = ${workingDirTemplate};
              const outputDir = path.resolve(workingDir, "${outdir}");
              return path.resolve(outputDir, p.replace(/^\\.\\//, ''));
            } catch(e) {
              // ESM fallback: resolve relative to this bundle's location  
              const f = new Function('p', 'return new URL(p, import.meta.url).pathname');
              return f(p);
            }
          }
        `;
        }
        let extension = ".js";
        if (outExtension?.[".js"]) {
          extension = outExtension[".js"];
        }
        const pinoOverrides = Object.keys({
          ...customEntrypoints,
          ...transportsEntrypoints
        }).map(
          (id) => `'${id === "pino-file" ? "pino/file" : id}': pinoBundlerAbsolutePath('./${id}${extension}')`
        ).join(",");
        const globalThisDeclaration = `
          globalThis.__bundlerPathsOverrides = { ...(globalThis.__bundlerPathsOverrides || {}), ${pinoOverrides}}
        `;
        const code = functionDeclaration + globalThisDeclaration;
        return {
          contents: code + contents
        };
      });
    }
  };
}

module.exports = esbuildPluginPino;
module.exports.default = esbuildPluginPino;
module.exports.esbuildPluginPino = esbuildPluginPino;
