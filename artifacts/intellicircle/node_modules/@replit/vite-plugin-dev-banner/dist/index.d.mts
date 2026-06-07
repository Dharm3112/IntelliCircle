import { Plugin } from 'vite';

declare function devBanner(): Plugin;

var version = "0.1.1";

export { devBanner, version };
