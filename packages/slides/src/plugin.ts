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

import { Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { CanvasViewService } from './services/canvas-view.service';
import { ObjectProviderService } from './services/object-provider.service';
import { RichTextAdaptor } from './services/rich-text-adaptor.service';
import { SlideAdaptor } from './services/slide-adaptor.service';
import { AdaptorController } from './controllers/adaptor.controller';
import { ShapeAdaptor } from './services/shape-adaptor.service';
import { ImageAdaptor } from './services/image-adaptor.service';
import { DocumentAdaptor } from './services/document-adaptor.service';
import { SpreadsheetAdaptor } from './services/spreadsheet-adaptor.service';

export interface IUniverSlidesConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

const PLUGIN_NAME = 'slides';

export class UniverSlidesPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SLIDE;

    private _config: IUniverSlidesConfig;

    constructor(
        config: Partial<IUniverSlidesConfig> = {},
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
        this._initializeDependencies(this._injector);
    }

    initialize(): void {
    }

    getConfig() {
        return this._config;
    }

    override onRendered(): void {
        this.initialize();
    }

    private _initializeDependencies(slideInjector: Injector) {
        const dependencies: Dependency[] = [
            [CanvasViewService],
            [ObjectProviderService],

            [AdaptorController],

            [RichTextAdaptor],
            [ShapeAdaptor],
            [ImageAdaptor],
            [DocumentAdaptor],
            [SpreadsheetAdaptor],
            [SlideAdaptor],
        ];

        dependencies.forEach((d) => {
            slideInjector.add(d);
        });
    }
}
