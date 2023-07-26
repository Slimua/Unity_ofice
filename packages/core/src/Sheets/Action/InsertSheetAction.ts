import { InsertSheetApply } from '../Apply/InsertSheet';
import { RemoveSheetApply } from '../Apply/RemoveSheet';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IInsertSheetActionData, IRemoveSheetActionData } from '../../Types/Interfaces/IActionModel';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

export class InsertSheetAction extends SheetActionBase<IInsertSheetActionData, IRemoveSheetActionData> {
    constructor(actionData: IInsertSheetActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            sheetId: this.do(),
        };
    }

    do(): string {
        const result = InsertSheetApply(this.getSpreadsheetModel(), this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        this.redo();
    }

    undo(): void {
        RemoveSheetApply(this.getSpreadsheetModel(), this._oldActionData);
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}
