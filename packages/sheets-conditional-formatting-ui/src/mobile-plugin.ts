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

import { DependentOn, ICommandService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN, UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { AddAverageCfCommand } from './commands/commands/add-average-cf.command';
import { AddColorScaleConditionalRuleCommand } from './commands/commands/add-color-scale-cf.command';
import { AddDataBarConditionalRuleCommand } from './commands/commands/add-data-bar-cf.command';
import { AddDuplicateValuesCfCommand } from './commands/commands/add-duplicate-values-cf.command';
import { AddNumberCfCommand } from './commands/commands/add-number-cf.command';
import { AddRankCfCommand } from './commands/commands/add-rank-cf.command';
import { AddTextCfCommand } from './commands/commands/add-text-cf.command';
import { AddTimePeriodCfCommand } from './commands/commands/add-time-period-cf.command';
import { AddUniqueValuesCfCommand } from './commands/commands/add-unique-values-cf.command';
import { ClearRangeCfCommand } from './commands/commands/clear-range-cf.command';
import { ClearWorksheetCfCommand } from './commands/commands/clear-worksheet-cf.command';
import { OpenConditionalFormattingOperator } from './commands/operations/open-conditional-formatting-panel';
import { DeleteCfCommand } from './commands/commands/delete-cf.command';
import { SetCfCommand } from './commands/commands/set-cf.command';
import { MoveCfCommand } from './commands/commands/move-cf.command';
import { AddCfCommand } from './commands/commands/add-cf.command';

import { SheetsCfRenderController } from './controllers/cf.render.controller';
import { ConditionalFormattingCopyPasteController } from './controllers/cf.copy-paste.controller';
import type { IUniverSheetsConditionalFormattingUIConfig } from './controllers/cf.menu.controller';
import { DefaultSheetConditionalFormattingUiConfig } from './controllers/cf.menu.controller';
import { ConditionalFormattingI18nController } from './controllers/cf.i18n.controller';
import { SheetsCfRefRangeController } from './controllers/cf.ref-range.controller';
import { ConditionalFormattingPermissionController } from './controllers/cf.permission.controller';

@DependentOn(UniverSheetsConditionalFormattingPlugin)
export class UniverSheetsConditionalFormattingMobileUIPlugin extends Plugin {
    static override pluginName = `${SHEET_CONDITIONAL_FORMATTING_PLUGIN}_MOBILE_UI_PLUGIN`;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsConditionalFormattingUIConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._config = Tools.deepMerge({}, DefaultSheetConditionalFormattingUiConfig, this._config);

        this._initCommand();

        this._injector.add([SheetsCfRenderController]);
        this._injector.add([SheetsCfRefRangeController]);
        this._injector.add([ConditionalFormattingCopyPasteController]);
        this._injector.add([ConditionalFormattingPermissionController]);
        this._injector.add([ConditionalFormattingI18nController]);
    }

    private _initCommand() {
        [
            AddAverageCfCommand,
            AddColorScaleConditionalRuleCommand,
            AddDataBarConditionalRuleCommand,
            AddDuplicateValuesCfCommand,
            AddNumberCfCommand,
            AddRankCfCommand,
            AddTextCfCommand,
            AddTimePeriodCfCommand,
            AddUniqueValuesCfCommand,
            OpenConditionalFormattingOperator,
            DeleteCfCommand,
            SetCfCommand,
            MoveCfCommand,
            AddCfCommand,
            ClearRangeCfCommand,
            ClearWorksheetCfCommand,
        ].forEach((m) => {
            this._commandService.registerCommand(m);
        });
    }
}
