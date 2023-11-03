import { IRange, IUniverInstanceService, LifecycleStages, OnLifecycle, SheetInterceptorService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SetRangeValuesCommand } from '../commands/commands/set-range-values.command';
import { ISetStyleParams, SetStyleCommand } from '../commands/commands/set-style.command';
import { DeltaColumnWidthCommand, SetColWidthCommand } from '../commands/commands/set-worksheet-col-width.command';
import { SetWorksheetRowIsAutoHeightCommand } from '../commands/commands/set-worksheet-row-height.command';
import { ISetRangeValuesMutationParams } from '../commands/mutations/set-range-values.mutation';
import { ISetWorksheetColWidthMutationParams } from '../commands/mutations/set-worksheet-col-width.mutation';
import {
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
} from '../commands/mutations/set-worksheet-row-height.mutation';
import { SelectionManagerService } from '../services/selection/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, AutoHeightController)
export class AutoHeightController {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        this._initialize();
    }

    private _getUndoRedoParamsOfAutoHeight(ranges: IRange[]) {
        const {
            _univerInstanceService: univerInstanceService,
            _sheetSkeletonManagerService: sheetSkeletonService,
            _injector: injector,
        } = this;

        const { skeleton } = sheetSkeletonService.getCurrent()!;
        const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(ranges);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheetId = workbook.getActiveSheet().getSheetId();

        const redoParams: ISetWorksheetRowAutoHeightMutationParams = {
            worksheetId,
            workbookId,
            rowsAutoHeightInfo,
        };

        const undoParams: ISetWorksheetRowAutoHeightMutationParams = SetWorksheetRowAutoHeightMutationFactory(
            injector,
            redoParams
        );

        return {
            undos: [
                {
                    id: SetWorksheetRowAutoHeightMutation.id,
                    params: undoParams,
                },
            ],
            redos: [
                {
                    id: SetWorksheetRowAutoHeightMutation.id,
                    params: redoParams,
                },
            ],
        };
    }

    private _initialize() {
        const { _sheetInterceptorService: sheetInterceptorService, _selectionManagerService: selectionManagerService } =
            this;
        // for intercept'SetRangeValuesCommand' command.
        sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetRangeValuesMutationParams }) => {
                if (command.id !== SetRangeValuesCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this._getUndoRedoParamsOfAutoHeight(command.params.range);
            },
        });
        // for intercept 'sheet.command.set-row-is-auto-height' command.
        sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetWorksheetRowIsAutoHeightMutationParams }) => {
                if (command.id !== SetWorksheetRowIsAutoHeightCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this._getUndoRedoParamsOfAutoHeight(command.params.ranges);
            },
        });

        // for intercept set-worksheet-col-width command.
        sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetWorksheetColWidthMutationParams }) => {
                if (command.id !== DeltaColumnWidthCommand.id && command.id !== SetColWidthCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this._getUndoRedoParamsOfAutoHeight(command.params.ranges);
            },
        });

        // for intercept set style command.
        sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetStyleParams<number> }) => {
                if (command.id !== SetStyleCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                // TODO: @jocs, All styles that affect the size of the cell,
                // I don't know if the enumeration is complete, to be added in the future.
                const AFFECT_LAYOUT_STYLES = ['ff', 'fs', 'tr', 'tb'];

                if (!AFFECT_LAYOUT_STYLES.includes(command.params?.style.type)) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                const selections = selectionManagerService.getSelectionRanges();

                if (!selections?.length) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this._getUndoRedoParamsOfAutoHeight(selections);
            },
        });
    }
}
