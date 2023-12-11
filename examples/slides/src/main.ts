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
import { greenTheme } from '@univerjs/design';
import { UniverRenderEngine } from '@univerjs/engine-render';
import { UniverSlides } from '@univerjs/slides';
import { UniverSlidesUI } from '@univerjs/slides-ui';
import { UniverUI } from '@univerjs/ui';
import { DEFAULT_SLIDE_DATA } from 'data';

// package info
console.table({
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    BUILD_TIME: process.env.BUILD_TIME,
});

// univer
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    theme: greenTheme,
});

// base-render
univer.registerPlugin(UniverRenderEngine);
univer.registerPlugin(UniverUI, {
    container: 'univer-container',
    header: true,
    toolbar: true,
    footer: true,
    innerLeft: true,
});
univer.registerPlugin(UniverSlides);
univer.registerPlugin(UniverSlidesUI);

univer.createUniverSlide(DEFAULT_SLIDE_DATA);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
