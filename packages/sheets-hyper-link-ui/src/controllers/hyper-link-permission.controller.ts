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

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { SheetPermissionInterceptorBaseController } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetInsertHyperlinkPermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { InsertLinkShortcut } from './menu';

@OnLifecycle(LifecycleStages.Rendered, SheetsHyperLinkPermissionController)
export class SheetsHyperLinkPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionInterceptorBaseController) private readonly _sheetPermissionInterceptorBaseController: SheetPermissionInterceptorBaseController
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === InsertLinkShortcut.id) {
                    const permission = this._sheetPermissionInterceptorBaseController.permissionCheckWithRanges({
                        workbookTypes: [WorkbookEditablePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission],
                    });
                    if (!permission) {
                        this._sheetPermissionInterceptorBaseController.haveNotPermissionHandle(this._localeService.t('permission.dialog.hyperLinkErr'));
                    }
                }
            })
        );
    }
}
