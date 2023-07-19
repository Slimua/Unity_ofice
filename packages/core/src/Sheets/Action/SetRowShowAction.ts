import { SetHideRow, SetShowRow } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandModel } from '../../Command';

/**
 * @internal
 */
export interface ISetRowShowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * @internal
 */
export class SetRowShowAction extends SheetActionBase<ISetRowShowActionData> {
    static NAME = 'SetRowShowAction';

    constructor(actionData: ISetRowShowActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        SetShowRow(this._doActionData.rowIndex, this._doActionData.rowCount, worksheet.getRowManager());

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        SetHideRow(this._oldActionData.rowIndex, this._oldActionData.rowCount, worksheet.getRowManager());

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
