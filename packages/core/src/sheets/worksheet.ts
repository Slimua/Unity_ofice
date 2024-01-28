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

import type { Nullable } from '../shared';
import { ObjectMatrix, Rectangle, Tools } from '../shared';
import { createRowColIter } from '../shared/row-col-iter';
import { DEFAULT_WORKSHEET } from '../types/const';
import type { SheetTypes } from '../types/enum';
import { BooleanNumber } from '../types/enum';
import type { ICellData, ICellDataForSheetInterceptor, IFreeze, IRange, IWorksheetData } from '../types/interfaces';
import { ColumnManager } from './column-manager';
import { Range } from './range';
import { RowManager } from './row-manager';
import type { Styles } from './styles';
import { SheetViewModel } from './view-model';

/**
 * Worksheet instance represents a single sheet in a workbook.
 */
export class Worksheet {
    protected _initialized: boolean;

    protected _sheetId: string;
    protected _snapshot: IWorksheetData;
    protected _cellData: ObjectMatrix<ICellData>;

    protected _rowManager: RowManager;
    protected _columnManager: ColumnManager;

    protected readonly _viewModel: SheetViewModel;

    constructor(
        snapshot: Partial<IWorksheetData>,
        private readonly _styles: Styles
    ) {
        const mergedSnapshot: IWorksheetData = {
            ...DEFAULT_WORKSHEET,
            mergeData: [],
            hideRow: [],
            hideColumn: [],
            cellData: {},
            rowData: {},
            columnData: {},
            rowHeader: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnHeader: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            selections: ['A1'],
            rightToLeft: BooleanNumber.FALSE,
            pluginMeta: {},
            ...snapshot,
        };

        this._snapshot = mergedSnapshot;

        const { columnData, rowData, cellData } = this._snapshot;
        this._sheetId = this._snapshot.id ?? Tools.generateRandomId(6);
        this._initialized = false;
        this._cellData = new ObjectMatrix<ICellData>(cellData);
        this._rowManager = new RowManager(this._snapshot, rowData);
        this._columnManager = new ColumnManager(this._snapshot, columnData);

        // This view model will immediately injected with hooks from SheetViewModel service as Worksheet
        // is constructed.
        this._viewModel = new SheetViewModel();
    }

    /**
     * @internal
     * @param callback
     */
    __interceptViewModel(callback: (viewModel: SheetViewModel) => void) {
        callback(this._viewModel);
    }

    getSnapshot(): IWorksheetData {
        return this._snapshot;
    }

    /**
     * Returns WorkSheet Cell Data Matrix
     * @returns
     */
    getCellMatrix(): ObjectMatrix<Nullable<ICellData>> {
        return this._cellData;
    }

    /**
     * get worksheet printable cell range
     * @returns
     */
    getCellMatrixPrintRange() {
        const matrix = this.getCellMatrix();
        const mergedCells = this.getMergeData();

        let startRow = -1;
        let endRow = -1;
        let startColumn = -1;
        let endColumn = -1;

        let rowInitd = false;
        let columnInitd = false;
        matrix.forEach((rowIndex, row) => {
            Object.keys(row).forEach((colIndexStr) => {
                const colIndex = +colIndexStr;

                const cellValue = matrix.getValue(rowIndex, colIndex);
                const style = cellValue?.s ? this._styles.get(cellValue.s) : null;
                if (cellValue && (cellValue.v || cellValue.p || style?.bg || style?.bd)) {
                    if (rowInitd) {
                        startRow = Math.min(startRow, rowIndex);
                    } else {
                        startRow = rowIndex;
                        rowInitd = true;
                    }
                    endRow = Math.max(endRow, rowIndex);

                    if (columnInitd) {
                        startColumn = Math.min(startColumn, colIndex);
                    } else {
                        columnInitd = true;
                        startColumn = colIndex;
                    }

                    endColumn = Math.max(endColumn, colIndex);
                }
            });
        });

        mergedCells.forEach((mergedCell) => {
            if (rowInitd) {
                startRow = Math.min(startRow, mergedCell.startRow);
            } else {
                startRow = mergedCell.startRow;
                rowInitd = true;
            }
            endRow = Math.max(endRow, mergedCell.endRow);

            if (columnInitd) {
                startColumn = Math.min(startColumn, mergedCell.startColumn);
            } else {
                startColumn = mergedCell.startColumn;
                rowInitd = true;
            }
            endColumn = Math.max(endColumn, mergedCell.endColumn);
        });

        return {
            startColumn,
            startRow,
            endColumn,
            endRow,
        };
    }

    /**
     * Returns Row Manager
     * @returns Row Manager
     */
    getRowManager(): RowManager {
        return this._rowManager;
    }

    /**
     * Returns the ID of the sheet represented by this object.
     * @returns ID of the sheet
     */
    getSheetId(): string {
        return this._sheetId;
    }

    /**
     * Returns Column Manager
     * @returns Column Manager
     */
    getColumnManager(): ColumnManager {
        return this._columnManager;
    }

