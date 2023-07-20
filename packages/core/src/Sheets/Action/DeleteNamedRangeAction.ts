import { SheetActionBase, ActionObservers, ActionType, CommandModel } from '../../Command';
import { AddNamedRangeApply, DeleteNamedRangeApply } from '../Apply';
import { INamedRange } from '../../Types/Interfaces';
import { IAddNamedRangeActionData, IDeleteNamedRangeActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';

export class DeleteNamedRangeAction extends SheetActionBase<IDeleteNamedRangeActionData, IAddNamedRangeActionData, INamedRange> {
    constructor(actionData: IDeleteNamedRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            // actionName: AddNamedRangeAction.NAME,
            sheetId: actionData.sheetId,
            namedRange: this.do(),
        };
        this.validate();
    }

    do(): INamedRange {
        const result = DeleteNamedRangeApply(this._commandModel, this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            // actionName: AddNamedRangeAction.NAME,
            namedRange: this.do(),
        };
    }

    undo(): void {
        AddNamedRangeApply(this._commandModel, this._oldActionData);
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
