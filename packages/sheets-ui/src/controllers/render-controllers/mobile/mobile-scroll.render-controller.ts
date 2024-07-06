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

import type { IFreeze, IRange, IWorksheetData, Nullable, Workbook } from '@univerjs/core';
import {
    Direction,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import type { IMouseEvent, IPoint, IPointerEvent, IRenderContext, IRenderModule, IScrollObserverParam } from '@univerjs/engine-render';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { ScrollToCellOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { ScrollCommand, SetScrollRelativeCommand } from '../../../commands/commands/set-scroll.command';
import type { IExpandSelectionCommandParams } from '../../../commands/commands/set-selection.command';
import { ExpandSelectionCommand, MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../../commands/commands/set-selection.command';
import type { IScrollManagerParam, IScrollManagerSearchParam } from '../../../services/scroll-manager.service';
import { ScrollManagerService } from '../../../services/scroll-manager.service';
import type { ISheetSkeletonManagerParam } from '../../../services/sheet-skeleton-manager.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { getSheetObject } from '../../utils/component-tools';

const SHEET_NAVIGATION_COMMANDS = [MoveSelectionCommand.id, MoveSelectionEnterAndTabCommand.id];

/**
 * This controller handles scroll logic in sheet interaction.
 */
export class MobileSheetsScrollRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(ScrollManagerService) private readonly _scrollManagerService: ScrollManagerService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    scrollToRange(range: IRange): boolean {
        let { endRow, endColumn, startColumn, startRow } = range;
        const bounding = this._getViewportBounding();
        if (range.rangeType === RANGE_TYPE.ROW) {
            startColumn = 0;
            endColumn = 0;
        } else if (range.rangeType === RANGE_TYPE.COLUMN) {
            startRow = 0;
            endRow = 0;
        }

        if (bounding) {
            const row = bounding.startRow > endRow ? startRow : endRow;
            const col = bounding.startColumn > endColumn ? startColumn : endColumn;
            return this._scrollToCell(row, col);
        } else {
            return this._scrollToCell(startRow, startColumn);
        }
    }

    private _init() {
        this._initCommandListener();
        this._initScrollEventListener();
        this._initPointerScrollEvent();
        this._scrollInfo$Handler();
        this._initSkeletonListener();
    }

    private _initCommandListener(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (SHEET_NAVIGATION_COMMANDS.includes(command.id)) {
                    this._scrollToSelection();
                } else if (command.id === ScrollToCellOperation.id) {
                    const param = command.params as IRange;
                    this.scrollToRange(param);
                } else if (command.id === ExpandSelectionCommand.id) {
                    const param = command.params as IExpandSelectionCommandParams;
                    this._scrollToSelectionForExpand(param);
                }
            })
        );
    }

    private _scrollToSelectionForExpand(param: IExpandSelectionCommandParams) {
        setTimeout(() => {
            const selection = this._selectionManagerService.getCurrentLastSelection();
            if (selection == null) {
                return;
            }

            const { startRow, startColumn, endRow, endColumn } = selection.range;

            const bounds = this._getViewportBounding();
            if (bounds == null) {
                return;
            }

            const { startRow: viewportStartRow, startColumn: viewportStartColumn, endRow: viewportEndRow, endColumn: viewportEndColumn } = bounds;

            let row = 0;
            let column = 0;

            if (startRow > viewportStartRow) {
                row = endRow;
            } else if (endRow < viewportEndRow) {
                row = startRow;
            } else {
                row = viewportStartRow;
            }

            if (startColumn > viewportStartColumn) {
                column = endColumn;
            } else if (endColumn < viewportEndColumn) {
                column = startColumn;
            } else {
                column = viewportStartColumn;
            }

            if (param.direction === Direction.DOWN) {
                row = endRow;
            } else if (param.direction === Direction.UP) {
                row = startRow;
            } else if (param.direction === Direction.RIGHT) {
                column = endColumn;
            } else if (param.direction === Direction.LEFT) {
                column = startColumn;
            }

            this._scrollToCell(row, column);
        }, 0);
    }

    private _getFreeze(): Nullable<IFreeze> {
        const snapshot: IWorksheetData | undefined = this._sheetSkeletonManagerService.getCurrent()?.skeleton.getWorksheetConfig();
        if (snapshot == null) {
            return;
        }

        return snapshot.freeze;
    }

    private _initScrollEventListener() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) return;

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;

        this.disposeWithMe(
            // set scrollInfo, the event is triggered in viewport@_scrollTo
            viewportMain.onScrollAfter$.subscribeEvent((scrollAfterParam: IScrollObserverParam) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const sheetObject = this._getSheetObject();
                if (skeleton == null || sheetObject == null) {
                    return;
                }

                const { viewportScrollX = 0, viewportScrollY = 0 } = scrollAfterParam;
                // console.log('onScrollAfter$', viewportScrollY);
                // according to the actual scroll position, the most suitable row, column and offset combination is recalculated.
                const { row, column, rowOffset, columnOffset } = skeleton.getDecomposedOffset(
                    viewportScrollX,
                    viewportScrollY
                );

                // lastestScrollInfo derived from viewportScrollX, viewportScrollY from onScrollAfter$
                const lastestScrollInfo: IScrollManagerParam = {
                    sheetViewStartRow: row,
                    sheetViewStartColumn: column,
                    offsetX: columnOffset,
                    offsetY: rowOffset,
                };
                // console.log('lastestScrollInfo', viewportScrollY, lastestScrollInfo);
                this._scrollManagerService.justSetScrollInfoToCurrSheet(lastestScrollInfo);
                this._scrollManagerService.validViewportScrollInfo$.next({
                    scrollX: scrollAfterParam.scrollX || 0,
                    scrollY: scrollAfterParam.scrollY || 0,
                    viewportScrollX: scrollAfterParam.viewportScrollX || 0,
                    viewportScrollY: scrollAfterParam.viewportScrollY || 0,
                });
                // snapshot is diff by diff people!
                // this._scrollManagerService.setScrollInfoToSnapshot({ ...lastestScrollInfo, viewportScrollX, viewportScrollY });
            })
        );

        this.disposeWithMe(
            viewportMain.onScrollByBar$.subscribeEvent((param) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null || param.isTrigger === false) {
                    return;
                }

                const sheetObject = this._getSheetObject();
                if (skeleton == null || sheetObject == null) {
                    return;
                }
                const { viewportScrollX = 0, viewportScrollY = 0 } = param;

                const freeze = this._getFreeze();

                const { row, column, rowOffset, columnOffset } = skeleton.getDecomposedOffset(
                    viewportScrollX,
                    viewportScrollY
                );

                this._commandService.executeCommand(ScrollCommand.id, {
                    sheetViewStartRow: row + (freeze?.ySplit || 0),
                    sheetViewStartColumn: column + (freeze?.xSplit || 0),
                    offsetX: columnOffset,
                    offsetY: rowOffset,
                });
            })
        );
    }

    /**
     * for row & col selection.
     * x value of row seleciton controlPoints is always half of viewport wide.
     * y value of col selection controlPoints is always half of viewport height.
     *
     */
    private _scrollInfo$Handler() {
        const { unitId } = this._context;
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;
        if (!scene) return;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;

        this.disposeWithMe(
            toDisposable(
                // wheel event --> set-scroll.command('sheet.operation.set-scroll') --> scroll.operation.ts --> scrollManagerService.setScrollInfo(raw value, may be negative)  --> scrollInfo$.next --> current fn() --> viewport.scrollTo
                // --> onScrollAfterObserver.notify ---> scrollManagerService.setScrollInfo again!(valid scroll value)
                this._scrollManagerService.rawScrollInfo$.subscribe((param) => {
                    if (param == null) {
                        viewportMain.scrollTo({
                            x: 0,
                            y: 0,
                        });
                        return;
                    }

                    const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                    if (!skeleton) return;

                    // data source: scroll-manager.service.ts@_scrollInfo
                    const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = param;

                    const { startX, startY } = skeleton.getCellByIndexWithNoHeader(
                        sheetViewStartRow,
                        sheetViewStartColumn
                    );

                    // viewportScrollXByEvent is not same as viewportScrollX, by event, the value may be negative, or over max
                    const viewportScrollXByEvent = startX + offsetX;
                    const viewportScrollYByEvent = startY + offsetY;

                    const config = viewportMain.transViewportScroll2ScrollValue(viewportScrollXByEvent, viewportScrollYByEvent);
                    viewportMain.scrollTo(config);
                })
            )
        );
    }

    private _initSkeletonListener() {
        this.disposeWithMe(toDisposable(
            this._sheetSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
                if (param == null) {
                    return;
                }
                this._scrollManagerService.setSearchParam(param as unknown as IScrollManagerSearchParam);
                const sheetObject = this._getSheetObject();
                if (!sheetObject) return;
                const scene = sheetObject.scene;
                const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
                const currScrollInfo = this._scrollManagerService.getScrollInfoByParam(param as unknown as IScrollManagerSearchParam);
                if (viewportMain) {
                    // if (currScrollInfo) {
                    viewportMain.viewportScrollX = currScrollInfo?.viewportScrollX || 0;
                    viewportMain.viewportScrollY = currScrollInfo?.viewportScrollY || 0;
                    // }
                    // _updateSceneSize --> scene@transformByState --> viewport@resizeCanvas
                    // --> viewport@scroll --> viewport onScrollAfter$
                    this._updateSceneSize(param as unknown as ISheetSkeletonManagerParam);
                }
            })));
    }

    /**
     * for mobile
     */
    // eslint-disable-next-line max-lines-per-function
    private _initPointerScrollEvent() {
        const sheetObject = this._getSheetObject();
        if (!sheetObject) return;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

        const scrollManagerService = this._scrollManagerService;
        const scene = sheetObject.scene;
        const spreadsheet = sheetObject.spreadsheet;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        const lastPointerPos: IPoint = { x: 0, y: 0 };
        let _pointerScrolling: boolean = false;

        const velocity = { x: 0, y: 0 };
        const deceleration = 0.95;
        let scrollInertiaAnimationID: null | number = null;
        const pointerScrollInertia = () => {
            if (!viewportMain) return;
            velocity.x *= deceleration;
            velocity.y *= deceleration;
            lastPointerPos.x += velocity.x;
            lastPointerPos.y += velocity.y;
            const offsetX = velocity.x;
            const offsetY = velocity.y;

            if (offsetY !== 0 || offsetX !== 0) {
                this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY, offsetX });
            }

            const _currentScroll: Readonly<Nullable<IScrollManagerParam>> = scrollManagerService.getCurrentScrollInfo();
            // const { unitId } = this._context;
            // const sheetId = workbook.getActiveSheet()!.getSheetId();
            // const {
            //     sheetViewStartRow = 0,
            //     sheetViewStartColumn = 0,
            //     offsetX: currentOffsetX = 0,
            //     offsetY: currentOffsetY = 0,
            // } = currentScroll || {};
            // scrollManagerService.setScrollInfoAndEmitEvent({
            //     unitId,
            //     sheetId,
            //     sheetViewStartRow, // + ySplit,
            //     sheetViewStartColumn, // + xSplit,
            //     offsetX: currentOffsetX + velocity.x, // currentOffsetX + offsetX may be negative or over max
            //     offsetY: currentOffsetY + velocity.y,
            // });

            if (Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 1) {
                scrollInertiaAnimationID = requestAnimationFrame(pointerScrollInertia);
            } else {
                scrollInertiaAnimationID = null;
            }
        };

        const cancelInertiaAnimation = () => {
            cancelAnimationFrame(scrollInertiaAnimationID!);
            scrollInertiaAnimationID = null;
        };

        spreadsheet.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            cancelInertiaAnimation();

            if (!viewportMain) return;

            lastPointerPos.x = evt.offsetX;
            lastPointerPos.y = evt.offsetY;
            _pointerScrolling = true;
            state.stopPropagation();
        });

        spreadsheet.onPointerMove$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            // cancelInertiaAnimation();
            if (!_pointerScrolling) return;
            if (!viewportMain) return;
            const e = evt as IPointerEvent | IMouseEvent;
            const deltaX = -(e.offsetX - lastPointerPos.x);
            const deltaY = -(e.offsetY - lastPointerPos.y);
            velocity.x = -(e.offsetX - lastPointerPos.x);
            velocity.y = -(e.offsetY - lastPointerPos.y);
            const offsetX = deltaX;
            const offsetY = deltaY;
            if (deltaX !== 0 || deltaY !== 0) {
                if (offsetY !== 0 || offsetX !== 0) {
                    this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY, offsetX });
                }
            }

            // get scrollInfo from packages/sheets-ui/src/commands/commands/set-scroll.command.ts
            const _currentScroll = scrollManagerService.getCurrentScrollInfo();
            // const {
            //     sheetViewStartRow = 0,
            //     sheetViewStartColumn = 0,
            //     offsetX: currentOffsetX = 0,
            //     offsetY: currentOffsetY = 0,
            // } = currentScroll || {};
            // console.log('spreadsheet into moving', deltaX, deltaY, currentOffsetX, currentOffsetY);

            // scrollManagerService.setScrollInfoAndEmitEvent({
            //     unitId,
            //     sheetId,
            //     sheetViewStartRow, // + ySplit,
            //     sheetViewStartColumn, // + xSplit,
            //     offsetX: currentOffsetX + deltaX, // currentOffsetX + offsetX may be negative or over max
            //     offsetY: currentOffsetY + deltaY,
            // });
            // console.log('before set scrollInfo', currentOffsetY, deltaY);
            // console.log('after set scrollInfo', scrollManagerService.getCurrentScrollInfo());

            lastPointerPos.x = e.offsetX;
            lastPointerPos.y = e.offsetY;

            state.stopPropagation();
        });

        spreadsheet.onPointerUp$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            _pointerScrolling = false;
            scrollInertiaAnimationID = requestAnimationFrame(pointerScrollInertia);
        });

        // trigger by scene.input-manager@_onPointerMove because currObject has changed
        spreadsheet.onPointerLeave$.subscribeEvent(() => {
            // this._pointerScrolling = false;
        });
        spreadsheet.onPointerOut$.subscribeEvent(() => {
            _pointerScrolling = false;
        });
        scene.onPointerOut$.subscribeEvent(() => {
            _pointerScrolling = false;
        });
        scene.onPointerCancel$.subscribeEvent(() => {
            _pointerScrolling = false;
        });
    }

    private _updateSceneSize(param: ISheetSkeletonManagerParam) {
        if (param == null) {
            return;
        }

        const { unitId } = this._context;
        const { skeleton } = param;
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;

        if (skeleton == null || scene == null) {
            return;
        }

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
            skeleton;
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;

        const zoomRatio = worksheet.getZoomRatio() || 1;
        scene?.setScaleValue(zoomRatio, zoomRatio);
        scene?.transformByState({
            width: rowHeaderWidthAndMarginLeft + columnTotalWidth,
            height: columnHeaderHeightAndMarginTop + rowTotalHeight,
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context);
    }

    private _scrollToSelectionByDirection(range: IRange) {
        const bounds = this._getViewportBounding();
        if (bounds == null) {
            return false;
        }
        const {
            startRow: viewportStartRow,
            startColumn: viewportStartColumn,
            endRow: viewportEndRow,
            endColumn: viewportEndColumn,
        } = bounds;

        let row = 0;
        let column = 0;

        const { startRow, startColumn, endRow, endColumn } = range;

        if (startRow >= viewportStartRow) {
            row = endRow;
        }

        if (endRow <= viewportEndRow) {
            row = startRow;
        }

        if (startColumn >= viewportStartColumn) {
            column = endColumn;
        }

        if (endColumn <= viewportEndColumn) {
            column = startColumn;
        }

        this._scrollToCell(row, column);
    }

    private _scrollToSelection(targetIsActualRowAndColumn = true) {
        const selection = this._selectionManagerService.getCurrentLastSelection();
        if (selection == null) {
            return;
        }

        const { startRow, startColumn, actualRow, actualColumn } = selection.primary;
        const selectionStartRow = targetIsActualRowAndColumn ? actualRow : startRow;
        const selectionStartColumn = targetIsActualRowAndColumn ? actualColumn : startColumn;

        this._scrollToCell(selectionStartRow, selectionStartColumn);
    }

    private _getViewportBounding() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }

        const viewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) {
            return;
        }

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const bounds = viewport.getBounding();
        return skeleton.getRowColumnSegment(bounds);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _scrollToCell(row: number, column: number): boolean {
        const { rowHeightAccumulation, columnWidthAccumulation } = this._sheetSkeletonManagerService.getCurrent()?.skeleton ?? {};

        if (rowHeightAccumulation == null || columnWidthAccumulation == null) return false;

        const scene = this._getSheetObject()?.scene;
        if (scene == null) return false;

        const viewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) return false;

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) return false;

        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) return false;

        const {
            startColumn: freezeStartColumn,
            startRow: freezeStartRow,
            ySplit: freezeYSplit,
            xSplit: freezeXSplit,
        } = worksheet.getFreeze();

        const bounds = this._getViewportBounding();
        if (bounds == null) return false;

        const {
            startRow: viewportStartRow,
            startColumn: viewportStartColumn,
            endRow: viewportEndRow,
            endColumn: viewportEndColumn,
        } = bounds;

        let startSheetViewRow: number | undefined;
        let startSheetViewColumn: number | undefined;

        // vertical overflow only happens when the selection's row is in not the freeze area
        if (row >= freezeStartRow && column >= freezeStartColumn - freezeXSplit) {
            // top overflow
            if (row <= viewportStartRow) {
                startSheetViewRow = row;
            }

            // bottom overflow
            if (row >= viewportEndRow) {
                const minRowAccumulation = rowHeightAccumulation[row] - viewport.height!;
                for (let r = viewportStartRow; r <= row; r++) {
                    if (rowHeightAccumulation[r] >= minRowAccumulation) {
                        startSheetViewRow = r + 1;
                        break;
                    }
                }
            }
        }
        // horizontal overflow only happens when the selection's column is in not the freeze area
        if (column >= freezeStartColumn && row >= freezeStartRow - freezeYSplit) {
            // left overflow
            if (column <= viewportStartColumn) {
                startSheetViewColumn = column;
            }

            // right overflow
            if (column >= viewportEndColumn) {
                const minColumnAccumulation = columnWidthAccumulation[column] - viewport.width!;
                for (let c = viewportStartColumn; c <= column; c++) {
                    if (columnWidthAccumulation[c] >= minColumnAccumulation) {
                        startSheetViewColumn = c + 1;
                        break;
                    }
                }
            }
        }

        if (startSheetViewRow === undefined && startSheetViewColumn === undefined) return false;

        const { offsetX, offsetY } = this._scrollManagerService.getCurrentScrollInfo() || {};
        return this._commandService.syncExecuteCommand(ScrollCommand.id, {
            sheetViewStartRow: startSheetViewRow,
            sheetViewStartColumn: startSheetViewColumn,
            offsetX: startSheetViewColumn === undefined ? offsetX : 0,
            offsetY: startSheetViewRow === undefined ? offsetY : 0,
        });
    }
}