    /**
     * Returns the name of the sheet.
     * @returns name of the sheet
     */
    getName(): string {
        return this._snapshot.name;
    }

    /**
     * Returns WorkSheet Clone Object
     * @returns WorkSheet Clone Object
     * @deprecated
     */
    clone(): Worksheet {
        const { _snapshot: _config } = this;
        const copy = Tools.deepClone(_config);

        return new Worksheet(copy, this._styles);
    }

    getMergeData(): IRange[] {
        return this._snapshot.mergeData;
    }

    /**
     * @deprecated use `getMergedCell` instead
     * @param row
     * @param col
     * @returns
     */
    getMergedCells(row: number, col: number): Nullable<IRange[]> {
        const _rectangleList = this._snapshot.mergeData;
        const rectList = [];
        for (let i = 0; i < _rectangleList.length; i++) {
            const range = _rectangleList[i];
            if (
                Rectangle.intersects(
                    {
                        startRow: row,
                        startColumn: col,
                        endRow: row,
                        endColumn: col,
                    },
                    range
                )
            ) {
                rectList.push(range);
            }
        }

        return rectList.length ? rectList : null;
    }

    getMergedCell(row: number, col: number): Nullable<IRange> {
        const rectangleList = this._snapshot.mergeData;
        for (let i = 0; i < rectangleList.length; i++) {
            const range = rectangleList[i];
            if (
                Rectangle.intersects(
                    {
                        startRow: row,
                        startColumn: col,
                        endRow: row,
                        endColumn: col,
                    },
                    range
                )
            ) {
                return range;
            }
        }

        return null;
    }

    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (row < 0 || col < 0) {
            return null;
        }

