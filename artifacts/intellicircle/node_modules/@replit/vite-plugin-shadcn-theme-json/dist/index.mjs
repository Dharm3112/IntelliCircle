// src/index.ts
import fs from "fs/promises";
import path from "path";

// src/createTheme.ts
import Color from "colorjs.io";
import dedent from "dedent";

// src/utils.ts
var WCAG_THRESHOLD = 2.3;
var getForegroundColor = (background, _light, _dark) => {
  const lightColor = _light ?? background.mix("white", 0.97, {
    space: "oklch",
    outputSpace: "oklch"
  });
  const darkColor = _dark ?? background.mix("black", 0.7, {
    space: "oklch",
    outputSpace: "oklch"
  });
  const contrast = background.contrast(lightColor, "WCAG21");
  if (contrast > WCAG_THRESHOLD) {
    return lightColor;
  }
  return darkColor;
};
function toShadCn(color) {
  const [hueStr, saturationPercentStr, lightnessPercentStr] = color.to("hsl").toString().replace("hsl(", "").replace(")", "").split(" ");
  const [hue, saturation, lightness] = [
    parseFloat(hueStr),
    parseFloat(saturationPercentStr.replace("%", "")),
    parseFloat(lightnessPercentStr.replace("%", ""))
  ];
  return `${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%`;
}

