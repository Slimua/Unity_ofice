import { Workbook, Worksheet } from '../Sheets/Domain';
import { ActionBase, IActionData, ActionObservers, CommandModel } from './index';

/**
 * Format of action data param
 */
export interface ISheetActionData extends IActionData {
    sheetId: string;
    rangeRef?: string;
}

/**
 * Basics class for action
 *
 * TODO: SlideAction/DocAction
 * @beta
 */
export abstract class SheetActionBase<D extends ISheetActionData, O extends ISheetActionData = D, R = void> extends ActionBase<D, O, R> {
    protected _commandModel: CommandModel;

    protected _workbook: Workbook;

    protected constructor(actionData: D, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, observers);
        if (commandModel.WorkBookUnit == null) {
            throw new Error('action workbook domain can not be null!');
        }
        this._commandModel = commandModel;
        this._workbook = commandModel.WorkBookUnit;
    }

    getWorkSheet(): Worksheet {
        const { _workbook, _doActionData } = this;
        const { sheetId } = _doActionData;
        return _workbook.getSheetBySheetId(sheetId) as Worksheet;
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }
}
