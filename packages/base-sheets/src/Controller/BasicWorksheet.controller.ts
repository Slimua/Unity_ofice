import { IDisposable } from '@wendellhu/redi';
import { Dimension, Disposable, ICellData, ICellV, ICommandService, IRangeData, IStyleData, ObjectMatrix, ObjectMatrixPrimitiveType } from '@univerjs/core';

import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';
import { SetWorksheetNameCommand } from '../Commands/Commands/set-worksheet-name.command';
import { SetWorksheetNameMutation } from '../Commands/Mutations/set-worksheet-name.mutation';
import { SetWorksheetActivateCommand } from '../Commands/Commands/set-worksheet-activate.command';
import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { ISetStyleParams, SetStyleCommand } from '../Commands/Commands/set-style.command';
import { SetRangeStyleMutation } from '../Commands/Mutations/set-range-styles.mutation';
import { ISetRangeFormattedValueParams, SetRangeFormattedValueCommand } from '../Commands/Commands/set-range-formatted-value.command';
import { DeleteRangeCommand, IDeleteRangeParams } from '../Commands/Commands/delete-range.command';
import { IInsertRangeParams, InsertRangeCommand } from '../Commands/Commands/insert-range.command';
import { TrimWhitespaceCommand } from '../Commands/Commands/trim-whitespace.command';
import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../Commands/Commands/set-range-values.command';
import { SetWorksheetHideCommand } from '../Commands/Commands/set-worksheet-hide.command';
import { SetWorksheetHideMutation } from '../Commands/Mutations/set-worksheet-hide.mutation';
import { InsertColCommand, InsertRowCommand } from '../Commands/Commands/insert-row-col.command';
import { InsertColMutation, InsertRowMutation } from '../Commands/Mutations/insert-row-col.mutation';
import { RemoveColCommand, RemoveRowCommand } from '../Commands/Commands/remove-row-col.command';
import { RemoveColMutation, RemoveRowMutation } from '../Commands/Mutations/remove-row-col.mutation';
import { SetWorksheetColWidthCommand } from '../Commands/Commands/set-worksheet-col-width.command';
import { SetWorksheetColWidthMutation } from '../Commands/Mutations/set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightCommand } from '../Commands/Commands/set-worksheet-row-height.command';
import { SetWorksheetRowHeightMutation } from '../Commands/Mutations/set-worksheet-row-height.mutation';
import { SetWorksheetRowHideCommand } from '../Commands/Commands/set-worksheet-row-hide.command';
import { SetWorksheetRowHideMutation } from '../Commands/Mutations/set-worksheet-row-hide.mutation';
import { SetWorksheetRowShowCommand } from '../Commands/Commands/set-worksheet-row-show.command';
import { SetWorksheetRowShowMutation } from '../Commands/Mutations/set-worksheet-row-show.mutation';
import { InsertRangeMutation } from '../Commands/Mutations/insert-range.mutation';
import { DeleteRangeMutation } from '../Commands/Mutations/delete-range.mutation';
import { SetRangeFormattedValueMutation } from '../Commands/Mutations/set-range-formatted-value.mutation';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController extends Disposable implements IDisposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();

        [
            ClearSelectionContentCommand,
            SetRangeValuesMutation,
            SetWorksheetNameCommand,
            SetWorksheetNameMutation,
            SetWorksheetActivateCommand,
            SetWorksheetActivateMutation,
            SetStyleCommand,
            SetRangeStyleMutation,
            SetWorksheetHideCommand,
            SetWorksheetHideMutation,

            InsertRowCommand,
            InsertRowMutation,
            RemoveRowCommand,
            RemoveRowMutation,
            InsertColCommand,
            InsertColMutation,
            RemoveColCommand,
            RemoveColMutation,

            SetWorksheetColWidthCommand,
            SetWorksheetColWidthMutation,
            SetWorksheetRowHeightCommand,
            SetWorksheetRowHeightMutation,
            SetWorksheetRowHideCommand,
            SetWorksheetRowHideMutation,
            SetWorksheetRowShowCommand,
            SetWorksheetRowShowMutation,

            SetRangeValuesCommand,
            TrimWhitespaceCommand,
            InsertRangeCommand,
            InsertRangeMutation,
            DeleteRangeCommand,
            DeleteRangeMutation,
            SetRangeFormattedValueCommand,
            SetRangeFormattedValueMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    /**
     * Clear contents in the current selected ranges.
     */
    async clearSelectionContent(): Promise<boolean> {
        return this._commandService.executeCommand(ClearSelectionContentCommand.id);
    }

    async setStyle<T>(workbookId: string, worksheetId: string, style: IStyleTypeValue<T>, range: IRangeData[]): Promise<boolean> {
        const options: ISetStyleParams<T> = {
            workbookId,
            worksheetId,
            style,
            range,
        };
        return this._commandService.executeCommand(SetStyleCommand.id, options);
    }

    /**
     * Trims the whitespace (such as spaces, tabs, or new lines) in every cell in this range. Removes all whitespace from the start and end of each cell's text, and reduces any subsequence of remaining whitespace characters to a single space.
     */
    async trimWhitespace(workbookId: string, worksheetId: string, range: IRangeData[]): Promise<boolean> {
        const options = {
            workbookId,
            worksheetId,
            range,
        };
        return this._commandService.executeCommand(TrimWhitespaceCommand.id, options);
    }

    /**
     * Sets a rectangular grid of values (must match dimensions of this range).
     */
    async setValue(workbookId: string, worksheetId: string, value: ICellV | ICellV[][] | ObjectMatrix<ICellV>, range: IRangeData[]): Promise<boolean> {
        const options: ISetRangeFormattedValueParams = {
            workbookId,
            worksheetId,
            value,
            range,
        };
        return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    }

    /**
     * Sets a rectangular grid of cell obejct data (must match dimensions of this range).
     * @param value A two-dimensional array of cell object data.
     */
    async setRangeValues(workbookId: string, worksheetId: string, value: ICellData | ICellData[][] | ObjectMatrixPrimitiveType<ICellData>, range: IRangeData): Promise<boolean> {
        const options: ISetRangeValuesCommandParams = {
            workbookId,
            worksheetId,
            value,
            range,
        };
        return this._commandService.executeCommand(SetRangeValuesCommand.id, options);
    }

    /**
     * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
     *
     * solution: Clear the range to be deleted, and then set the new value of the cell content at the bottom using setValue
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     */
    async deleteRange(workbookId: string, worksheetId: string, shiftDimension: Dimension, range: IRangeData): Promise<boolean> {
        const options: IDeleteRangeParams = {
            workbookId,
            worksheetId,
            shiftDimension,
            range,
        };
        return this._commandService.executeCommand(DeleteRangeCommand.id, options);
    }

    /**
     * Inserts empty cells into this range. The new cells retain any formatting present in the cells previously occupying this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     */
    async insertRange(workbookId: string, worksheetId: string, shiftDimension: Dimension, range: IRangeData, destination?: IRangeData): Promise<boolean> {
        const options: IInsertRangeParams = {
            workbookId,
            worksheetId,
            shiftDimension,
            range,
            destination,
        };
        return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    }

    /**
     * Cut and paste (both format and values) from this range to the target range.
     * @param target A target range to copy this range to; only the top-left cell position is relevant.
     */
    // async moveTo(workbookId: string, worksheetId: string, range: IRangeData): Promise<boolean> {
    //     const options: IInsertRangeParams = {
    //         workbookId,
    //         worksheetId,
    //         shiftDimension,
    //         range,
    //         destination,
    //     };
    //     return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    // }
}
