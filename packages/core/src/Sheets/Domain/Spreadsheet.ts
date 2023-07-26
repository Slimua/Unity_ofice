import { Column } from './Column';
import { Row } from './Row';
import { SpreadsheetCommand } from './SpreadsheetCommand';
import { Merge } from './Merge';
import { CommandManager } from '../../Command';
import { Range } from './Range';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import {
    IInsertSheetActionData,
    IRemoveSheetActionData,
    ISetColumnHideActionData,
    ISetColumnShowActionData,
    ISetRowHideActionData,
    ISetRowShowActionData,
    ISetWorkSheetActivateActionData,
} from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const';
import { BooleanNumber } from '../../Types/Enum';
import { Nullable } from '../../Shared';
import { Style } from './Style';
import { ISpreadsheetConfig } from '../../Types/Interfaces/ISpreadsheetData';

export class Spreadsheet {
    private range: Range;

    private model: SpreadsheetModel;

    private merge: Merge;

    private spreadsheetModel: SpreadsheetModel;

    private column: Column;

    private row: Row;

    private style: Style;

    constructor(private snapshot: Partial<ISpreadsheetConfig>, private commandManager: CommandManager) {
        this.model = new SpreadsheetModel(snapshot);
        this.range = new Range(this.commandManager, this.model);
        this.merge = new Merge();
        this.row = new Row(this.commandManager, this.model);
        this.column = new Column(this.commandManager, this.model);
        this.style = new Style(this.model);
    }

    getModel(){
        return this.model;
    }

    insertSheet(): string;
    insertSheet(index: number): string;
    insertSheet(...parameter: any[]): string {
        switch (parameter.length) {
            case 0: {
                const insertSheetAction: IInsertSheetActionData = {
                    actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                    index: -1,
                    sheetId: '',
                };
                const command = new SpreadsheetCommand(this.model, insertSheetAction);
                this.commandManager.invoke(command);
                return insertSheetAction.sheetId;
            }
            case 1: {
                const index: number = parameter[0];

                const insertSheetAction: IInsertSheetActionData = {
                    actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                    index,
                    sheetId: '',
                };
                const command = new SpreadsheetCommand(this.model, insertSheetAction);
                this.commandManager.invoke(command);
                return insertSheetAction.actionName;
            }
        }
        throw new Error('overload method error');
    }

    getActiveSheetIndex(): number {
        return Object.keys(this.model.worksheets).findIndex((sheetId) => this.model.worksheets[sheetId].activation);
    }

    getSheetSize(): number {
        return Object.keys(this.model.worksheets).length;
    }

    getActiveSheet(): Nullable<string> {
        return Object.keys(this.model.worksheets).find((sheetId) => this.model.worksheets[sheetId].activation);
    }

    setActiveSheet(sheetId: string): void {
        const insertSheetAction: ISetWorkSheetActivateActionData = {
            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
            sheetId,
            status: BooleanNumber.TRUE,
        };
        const command = new SpreadsheetCommand(this.model, insertSheetAction);
        this.commandManager.invoke(command);
    }

    removeSheetById(sheetId: string): void {
        const removeSheetAction: IRemoveSheetActionData = {
            actionName: ACTION_NAMES.REMOVE_SHEET_ACTION,
            sheetId,
        };
        const command = new SpreadsheetCommand(this.model, removeSheetAction);
        this.commandManager.invoke(command);
    }

    /**
     * Hides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @param columnCount column count
     * @returns WorkSheet Instance
     */
    hideColumns(columnIndex: number, columnCount: number, sheetId: string): string {
        const hideColumnAction: ISetColumnHideActionData = {
            actionName: ACTION_NAMES.SET_COLUMN_HIDE_ACTION,
            columnCount,
            columnIndex,
            sheetId,
        };
        const command = new SpreadsheetCommand(this.model, hideColumnAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Unhides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @param columnCount column count
     * @returns WorkSheet Instance
     */
    showColumns(columnIndex: number, columnCount: number, sheetId: string): string {
        const showColumnAction: ISetColumnShowActionData = {
            actionName: ACTION_NAMES.SET_COLUMN_SHOW_ACTION,
            sheetId,
            columnCount,
            columnIndex,
        };
        const command = new SpreadsheetCommand(this.model, showColumnAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Hides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @param rowCount row count
     * @returns WorkSheet Instance
     */
    hideRows(rowIndex: number, rowCount: number, sheetId: string): string {
        const hideRowAction: ISetRowHideActionData = {
            actionName: ACTION_NAMES.SET_ROW_HIDE_ACTION,
            sheetId,
            rowCount,
            rowIndex,
        };
        const command = new SpreadsheetCommand(this.model, hideRowAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Unhides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @param rowCount row count
     * @returns WorkSheet Instance
     */
    showRows(rowIndex: number, rowCount: number, sheetId: string): string {
        const showRowAction: ISetRowShowActionData = {
            actionName: ACTION_NAMES.SET_ROW_SHOW_ACTION,
            sheetId,
            rowCount,
            rowIndex,
        };
        const command = new SpreadsheetCommand(this.model, showRowAction);
        this.commandManager.invoke(command);
        return sheetId;
    }
}
