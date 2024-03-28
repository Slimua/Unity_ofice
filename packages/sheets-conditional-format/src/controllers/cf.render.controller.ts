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

import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { bufferTime, filter } from 'rxjs/operators';
import type { ISheetFontRenderExtension, Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';

import { ConditionalFormatService } from '../services/conditional-format.service';
import { ConditionalFormatViewModel } from '../models/conditional-format-view-model';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import { DataBar, dataBarUKey } from '../render/data-bar.render';

import { ConditionalFormatIcon, DEFAULT_PADDING, DEFAULT_WIDTH, IconUKey } from '../render/icon.render';
import type { IConditionalFormatCellData } from '../render/type';

@OnLifecycle(LifecycleStages.Rendered, RenderController)
export class RenderController extends Disposable {
    constructor(@Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ConditionalFormatService) private _conditionalFormatService: ConditionalFormatService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel,
        @Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService) {
        super();
        this._initViewModelInterceptor();
        this._initSkeleton();
        this._initRender();
    }

    _initRender() {
        const list: [string, new () => any][] = [[dataBarUKey, DataBar], [IconUKey, ConditionalFormatIcon]];
        const register = (renderId: string) => {
            const render = renderId && this._renderManagerService.getRenderById(renderId);
            const spreadsheetRender = render && render.mainComponent as Spreadsheet;
            if (spreadsheetRender) {
                list.forEach(([key, Instance]) => {
                    if (!spreadsheetRender.getExtensionByKey(key)) {
                        spreadsheetRender.register(new Instance());
                    }
                });
            }
        };
        this.disposeWithMe(this._renderManagerService.currentRender$.subscribe((renderId) => {
            renderId && register(renderId);
        }));
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        if (workbook) {
            register(workbook.getUnitId());
        }
    }

    _initSkeleton() {
        const markDirtySkeleton = () => {
            this._sheetSkeletonManagerService.reCalculate();
            const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
        };

        // After the conditional format is marked dirty to drive a rendering, to trigger the window within the conditional format recalculation
        this.disposeWithMe(this._conditionalFormatViewModel.markDirty$.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(markDirtySkeleton));

        // Sort and delete does not mark dirty.
        this.disposeWithMe(this._conditionalFormatRuleModel.$ruleChange.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            return v.filter((item) => ['sort', 'delete'].includes(item.type) && item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(markDirtySkeleton));

        // Once the calculation is complete, a view update is triggered
        // This rendering does not trigger conditional format recalculation,because the rule is not mark dirty
        this.disposeWithMe(this._conditionalFormatService.ruleComputeStatus$.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(markDirtySkeleton));
    }

    _initViewModelInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, { handler: (cell, context, next) => {
            const result = this._conditionalFormatService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
            if (!result) {
                return next(cell);
            }
            const styleMap = context.workbook.getStyles();
            const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
            const s = { ...defaultStyle };
            const cloneCell = { ...cell, s } as IConditionalFormatCellData & ISheetFontRenderExtension;
            if (result.style) {
                Object.assign(s, result.style);
            }
            if (result.dataBar) {
                cloneCell.dataBar = result.dataBar;
            }
            if (result.iconSet) {
                cloneCell.iconSet = result.iconSet;
                if (!cloneCell.fontRenderExtension) {
                    cloneCell.fontRenderExtension = {};
                }

                cloneCell.fontRenderExtension.leftOffset = DEFAULT_PADDING + DEFAULT_WIDTH;

                if (!result.iconSet.isShowValue) {
                    cloneCell.fontRenderExtension.isSkip = true;
                }
            }

            return next(cloneCell);
        },
        }));
    }
}
