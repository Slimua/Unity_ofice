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

import { DataValidationStatus, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import type { Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { SheetDataValidationService } from '../services/dv.service';

const INVALID_MARK = {
    tr: {
        size: 8,
        color: 'red',
    },
};

@OnLifecycle(LifecycleStages.Rendered, DataValidationController)
export class DataValidationController extends RxDisposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(SheetDataValidationService) private readonly _sheetDataValidationService: SheetDataValidationService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initDataValidationDataSource();
        this._initInstanceChange();
        this._initViewModelIntercept();
    }

    private _initInstanceChange() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        this._sheetDataValidationService.switchCurrent(workbook.getUnitId(), workbook.getActiveSheet().getSheetId());
        this.disposeWithMe(
            workbook.activeSheet$.subscribe((worksheet) => {
                if (worksheet) {
                    const unitId = workbook.getUnitId();
                    const subUnitId = worksheet.getSheetId();
                    this._sheetDataValidationService.switchCurrent(unitId, subUnitId);
                }
            })
        );
    }

    private _createSheetDataValidationManager(unitId: string, subUnitId: string) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            throw new Error(`Workbook was not found, id: ${unitId}.`);
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`Worksheet was not found, id: ${subUnitId}.`);
        }

        const rules = worksheet.getSnapshot().dataValidation;
        return new SheetDataValidationManager(
            unitId,
            subUnitId,
            rules,
            this._dataValidatorRegistryService
        );
    }

    private _initDataValidationDataSource() {
        this._dataValidationModel.setManagerCreator(this._createSheetDataValidationManager.bind(this));
    }

    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    handler: (cell, pos, next) => {
                        const validationManager = this._sheetDataValidationService.currentManager;
                        const { unitId, subUnitId } = validationManager || {};
                        if (unitId !== pos.unitId || subUnitId !== pos.subUnitId) {
                            this._sheetDataValidationService.switchCurrent(pos.unitId, pos.subUnitId);
                        }

                        const manager = this._sheetDataValidationService.currentManager?.manager;
                        if (!manager) {
                            return next(cell);
                        }
                        const { row, col } = pos;
                        const ruleId = manager.getRuleIdByLocation(row, col);
                        const rule = manager.getRuleById(ruleId);

                        if (!rule) {
                            return next(cell);
                        }
                        const validStatus = this._dataValidationModel.validator(cell?.v, rule, pos);
                        return next({
                            ...cell,
                            dataValidation: {
                                ruleId,
                                validStatus,
                            },
                            markers: {
                                ...cell?.markers,
                                ...validStatus === DataValidationStatus.INVALID ? INVALID_MARK : null,
                            },
                        });
                    },
                }
            )
        );
    }
}
