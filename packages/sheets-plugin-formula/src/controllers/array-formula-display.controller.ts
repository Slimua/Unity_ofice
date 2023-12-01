import type { ICommandInfo } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    INTERCEPTOR_POINT,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    SheetInterceptorService,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';

@OnLifecycle(LifecycleStages.Ready, ArrayFormulaDisplayController)
export class ArrayFormulaDisplayController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initInterceptorCellContent();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                // Synchronous data from worker
                if (command.id !== SetArrayFormulaDataMutation.id) {
                    return;
                }

                const params = command.params as ISetArrayFormulaDataMutationParams;

                if (params == null) {
                    return;
                }

                const { arrayFormulaData, arrayFormulaUnitData } = params;
                this._formulaDataModel.setArrayFormulaData(arrayFormulaData);
                this._formulaDataModel.setArrayFormulaUnitData(arrayFormulaUnitData);
            })
        );
    }

    private _initInterceptorCellContent() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                priority: 100,
                handler: (cell, location, next) => {
                    const { workbookId, worksheetId, row, col } = location;
                    const arrayFormulaUnitData = this._formulaDataModel.getArrayFormulaUnitData();
                    const cellData = arrayFormulaUnitData?.[workbookId]?.[worksheetId]?.[row]?.[col];
                    if (cellData == null) {
                        return next();
                    }

                    return { ...cell, ...cellData };
                },
            })
        );
    }
}
