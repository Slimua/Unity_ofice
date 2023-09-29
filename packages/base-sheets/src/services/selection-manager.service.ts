import {
    ISelectionStyle,
    ISelectionWithStyle,
    mergeCellHandler,
    NORMAL_SELECTION_PLUGIN_STYLE,
} from '@univerjs/base-render';
import { IRange, ISelectionCell, makeCellRangeToRangeData, Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export const NORMAL_SELECTION_PLUGIN_NAME = 'normalSelectionPluginName';

export interface ISelectionManagerSearchParam {
    pluginName: string;
    unitId: string;
    sheetId: string;
}

export interface ISelectionManagerInsertParam extends ISelectionManagerSearchParam {
    selectionDatas: ISelectionWithStyle[];
}

//{ [pluginName: string]: { [unitId: string]: { [sheetId: string]: ISelectionWithCoord[] } } }
export type ISelectionInfo = Map<string, Map<string, Map<string, ISelectionWithStyle[]>>>;

/**
 * This service is for selection.
 */
export class SelectionManagerService implements IDisposable {
    private readonly _selectionInfo: ISelectionInfo = new Map();

    private _currentSelection: Nullable<ISelectionManagerSearchParam> = null;

    // private _currentStyle: ISelectionStyle = NORMAL_SELECTION_PLUGIN_STYLE;

    // private _isSelectionEnabled: boolean = true;

    private readonly _selectionInfo$ = new BehaviorSubject<Nullable<ISelectionWithStyle[]>>(null);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly selectionInfo$ = this._selectionInfo$.asObservable();

    // get isSelectionEnabled() {
    //     return this._isSelectionEnabled;
    // }

    // get currentStyle() {
    //     return this._currentStyle;
    // }

    reset() {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection = {
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: this._currentSelection?.unitId,
            sheetId: this._currentSelection?.sheetId,
        };
        this._selectionInfo.clear();

        this.refresh(this._currentSelection);
    }

    resetPlugin() {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection.pluginName = NORMAL_SELECTION_PLUGIN_NAME;

        this.refresh(this._currentSelection);
    }

    dispose(): void {
        this._selectionInfo$.complete();
        // this._currentSelection$.complete();
    }

    setCurrentSelection(param: ISelectionManagerSearchParam) {
        this._currentSelection = param;

        this.refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ISelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    getSelectionInfo(): Readonly<ISelectionInfo> {
        return this._selectionInfo;
    }

    getSelectionDatasByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelectionDatas(param);
    }

    getSelections(): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelectionDatas(this._currentSelection);
    }

    /** @deprecated use getSelectionsData instead */
    getRangeDatas(): Nullable<IRange[]> {
        const selectionDataList = this.getSelections();
        if (selectionDataList == null) {
            return;
        }
        return selectionDataList.map((selectionData: ISelectionWithStyle) => {
            const range = selectionData.range;
            const { startRow, startColumn, endRow, endColumn } = range;
            return {
                startRow,
                startColumn,
                endRow,
                endColumn,
            };
        });
    }

    getFirst(): Readonly<Nullable<ISelectionWithStyle>> {
        return this._getFirstByParam(this._currentSelection);
    }

    getLast(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        // The last selection position must have a primary.
        return this._getLastByParam(this._currentSelection) as Readonly<
            Nullable<ISelectionWithStyle & { primary: ISelectionCell }>
        >;
    }

    add(selectionDatas: ISelectionWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam({
            ...this._currentSelection,
            selectionDatas,
        });
    }

    replace(selectionDatas: ISelectionWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDatas,
        });
        this.refresh(this._currentSelection);
    }

    replaceWithNoRefresh(selectionDatas: ISelectionWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDatas,
        });
    }

    clear(): void {
        if (this._currentSelection == null) {
            return;
        }
        this._clearByParam(this._currentSelection);
    }

    remove(index: number): void {
        if (this._currentSelection == null) {
            return;
        }

        this._removeByParam(index, this._currentSelection);
    }

    createDefaultAutoFillSelection(): ISelectionStyle {
        return {
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            widgets: {},
            hasAutoFill: true,
        };
    }

    createCopyPasteSelection(): ISelectionStyle {
        return {
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            widgets: {},
            hasAutoFill: false,
        };
    }

    createDefaultSelection(): ISelectionStyle {
        return {
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            widgets: { tr: true, tl: true, br: true, bl: true },
            hasAutoFill: false,
        };
    }

    transformCellDataToSelectionData(row: number, column: number, mergeData: IRange[]): Nullable<ISelectionWithStyle> {
        const newCellRange = mergeCellHandler(row, column, mergeData);

        const newSelectionData = makeCellRangeToRangeData(newCellRange);

        if (!newSelectionData) {
            return;
        }

        return {
            range: newSelectionData,
            primary: newCellRange,
            style: NORMAL_SELECTION_PLUGIN_STYLE,
        };
    }

    private _getSelectionDatas(param: Nullable<ISelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId, sheetId } = param;
        return this._selectionInfo.get(pluginName)?.get(unitId)?.get(sheetId);
    }

    private refresh(param: ISelectionManagerSearchParam): void {
        this._selectionInfo$.next(this._getSelectionDatas(param));
    }

    private _getFirstByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle>> {
        const selectionData = this._getSelectionDatas(param);

        return selectionData?.[0];
    }

    private _getLastByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle>> {
        const selectionData = this._getSelectionDatas(param);

        return selectionData?.[selectionData.length - 1];
    }

    private _addByParam(insertParam: ISelectionManagerInsertParam): void {
        const { pluginName, unitId, sheetId, selectionDatas } = insertParam;

        if (!this._selectionInfo.has(pluginName)) {
            this._selectionInfo.set(pluginName, new Map());
        }

        const unitSelectionData = this._selectionInfo.get(pluginName)!;

        if (!unitSelectionData.has(unitId)) {
            unitSelectionData.set(unitId, new Map());
        }

        const sheetSelectionData = unitSelectionData.get(unitId)!;

        if (!sheetSelectionData.has(sheetId)) {
            sheetSelectionData.set(sheetId, [...selectionDatas]);
        } else {
            const OldSelectionDatas = sheetSelectionData.get(sheetId)!;
            OldSelectionDatas.push(...selectionDatas);
        }

        this.refresh({ pluginName, unitId, sheetId });
    }

    private _replaceByParam(insertParam: ISelectionManagerInsertParam) {
        const { pluginName, unitId, sheetId, selectionDatas } = insertParam;

        if (!this._selectionInfo.has(pluginName)) {
            this._selectionInfo.set(pluginName, new Map());
        }

        const unitSelectionData = this._selectionInfo.get(pluginName)!;

        if (!unitSelectionData.has(unitId)) {
            unitSelectionData.set(unitId, new Map());
        }

        const sheetSelectionData = unitSelectionData.get(unitId)!;

        if (!sheetSelectionData.has(sheetId)) {
            sheetSelectionData.set(sheetId, selectionDatas);
        } else {
            const OldSelectionDatas = sheetSelectionData.get(sheetId)!;
            OldSelectionDatas.splice(0, OldSelectionDatas.length, ...selectionDatas);
        }

        // this.refresh({ pluginName, unitId, sheetId });
    }

    private _clearByParam(param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDatas(param);

        selectionData?.splice(0);

        this.refresh(param);
    }

    private _removeByParam(index: number, param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDatas(param);

        selectionData?.splice(index, 1);

        this.refresh(param);
    }

    // private refreshCurrentSelection(): void {
    //     this._currentSelection$.next(this._currentSelection);
    // }
}