        return this._viewModel.getCell(row, col);
    }

    getCellRaw(row: number, col: number): Nullable<ICellData> {
        return this.getCellMatrix().getValue(row, col);
    }

    /**
     * Get cell matrix from a given range and pick out non-first cells of merged cells.
     *
     * Notice that `ICellData` here is not after copying. In another word, the object matrix here should be
     * considered as a slice of the original worksheet data matrix.
     */
    // PERF: we could not skip indexes with merged cells, because we have already known the merged cells' range
    getMatrixWithMergedCells(
        row: number,
        col: number,
        endRow: number,
        endCol: number
    ): ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }> {
        const matrix = this.getCellMatrix();

        // get all merged cells
        const mergedCellsInRange = this._snapshot.mergeData.filter((rect) =>
            Rectangle.intersects({ startRow: row, startColumn: col, endRow, endColumn: endCol }, rect)
        );

        const ret = new ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>();

        // iterate all cells in the range
        createRowColIter(row, endRow, col, endCol).forEach((row, col) => {
            const v = matrix.getValue(row, col);
            if (v) {
                ret.setValue(row, col, v);
            }
        });

        mergedCellsInRange.forEach((mergedCell) => {
            const { startColumn, startRow, endColumn, endRow } = mergedCell;
            createRowColIter(startRow, endRow, startColumn, endColumn).forEach((row, col) => {
                if (row === startRow && col === startColumn) {
                    ret.setValue(row, col, {
                        ...matrix.getValue(row, col),
                        rowSpan: endRow - startRow + 1,
                        colSpan: endColumn - startColumn + 1,
                    });
                }

                if (row !== startRow || col !== startColumn) {
                    ret.realDeleteValue(row, col);
                }
            });
        });

        return ret;
    }

    getRange(range: IRange): Range;
    getRange(startRow: number, startColumn: number): Range;
    getRange(startRow: number, startColumn: number, endRow: number, endColumn: number): Range;
    getRange(startRowOrRange: number | IRange, startColumn?: number, endRow?: number, endColumn?: number): Range {
        if (typeof startRowOrRange === 'object') {
            return new Range(this, startRowOrRange, {
                getStyles: () => this._styles,
            });
        }

        return new Range(
            this,
            {
                startRow: startRowOrRange,
                startColumn: startColumn!,
                endColumn: endColumn || startColumn!,
                endRow: endRow || startRowOrRange,
            },
            {
                getStyles: () => this._styles,
            }
        );
    }

    /**
     * Returns WorkSheet Status
     * @returns WorkSheet Status
     */
    getStatus() {
        const { _snapshot: _config } = this;

        return _config.status;
    }

    /**
     * Return WorkSheetZoomRatio
     * @return zoomRatio
     */
    getZoomRatio(): number {
        return this._snapshot.zoomRatio || 1;
    }

    /**
     * Returns WorkSheet Configures
     * @returns WorkSheet Configures
     */
    getConfig(): IWorksheetData {
        return this._snapshot;
    }

    /**
     * Returns  frozen.
     * @returns  frozen
     */
    getFreeze(): IFreeze {
        return this._snapshot.freeze;
    }

    /**
     * Returns the current number of columns in the sheet, regardless of content.
     * @returns the current number of columns in the sheet, regardless of content
     */
    getMaxColumns(): number {
        const { _snapshot: _config } = this;
        const { columnCount } = _config;

        return columnCount;
    }

    /**
     * Returns the current number of rows in the sheet, regardless of content.
     * @returns the current number of rows in the sheet, regardless of content
     */
    getMaxRows(): number {
        const { _snapshot: _config } = this;
        const { rowCount } = _config;

        return rowCount;
    }

    /**
     * Returns the type of the sheet.
     * @returns the type of the sheet
     */
    getType(): SheetTypes {
        const { _snapshot: _config } = this;
        const { type } = _config;
        return type;
    }

    getRowCount(): number {
        return this._snapshot.rowCount;
    }

    setRowCount(count: number): void {
        this._snapshot.rowCount = count;
    }

    getColumnCount(): number {
        return this._snapshot.columnCount;
    }

    setColumnCount(count: number): void {
        this._snapshot.columnCount = count;
    }

    /**
     * isSheetHidden
     * @returns hidden status of sheet
     */
    isSheetHidden(): BooleanNumber {
        return this._snapshot.hidden;
    }

    /**
     * Returns true if the sheet's gridlines are hidden; otherwise returns false. Gridlines are visible by default.
     * @returns Gridlines Hidden Status
     */
    hasHiddenGridlines(): boolean {
        const { _snapshot: _config } = this;
        const { showGridlines } = _config;
        if (showGridlines === 0) {
            return true;
        }

        return false;
    }

    /**
     * Gets the sheet tab color, or null if the sheet tab has no color.
     * @returns the sheet tab color or null
     */
    getTabColor(): Nullable<string> {
        const { _snapshot: _config } = this;
        const { tabColor } = _config;

        return tabColor;
    }

    /**
     * Gets the width in pixels of the given column.
     * @param columnPosition column index
     * @returns Gets the width in pixels of the given column.
     */
    getColumnWidth(columnPosition: number): number {
        return this.getColumnManager().getColumnWidth(columnPosition);
    }

    /**
     * Gets the height in pixels of the given row.
     * @param rowPosition row index
     * @returns Gets the height in pixels of the given row.
     */
    getRowHeight(rowPosition: number): number {
        return this.getRowManager().getRowHeight(rowPosition);
    }

    getRowVisible(row: number): boolean {
        return this.getRowManager().getRowVisible(row);
    }

    getHiddenRows(start?: number, end?: number): IRange[] {
        const lastColumn = this.getMaxColumns() - 1;
        const ranges = this._rowManager.getHiddenRows(start, end);
        ranges.forEach((range) => (range.endColumn = lastColumn));

        return ranges;
    }

    getColVisible(col: number): boolean {
        return this._columnManager.getColVisible(col);
    }

    getHiddenCols(start?: number, end?: number): IRange[] {
        const lastRow = this.getMaxRows() - 1;
        const ranges = this._columnManager.getHiddenCols(start, end);
        ranges.forEach((range) => (range.endRow = lastRow));

        return ranges;
    }

    /**
     * Get all visible rows in the sheet.
     * @returns Visible rows range list
     */
    getVisibleRows(): IRange[] {
        const rowCount = this.getRowCount();
        return this._rowManager.getVisibleRows(0, rowCount - 1);
    }

    /**
     * Get all visible columns in the sheet.
     * @returns Visible columns range list
     */
    getVisibleCols(): IRange[] {
        const columnCount = this.getColumnCount();
        return this._columnManager.getVisibleCols(0, columnCount - 1);
    }

    /**
     * Returns true if this sheet layout is right-to-left. Returns false if the sheet uses the default left-to-right layout.
     * @returns true if this sheet layout is right-to-left. Returns false if the sheet uses the default left-to-right layout.
     */
    isRightToLeft(): BooleanNumber {
        const { _snapshot: _config } = this;
        const { rightToLeft } = _config;

        return rightToLeft;
    }

    /**
     * @typeParam T - plugin data structure
     * @param name - plugin name
     * @returns information stored by the plugin
     */
    getPluginMeta<T>(name: string): T {
        return this._snapshot.pluginMeta[name];
    }

    /**
     * @typeParam T - plugin data structure
     * @param name - plugin name
     * @param value - plugin value
     * @returns
     */
    setPluginMeta<T>(name: string, value: T) {
        this._snapshot.pluginMeta[name] = value;
    }

    /**
     * Returns the position of the last row that has content.
     * @returns the position of the last row that has content.
     */
    getLastRowWithContent(): number {
        return this._cellData.getLength() - 1;
    }

    /**
     * Returns the position of the last column that has content.
     * @returns the position of the last column that has content.
     */
    getLastColumnWithContent(): number {
        return this._cellData.getRange().endColumn;
    }

    cellHasValue(value: ICellData) {
        return value && (value.v !== undefined || value.f !== undefined || value.p !== undefined);
    }

    // #region iterators

    // #endregion
}
