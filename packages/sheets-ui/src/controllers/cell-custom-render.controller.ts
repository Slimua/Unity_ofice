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

import type { ICellCustomRender, ICellRenderContext, Nullable } from '@univerjs/core';
import { Disposable, DisposableCollection, IUniverInstanceService, LifecycleStages, OnLifecycle, sortRules } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

/**
 * @todo RenderUnit
 */
@OnLifecycle(LifecycleStages.Rendered, CellCustomRenderController)
export class CellCustomRenderController extends Disposable {
    private _enterActiveRender: Nullable<{
        render: ICellCustomRender;
        cellContext: ICellRenderContext;
    }>;

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initEventBinding();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initEventBinding() {
        const disposableCollection = new DisposableCollection();
        // eslint-disable-next-line max-lines-per-function
        this._univerInstanceService.currentSheet$.subscribe((workbook) => {
            disposableCollection.dispose();
            if (workbook) {
                const unitId = workbook.getUnitId();

                const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());
                if (currentRender && currentRender.mainComponent) {
                    const spreadsheet = currentRender.mainComponent as Spreadsheet;
                    const getActiveRender = (evt: IPointerEvent | IMouseEvent) => {
                        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton!;
                        const { offsetX, offsetY } = evt;
                        const scene = currentRender.scene;
                        const worksheet = workbook.getActiveSheet();
                        const activeViewport = scene.getActiveViewportByCoord(
                            Vector2.FromArray([offsetX, offsetY])
                        );

                        if (!activeViewport) {
                            return;
                        }

                        const { scaleX, scaleY } = scene.getAncestorScale();

                        const scrollXY = {
                            x: activeViewport.actualScrollX,
                            y: activeViewport.actualScrollY,
                        };

                        const cellPos = skeleton.getCellPositionByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

                        const mergeCell = skeleton.mergeData.find((range) => {
                            const { startColumn, startRow, endColumn, endRow } = range;
                            return cellPos.row >= startRow && cellPos.column >= startColumn && cellPos.row <= endRow && cellPos.column <= endColumn;
                        });

                        const cellIndex = {
                            actualRow: mergeCell ? mergeCell.startRow : cellPos.row,
                            actualCol: mergeCell ? mergeCell.startColumn : cellPos.column,
                            mergeCell,
                            row: cellPos.row,
                            col: cellPos.column,
                        };

                        if (!cellIndex || !skeleton) {
                            return;
                        }

                        const cellData = worksheet.getCell(cellIndex.actualRow, cellIndex.actualCol);
                        if (!cellData) {
                            return;
                        }

                        const renders = cellData.customRender;

                        if (!renders?.length) {
                            return;
                        }
                        const row = cellIndex.actualRow;
                        const col = cellIndex.actualCol;
                        const sortedRenders = renders.sort(sortRules);
                        const subUnitId = workbook.getActiveSheet().getSheetId();
                        const info: ICellRenderContext = {
                            data: cellData,
                            style: skeleton.getsStyles().getStyleByCell(cellData),
                            primaryWithCoord: skeleton.getCellByIndex(cellIndex.actualRow, cellIndex.actualCol),
                            unitId,
                            subUnitId,
                            row,
                            col,
                        };

                        const position = {
                            x: scrollXY.x + (offsetX / scaleX),
                            y: scrollXY.y + (offsetY / scaleY),
                        };

                        const activeRender = sortedRenders.find((render) => render.isHit?.(position, info));
                        if (!activeRender) {
                            return;
                        }
                        return [activeRender, info] as const;
                    };

                    const disposable = spreadsheet.onPointerDownObserver.add((evt) => {
                        const activeRenderInfo = getActiveRender(evt);
                        if (activeRenderInfo) {
                            const [activeRender, cellContext] = activeRenderInfo;
                            activeRender.onPointerDown?.(cellContext, evt);
                        }
                    });

                    const moveDisposable = spreadsheet.onPointerMoveObserver.add((evt) => {
                        const activeRenderInfo = getActiveRender(evt);
                        if (activeRenderInfo) {
                            const [activeRender, cellContext] = activeRenderInfo;
                            if (this._enterActiveRender) {
                                if (this._enterActiveRender.render !== activeRender) {
                                    this._enterActiveRender.render.onPointerLeave?.(this._enterActiveRender.cellContext, evt);
                                    this._enterActiveRender = {
                                        render: activeRender,
                                        cellContext,
                                    };
                                    activeRender.onPointerEnter?.(cellContext, evt);
                                }
                            } else {
                                this._enterActiveRender = {
                                    render: activeRender,
                                    cellContext,
                                };
                                activeRender.onPointerEnter?.(cellContext, evt);
                            }
                        }
                    });

                    disposable && disposableCollection.add(disposable);
                    moveDisposable && disposableCollection.add(moveDisposable);
                }
            }
        });

        this.disposeWithMe(disposableCollection);
    }
}
