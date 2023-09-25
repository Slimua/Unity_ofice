import {
    convertSelectionDataToRange,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    ISelection,
    LifecycleStages,
    ObserverManager,
    OnLifecycle,
    SELECTION_TYPE,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject, ISheetObjectParam } from '../Basics/component-tools';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, SelectionController)
export class SelectionController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheetLeftTopPlaceholder } = sheetObject;

        this._onChangeListener();

        this._initialMain(sheetObject);

        this._initialRowHeader(sheetObject);

        this._initialColumnHeader(sheetObject);

        this._commandExecutedListener();

        spreadsheetLeftTopPlaceholder?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {});

        this._userActionSyncListener();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId,
            sheetId,
        });
    }

    private _initialMain(sheetObject: ISheetObjectParam) {
        const { spreadsheet } = sheetObject;
        spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.eventTrigger(evt, spreadsheet.zIndex + 1, SELECTION_TYPE.NORMAL);
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _initialRowHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetRowHeader, spreadsheet } = sheetObject;

        spreadsheetRowHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                (spreadsheet?.zIndex || 1) + 1,
                SELECTION_TYPE.ROW
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });

        spreadsheetRowHeader?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {});
    }

    private _initialColumnHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetColumnHeader, spreadsheet } = sheetObject;
        spreadsheetColumnHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                (spreadsheet?.zIndex || 1) + 1,
                SELECTION_TYPE.COLUMN
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _onChangeListener() {
        this._selectionManagerService.selectionInfo$.subscribe((param) => {
            this._selectionTransformerShapeManager.reset();
            if (param == null) {
                return;
            }

            for (const selectionRange of param) {
                const selectionData =
                    this._selectionTransformerShapeManager.convertSelectionRangeToData(selectionRange);
                this._selectionTransformerShapeManager.addControlToCurrentByRangeData(selectionData);
            }
        });
    }

    private _userActionSyncListener() {
        this._selectionTransformerShapeManager.selectionRangeWithStyle$.subscribe((selectionDataWithStyleList) => {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            const unitId = workbook.getUnitId();
            const sheetId = workbook.getActiveSheet().getSheetId();

            this._commandService.executeCommand(SetSelectionsOperation.id, {
                unitId,
                sheetId,
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                    convertSelectionDataToRange(selectionDataWithStyle)
                ),
            });

            const current = selectionDataWithStyleList[selectionDataWithStyleList.length - 1];
            if (current == null) {
                return;
            }
            const selectionRange = convertSelectionDataToRange(current);
            this._observerManager.getObserver<ISelection>('onChangeSelectionObserver')?.notifyObservers({
                rangeData: selectionRange.rangeData,
                cellRange: selectionRange.cellRange,
                selectionType: selectionRange.selectionType,
            });
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {}
}
