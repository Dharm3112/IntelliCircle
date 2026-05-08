import { Plugin } from 'vite';
import * as _sinclair_typebox from '@sinclair/typebox';
import { Static } from '@sinclair/typebox';

declare const ThemeJsonSchema: _sinclair_typebox.TObject<{
    primary: _sinclair_typebox.TString;
    variant: _sinclair_typebox.TUnion<[_sinclair_typebox.TLiteral<"professional">, _sinclair_typebox.TLiteral<"tint">, _sinclair_typebox.TLiteral<"vibrant">]>;
    appearance: _sinclair_typebox.TUnion<[_sinclair_typebox.TLiteral<"light">, _sinclair_typebox.TLiteral<"dark">, _sinclair_typebox.TLiteral<"system">]>;
    radius: _sinclair_typebox.TNumber;
}>;
type Theme = Static<typeof ThemeJsonSchema>;

interface ThemePluginOptions {
    themeJsonPath: string;
    createThemeVars: (theme: Theme) => string;
}
declare function themePlugin(_options?: Partial<ThemePluginOptions>): Plugin;

export { themePlugin as default };