// src/createTheme.ts
var createCssVarsString = (vars) => {
  return Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`).join("\n");
};
var createCssString = ({
  appearance,
  lightVars,
  darkVars
}) => {
  if (appearance === "dark") {
    return dedent`
    :root {
      ${createCssVarsString(darkVars)}
    }
    .light {
      ${createCssVarsString(lightVars)}
    }
    `;
  }
  if (appearance === "light") {
    return dedent`
    :root {
      ${createCssVarsString(lightVars)}
    }
    .dark {
      ${createCssVarsString(darkVars)}
    }
    `;
  }
  return dedent`
  :root {
    ${createCssVarsString(lightVars)}
  }

  @media (prefers-color-scheme: dark) {
    :root {
      ${createCssVarsString(darkVars)}
    }
  }
  .light {
    ${createCssVarsString(lightVars)}
  }
  .dark {
    ${createCssVarsString(darkVars)}
  }
  `;
};
var createTheme = ({
  primary: oklch,
  radius: radiusRem,
  variant: kind = "professional",
  appearance
}) => {
  const color = new Color(oklch);
  if (kind === "tint") {
    const lightBg = new Color(color).set("oklch.l", 0.98).set("oklch.c", 0.01);
    const darkBg = new Color(color).set("oklch.l", 0.2).set("oklch.c", 0.02);
    const lightPrimary = new Color(color).set("oklch.l", 0.5);
    const darkPrimary = new Color(color).set("oklch.l", 0.7);
    const lightAccent = new Color(color).set("oklch.l", 0.94).set("oklch.c", 0.05);
    const darkAccent = new Color(color).set("oklch.l", 0.3).set("oklch.c", 0.08);
    const lightBorder = new Color(color).set("oklch.l", 0.9).set("oklch.c", 0.05);
    const darkBorder = new Color(color).set("oklch.l", 0.3).set("oklch.c", 0.08);
    const lightFg = new Color(color).set("oklch.l", 0.1).set("oklch.c", 0.1);
    const darkFg = new Color(color).set("oklch.l", 0.9).set("oklch.c", 0.05);
    const lightVars = {
      "--background": toShadCn(lightBg),
      "--foreground": toShadCn(lightFg),
      "--muted": toShadCn(lightBorder),
      "--muted-foreground": toShadCn(lightFg),
      "--popover": toShadCn(lightBg),
      "--popover-foreground": toShadCn(lightFg),
      "--card": toShadCn(lightBg),
      "--card-foreground": toShadCn(lightFg),
      "--border": toShadCn(lightBorder),
      "--input": toShadCn(lightBorder),
      "--primary": toShadCn(lightPrimary),
      "--primary-foreground": toShadCn(getForegroundColor(lightPrimary)),
      "--secondary": toShadCn(lightAccent),
      "--secondary-foreground": toShadCn(lightFg),
      "--accent": toShadCn(lightAccent),
      "--accent-foreground": toShadCn(lightFg),
      "--destructive": "0 84.2% 60.2%",
      "--destructive-foreground": "60 9.1% 97.8%",
      "--ring": toShadCn(lightPrimary),
      "--radius": `${radiusRem}rem`
    };
    const darkVars = {
      "--background": toShadCn(darkBg),
      "--foreground": toShadCn(darkFg),
      "--muted": toShadCn(darkBorder),
      "--muted-foreground": toShadCn(darkFg),
      "--popover": toShadCn(darkBg),
      "--popover-foreground": toShadCn(darkFg),
      "--card": toShadCn(darkBg),
      "--card-foreground": toShadCn(darkFg),
      "--border": toShadCn(darkBorder),
      "--input": toShadCn(darkBorder),
      "--primary": toShadCn(darkPrimary),
      "--primary-foreground": toShadCn(getForegroundColor(darkPrimary)),
      "--secondary": toShadCn(darkAccent),
      "--secondary-foreground": toShadCn(darkFg),
      "--accent": toShadCn(darkAccent),
      "--accent-foreground": toShadCn(darkFg),
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "0 0% 98%",
      "--ring": toShadCn(darkPrimary),
      "--radius": `${radiusRem}rem`
    };
    return createCssString({ appearance, lightVars, darkVars });
  }
  if (kind === "vibrant") {
    const lightBg = new Color(color).set("oklch.l", 0.8).set("oklch.c", 0.1);
    const lightElementBg = new Color(color).set("oklch.l", 0.98).set("oklch.c", 0.05);
    const lightPrimary = new Color(color).set("oklch.l", 0.7).set("oklch.c", 0.2);
    const lightAccent = new Color(color).set("oklch.l", 0.85).set("oklch.c", 0.1);
    const lightBorder = new Color(color).set("oklch.l", 0.7).set("oklch.c", 0.15);
    const lightFg = new Color(color).set("oklch.l", 0.2).set("oklch.c", 0.15);
    const darkBg = new Color(color).set("oklch.l", 0.05).set("oklch.c", 0.15);
    const darkElementBg = new Color(color).set("oklch.l", 0.2).set("oklch.c", 0.08);
    const darkPrimary = new Color(color).set("oklch.l", 0.6).set("oklch.c", 0.2);
    const darkAccent = new Color(color).set("oklch.l", 0.4).set("oklch.c", 0.15);
    const darkBorder = new Color(color).set("oklch.l", 0.4).set("oklch.c", 0.15);
    const darkFg = new Color(color).set("oklch.l", 0.95).set("oklch.c", 0.15);
    const lightVars = {
      "--background": toShadCn(lightBg),
      "--foreground": toShadCn(lightFg),
      "--muted": toShadCn(lightBorder),
      "--muted-foreground": toShadCn(lightFg),
      "--popover": toShadCn(lightElementBg),
      "--popover-foreground": toShadCn(lightFg),
      "--card": toShadCn(lightElementBg),
      "--card-foreground": toShadCn(lightFg),
      "--border": toShadCn(lightBorder),
      "--input": toShadCn(lightBorder),
      "--primary": toShadCn(lightPrimary),
      "--primary-foreground": toShadCn(getForegroundColor(lightPrimary)),
      "--secondary": toShadCn(lightAccent),
      "--secondary-foreground": toShadCn(lightFg),
      "--accent": toShadCn(lightAccent),
      "--accent-foreground": toShadCn(lightFg),
      "--destructive": "0 84.2% 60.2%",
      "--destructive-foreground": "60 9.1% 97.8%",
      "--ring": toShadCn(lightPrimary),
      "--radius": `${radiusRem}rem`
    };
    const darkVars = {
      "--background": toShadCn(darkBg),
      "--foreground": toShadCn(darkFg),
      "--muted": toShadCn(darkBorder),
      "--muted-foreground": toShadCn(darkFg),
      "--popover": toShadCn(darkElementBg),
      "--popover-foreground": toShadCn(darkFg),
      "--card": toShadCn(darkElementBg),
      "--card-foreground": toShadCn(darkFg),
      "--border": toShadCn(darkBorder),
      "--input": toShadCn(darkBorder),
      "--primary": toShadCn(darkPrimary),
      "--primary-foreground": toShadCn(getForegroundColor(darkPrimary)),
      "--secondary": toShadCn(darkAccent),
      "--secondary-foreground": toShadCn(darkFg),
      "--accent": toShadCn(darkAccent),
      "--accent-foreground": toShadCn(darkFg),
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "0 0% 98%",
      "--ring": toShadCn(darkPrimary),
      "--radius": `${radiusRem}rem`
    };
    return createCssString({ appearance, lightVars, darkVars });
  }
  return createCssString({
    appearance,
    darkVars: {
      "--background": "240 10% 3.9%",
      "--foreground": "0 0% 98%",
      "--muted": "240 3.7% 15.9%",
      "--muted-foreground": "240 5% 64.9%",
      "--popover": "240 10% 3.9%",
      "--popover-foreground": "0 0% 98%",
      "--card": "240 10% 3.9%",
      "--card-foreground": "0 0% 98%",
      "--border": "240 3.7% 15.9%",
      "--input": "240 3.7% 15.9%",
      "--primary": toShadCn(color),
      "--primary-foreground": toShadCn(getForegroundColor(color)),
      "--secondary": "240 3.7% 15.9%",
      "--secondary-foreground": "0 0% 98%",
      "--accent": "240 3.7% 15.9%",
      "--accent-foreground": "0 0% 98%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "0 0% 98%",
      "--ring": "240 4.9% 83.9%",
      "--radius": `${radiusRem}rem`
    },
    lightVars: {
      "--background": "0 0% 100%",
      "--foreground": "20 14.3% 4.1%",
      "--muted": "60 4.8% 95.9%",
      "--muted-foreground": "25 5.3% 44.7%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "20 14.3% 4.1%",
      "--card": "0 0% 100%",
      "--card-foreground": "20 14.3% 4.1%",
      "--border": "20 5.9% 90%",
      "--input": "20 5.9% 90%",
      "--primary": toShadCn(color),
      "--primary-foreground": toShadCn(getForegroundColor(color)),
      "--secondary": "60 4.8% 95.9%",
      "--secondary-foreground": "24 9.8% 10%",
      "--accent": "60 4.8% 95.9%",
      "--accent-foreground": "24 9.8% 10%",
      "--destructive": "0 84.2% 60.2%",
      "--destructive-foreground": "60 9.1% 97.8%",
      "--ring": "20 14.3% 4.1%",
      "--radius": `${radiusRem}rem`
    }
  });
};

// src/schemas.ts
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import Color2 from "colorjs.io";
var ThemeJsonSchema = Type.Object({
  primary: Type.String(),
  variant: Type.Union([
    Type.Literal("professional"),
    Type.Literal("tint"),
    Type.Literal("vibrant")
  ]),
  appearance: Type.Union([
    Type.Literal("light"),
    Type.Literal("dark"),
    Type.Literal("system")
  ]),
  radius: Type.Number()
});
var safeParseThemeJson = (content) => {
  try {
    const parsed = JSON.parse(content);
    const result = Value.Parse(ThemeJsonSchema, parsed);
    new Color2(result.primary);
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// src/index.ts
function themePlugin(_options) {
  const options = {
    themeJsonPath: "./theme.json",
    createThemeVars: (theme) => createTheme(theme),
    ..._options
  };
  let cachedCss = null;
  const virtualModuleId = "virtual:theme-vars";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  return {
    name: "vite-plugin-theme",
    async buildStart() {
      try {
        const themeContent = await fs.readFile(options.themeJsonPath, "utf-8");
        const themeConfig = safeParseThemeJson(themeContent);
        cachedCss = themeConfig ? options.createThemeVars(themeConfig) : null;
      } catch (e) {
        this.error(`Failed to read theme file: ${e.message}`);
      }
    },
    configureServer(server) {
      const resolvedPath = path.resolve(options.themeJsonPath);
      server.watcher.add(resolvedPath);
      server.watcher.on("change", async (changedPath) => {
        if (changedPath === resolvedPath) {
          try {
            const componentsJsonFile = await fs.readFile(resolvedPath, "utf-8");
            const themeConfig = safeParseThemeJson(componentsJsonFile);
            cachedCss = themeConfig ? options.createThemeVars(themeConfig) : null;
            server.ws.send({
              type: "full-reload",
              path: "*"
            });
            server.moduleGraph.invalidateAll();
          } catch (e) {
            server.config.logger.error(`Failed to update theme: ${e.message}`);
          }
        }
      });
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId && cachedCss) {
        return `
          // Remove any existing theme styles first
          document.querySelector('style[data-vite-theme]')?.remove()
          
          const style = document.createElement('style')
          style.setAttribute('data-vite-theme', '')
          style.textContent = ${JSON.stringify(cachedCss)}
          document.head.insertBefore(style, document.head.firstChild)
        `;
      }
    },
    transformIndexHtml(html) {
      if (!cachedCss) {
        return;
      }
      return {
        html,
        tags: [
          {
            tag: "style",
            attrs: {
              "data-vite-theme": "",
              // Add lower priority by inserting at start of head
              "data-inject-first": ""
            },
            children: cachedCss,
            injectTo: "head-prepend"
            // Change to prepend instead of default append
          }
        ]
      };
    }
  };
}
export {
  themePlugin as default
};
//# sourceMappingURL=index.mjs.map