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

import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';

import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';

import { UniverUIPlugin } from '@univerjs/ui';
import { greenTheme } from '@univerjs/design';

import { UniverSlidesPlugin } from '@univerjs/slides';
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui';

import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverSlidesDrawingPlugin } from '@univerjs/slides-drawing';
// import { UniverSlidesDrawingUIPlugin } from '@univerjs/slides-drawing-ui';

import { DEFAULT_SLIDE_DATA } from '../data';
import { enUS, ruRU, viVN, zhCN, zhTW } from '../locales';

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.EN_US]: enUS,
        [LocaleType.RU_RU]: ruRU,
        [LocaleType.VI_VN]: viVN,
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.ZH_TW]: zhTW,
    },
});

// base-render
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);

univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
});

univer.registerPlugin(UniverSlidesPlugin);
univer.registerPlugin(UniverSlidesUIPlugin);

univer.registerPlugin(UniverDrawingPlugin);
univer.registerPlugin(UniverDrawingUIPlugin);
univer.registerPlugin(UniverSlidesDrawingPlugin);
// univer.registerPlugin(UniverSlidesDrawingUIPlugin);

univer.createUnit(UniverInstanceType.UNIVER_SLIDE, DEFAULT_SLIDE_DATA);

window.univer = univer;
