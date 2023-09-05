import { defineConfig } from 'vite';
import { name, version } from './package.json';
import path from 'path';
import createExternal from 'vite-plugin-external';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'UniverCommonPluginData',
            formats: ['es', 'umd', 'cjs'],
            fileName: 'univer-common-plugin-data',
        },
        outDir: './lib',
        //sourcemap: true
    },
    define: {
        pkgJson: { name, version },
    },
    esbuild: {
        jsxFactory: 'DOMcreateElement',
        jsxFragment: 'DOMcreateFragment',
        jsxInject: "import { DOMcreateElement, DOMcreateFragment } from '@/Common/jsxFactory'",
    },
    server: {
        port: 3102,
        open: true, // // Automatically open the app in the browser on server start.
    },
    plugins: [
        createExternal({
            externals: {
                '@univerjs/core': '@univerjs/core'
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
});
