"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/dev-banner.ts
var _promises = require('fs/promises'); var _promises2 = _interopRequireDefault(_promises);
var _url = require('url');
var BANNER_SCRIPT_ID = "/@replit/vite-plugin-dev-banner/banner-script.js";
function devBanner() {
  let bannerScript;
  return {
    name: "@replit/vite-plugin-dev-banner",
    enforce: "pre",
    async buildStart() {
      const currentFileUrl = _url.fileURLToPath.call(void 0, 
        new URL("./banner-script.js", import.meta.url)
      );
      try {
        bannerScript = await _promises2.default.readFile(currentFileUrl, "utf-8");
      } catch (error) {
        console.error(
          "[replit-dev-banner] Failed to load banner script:",
          error
        );
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === BANNER_SCRIPT_ID) {
          if (!bannerScript) {
            res.statusCode = 404;
            res.end();
            return;
          }
          res.setHeader("Content-Type", "application/javascript");
          res.end(bannerScript);
          return;
        }
        next();
      });
    },
    transformIndexHtml(html, context) {
      if (_optionalChain([context, 'access', _ => _.server, 'optionalAccess', _2 => _2.config, 'access', _3 => _3.command]) !== "serve") {
        return html;
      }
      return [
        {
          tag: "script",
          attrs: {
            type: "text/javascript",
            src: BANNER_SCRIPT_ID,
            id: "replit-dev-banner"
          },
          injectTo: "head"
        }
      ];
    }
  };
}

// package.json
var version = "0.1.1";



exports.devBanner = devBanner; exports.version = version;
//# sourceMappingURL=index.js.map