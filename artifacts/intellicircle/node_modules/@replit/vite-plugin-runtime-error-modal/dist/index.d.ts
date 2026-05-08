import { Plugin } from 'vite';

declare function viteRuntimeErrorOverlayPlugin(options?: {
    filter?: (error: Error) => boolean;
}): Plugin;

export { viteRuntimeErrorOverlayPlugin as default };
