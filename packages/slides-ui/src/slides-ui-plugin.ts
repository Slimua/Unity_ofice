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

import type { SlideDataModel } from '@univerjs/core';
import { IUniverInstanceService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import type { IUniverSlidesUIConfig } from './controllers/slide-ui.controller';
import { SlideUIController } from './controllers/slide-ui.controller';

export const SLIDE_UI_PLUGIN_NAME = 'SLIDE_UI';

const DefaultSlideUiConfig = {};

export class UniverSlidesUIPlugin extends Plugin {
    static override pluginName = SLIDE_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SLIDE;

    constructor(
        private readonly _config: Partial<IUniverSlidesUIConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSlideUiConfig, this._config);
    }

    override onStarting(injector: Injector): void {
        ([
            [
                SlideUIController, {
                    useFactory: () => this._injector.createInstance(SlideUIController, this._config),
                },
            ],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }

    override onRendered(): void {
        this._markSlideAsFocused();
    }

    private _markSlideAsFocused() {
        const currentService = this._univerInstanceService;
        try {
            const slide = currentService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
            currentService.focusUnit(slide.getUnitId());
        } catch (e) {
        }
    }
}
