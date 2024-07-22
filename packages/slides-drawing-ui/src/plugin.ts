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

import { DependentOn, Inject, Injector, LocaleService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
// import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { UniverSlidesDrawingPlugin } from '@univerjs/slides-drawing';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DrawingPopupMenuController } from './controllers/drawing-popup-menu.controller';
import { SlideDrawingUpdateController } from './controllers/slide-drawing-update.controller';
import type { IUniverSheetsDrawingConfig } from './controllers/sheet-drawing.controller';
import { DefaultSheetsDrawingConfig, SlideDrawingUIController } from './controllers/sheet-drawing.controller';
import { SheetDrawingTransformAffectedController } from './controllers/sheet-drawing-transform-affected.controller';
import { SheetCanvasFloatDomManagerService } from './services/canvas-float-dom-manager.service';
import { SlideDrawingPrintingController } from './controllers/slide-drawing-printing.controller';
// import { SheetDrawingPermissionController } from './controllers/sheet-drawing-permission.controller';
import { SheetsDrawingCopyPasteController } from './controllers/sheet-drawing-copy-paste.controller';

const PLUGIN_NAME = 'SLIDE_IMAGE_UI_PLUGIN';

@DependentOn(UniverDrawingPlugin, UniverDrawingUIPlugin, UniverSlidesDrawingPlugin)
export class UniverSlidesDrawingUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SLIDE;
    static override pluginName = PLUGIN_NAME;

    private _pluginConfig: IUniverSheetsDrawingConfig;

    constructor(
        config: Partial<IUniverSheetsDrawingConfig> = {},
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._pluginConfig = Tools.deepMerge({}, DefaultSheetsDrawingConfig, config);
    }

    override onStarting(_injector: Injector): void {
        super.onStarting(_injector);
        this._initDependencies(_injector);
    }

    override onRendered(): void {
        this._registerRenderModules();
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [

            // services
            // [SheetCanvasFloatDomManagerService],
            // controllers
            [
                SlideDrawingUIController,
                {
                    useFactory: () => this._injector.createInstance(SlideDrawingUIController, this._pluginConfig),
                },
            ],
            // [DrawingPopupMenuController],
            // [SlideDrawingPrintingController],
            // [SheetDrawingPermissionController],
        ];

        const renderModules = [
            SlideDrawingUpdateController,
            // SheetDrawingTransformAffectedController,
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
        renderModules.forEach((controller) => this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SLIDE, controller as unknown as Dependency));
    }

    private _registerRenderModules(): void {
        ([
            // [SheetsDrawingCopyPasteController],

        ] as Dependency[]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SLIDE, m));
        });
    }
}
