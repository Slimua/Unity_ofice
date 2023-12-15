/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LocaleType, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverUIPlugin } from '@univerjs/ui';

import { DEFAULT_DOCUMENT_DATA_CN } from '../data';
import { DebuggerPlugin } from '../plugins/debugger';
import { locales } from './locales';

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales,
});

// core plugins
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(DebuggerPlugin);
univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
    header: true,
    toolbar: true,
});
univer.registerPlugin(UniverDocsPlugin, {
    standalone: true,
});
univer.registerPlugin(UniverDocsUIPlugin, {
    container: 'univerdoc',
    layout: {
        docContainerConfig: {
            innerLeft: false,
        },
    },
});

univer.createUniverDoc(DEFAULT_DOCUMENT_DATA_CN);

// use for console test
declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
