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

import { ICommandService, LocaleService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import { type Dependency, Inject, Injector } from '@wendellhu/redi';
import { WorksheetProtectionRenderService } from '@univerjs/sheets';
import { IRenderManagerService } from '@univerjs/engine-render';
import { PermissionRenderService } from './service/permission-render.service';
import { UNIVER_SHEET_PERMISSION_PLUGIN_NAME } from './const';
import type { IUniverSheetsPermissionMenuConfig } from './controller/sheet-permission-render.controller';
import { DefaultSheetPermissionMenuConfig, SheetPermissionRenderController } from './controller/sheet-permission-render.controller';
import { enUS, ruRU, zhCN } from './locale';
import { SheetPermissionOpenPanelOperation } from './operation/sheet-permission-open-panel.operation';
import { SheetPermissionUserManagerService } from './service';
import { AddRangeProtectionFromContextMenuCommand, AddRangeProtectionFromSheetBarCommand, AddRangeProtectionFromToolbarCommand, DeleteRangeProtectionFromContextMenuCommand, SetProtectionCommand, SetRangeProtectionFromContextMenuCommand, ViewSheetPermissionFromContextMenuCommand, ViewSheetPermissionFromSheetBarCommand } from './command/range-protection.command';
import { SheetPermissionOpenDialogOperation } from './operation/sheet-permission-open-dialog.operation';
import { AddWorksheetProtectionCommand, ChangeSheetProtectionFromSheetBarCommand, DeleteWorksheetProtectionCommand, DeleteWorksheetProtectionFormSheetBarCommand, SetWorksheetProtectionCommand } from './command/worksheet-protection.command';
import { SheetPermissionPanelModel } from './service/sheet-permission-panel.model';
import { SheetPermissionInterceptorBaseController } from './controller/sheet-permission-interceptor-base.controller';
import { SheetPermissionInitController } from './controller/sheet-permission-init.controller';
import { SheetPermissionInterceptorCanvasRenderController } from './controller/sheet-permission-interceptor-canvas-render.controller';
import { SheetPermissionInterceptorFindReplaceController } from './controller/sheet-permission-interceptor-find-replace.controller';
import { SheetPermissionInterceptorFormulaRenderController } from './controller/sheet-permission-interceptor-formula-render.controller';
import { SheetPermissionInterceptorDvController } from './controller/sheet-permission-interceptor-dv.controller';
import { SheetPermissionInterceptorCfController } from './controller/sheet-permission-interceptor-cf.controller';
import { SheetPermissionInterceptorClipboardController } from './controller/sheet-permission-interceptor-clipboard.controller';

export class UniverSheetsPermissionUIPlugin extends Plugin {
    static override pluginName = UNIVER_SHEET_PERMISSION_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private _config: Partial<IUniverSheetsPermissionMenuConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._config = Tools.deepMerge({}, DefaultSheetPermissionMenuConfig, this._config);
    }

    override onReady(): void {
        this._registerRenderControllers();
    }

    override onStarting() {
        ([
            [SheetPermissionPanelModel],

            [SheetPermissionUserManagerService],
            [PermissionRenderService],
            [WorksheetProtectionRenderService],

            [SheetPermissionInterceptorFindReplaceController],
            [SheetPermissionInterceptorDvController],
            [SheetPermissionInterceptorCfController],
            [SheetPermissionInterceptorClipboardController],
            [SheetPermissionInterceptorBaseController],
            [SheetPermissionInitController],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        this._injector.add(
            [
                SheetPermissionRenderController,
                {
                    useFactory: () => this._injector.createInstance(SheetPermissionRenderController, this._config),
                },
            ]

        );

        [
            SheetPermissionOpenPanelOperation,
            SheetPermissionOpenDialogOperation,
            AddRangeProtectionFromToolbarCommand,
            AddRangeProtectionFromContextMenuCommand,
            ViewSheetPermissionFromContextMenuCommand,
            AddRangeProtectionFromSheetBarCommand,
            ViewSheetPermissionFromSheetBarCommand,
            ChangeSheetProtectionFromSheetBarCommand,
            DeleteRangeProtectionFromContextMenuCommand,
            SetRangeProtectionFromContextMenuCommand,
            AddWorksheetProtectionCommand,
            DeleteWorksheetProtectionCommand,
            SetWorksheetProtectionCommand,
            DeleteWorksheetProtectionFormSheetBarCommand,
            SetProtectionCommand,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });

        this._localeService.load({
            zhCN,
            enUS,
            ruRU,
        });
    }

    private _registerRenderControllers(): void {
        ([
            SheetPermissionInterceptorCanvasRenderController,
            SheetPermissionInterceptorFormulaRenderController,
        ]).forEach((controller) => {
            this.disposeWithMe(this._renderManagerService.registerRenderController(UniverInstanceType.UNIVER_SHEET, controller));
        });
    }
}
