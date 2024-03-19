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

import { Subject } from 'rxjs';
import { Inject } from '@wendellhu/redi';
import { type IPosition, IUniverInstanceService, type Nullable } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IPopupService } from '@univerjs/ui/services/popup/popup.service.js';
import { CELL_ALERT_KEY } from '../views/cell-alert';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export enum CellAlertType {
    INFO,
    WARNING,
    ERROR,
}

export interface ICellAlert {
    type: CellAlertType;
    title: React.ReactNode;
    message: React.ReactNode;
    position: IPosition;
    location: ISheetLocation;
    width: number;
    height: number;
}

export class CellAlertManagerService {
    private _currentAlert$ = new Subject<Nullable<ICellAlert>>();
    private _currentPopupId: Nullable<string> = undefined;

    currentAlert$ = this._currentAlert$.asObservable();

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IPopupService private readonly _popupService: IPopupService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {}

    showAlert(alert: ICellAlert) {
        const currentRender = this._renderManagerService.getCurrent();
        if (!currentRender) {
            return;
        }
        const { position } = alert;
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const subUnitId = workbook.getActiveSheet().getSheetId();
        const bounding = currentRender.engine.getCanvasElement().getBoundingClientRect();
        this._currentPopupId = this._popupService.addPopup({
            anchorRect: {
                top: position.startY + bounding.top,
                bottom: position.endY + bounding.top,
                left: position.startX,
                right: position.endX,
            },
            unitId,
            subUnitId,
            componentKey: CELL_ALERT_KEY,
        });
        this._currentAlert$.next(alert);
    }

    clearAlert() {
        // this._currentPopupId && this._popupService.removePopup(this._currentPopupId);
        // this._currentAlert$.next(null);
    }
}
