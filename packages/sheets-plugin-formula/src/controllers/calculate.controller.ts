import { FormulaEngineService } from '@univerjs/base-formula-engine';
import {
    AddWorksheetMergeMutation,
    DeleteRangeMutation,
    InsertRangeMutation,
    ISetRangeValuesMutationParams,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetMutation,
    SetRangeValuesMutation,
    SetWorksheetNameMutation,
} from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IConfigService,
    IUnitRange,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

@OnLifecycle(LifecycleStages.Starting, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @IConfigService private readonly _configService: IConfigService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initialExecuteCompleteFormula();
    }

    private _commandExecutedListener() {
        const updateCommandList = [
            // ClearSelectionAllCommand.id,
            // ClearSelectionContentCommand.id,
            // SetRangeValuesCommand.id,
            SetRangeValuesMutation.id,
            MoveRangeMutation.id,
            MoveRowsMutation.id,
            MoveColsMutation.id,
            DeleteRangeMutation.id,
            InsertRangeMutation.id,
            RemoveRowMutation.id,
            RemoveColMutation.id,
            RemoveSheetMutation.id,
            SetWorksheetNameMutation.id,
            AddWorksheetMergeMutation.id,
        ];

        this.disposeWithMe(
            // TODO@Dushusir: use SheetInterceptorService?
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                let dirtyRanges: IUnitRange[] = [];
                if (command.id === SetRangeValuesMutation.id) {
                    dirtyRanges = this._getSetRangeValuesMutationDirtyRange(
                        command.params as ISetRangeValuesMutationParams
                    );
                }

                this._calculate(dirtyRanges);
            })
        );
    }

    private _getSetRangeValuesMutationDirtyRange(params: ISetRangeValuesMutationParams) {
        const { worksheetId: sheetId, workbookId: unitId, cellValue } = params;

        const dirtyRanges: IUnitRange[] = [];

        if (cellValue == null) {
            return dirtyRanges;
        }

        const discreteRanges = new ObjectMatrix(cellValue).getDiscreteRanges();

        discreteRanges.forEach((range) => {
            dirtyRanges.push({ unitId, sheetId, range });
        });

        this._formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);

        return dirtyRanges;
    }

    private _calculate(dirtyRanges: IUnitRange[]) {
        if (dirtyRanges.length === 0) return;

        const formulaData = this._formulaDataModel.getFormulaData();

        this._formulaEngineService.execute({
            formulaData,
            forceCalculate: false,
            dirtyRanges,
        });
    }

    private _initialExecuteCompleteFormula() {
        this._formulaEngineService.executionCompleteListener$.subscribe((data) => {
            const { unitData, unitArrayFormulaData } = data;

            if (!unitData) {
                console.error('No sheetData from Formula Engine!');
                return;
            }

            if (unitArrayFormulaData) {
                // TODO@Dushusir: refresh array formula view
                this._formulaDataModel.setArrayFormulaData(unitArrayFormulaData);
            }

            const unitIds = Object.keys(unitData);

            // Update each calculated value, possibly involving all cells
            const redoMutationsInfo: ICommandInfo[] = [];

            unitIds.forEach((unitId) => {
                const sheetData = unitData[unitId];

                const sheetIds = Object.keys(sheetData);

                sheetIds.forEach((sheetId) => {
                    const cellData = sheetData[sheetId];
                    const setRangeValuesMutation: ISetRangeValuesMutationParams = {
                        worksheetId: sheetId,
                        workbookId: unitId,
                        cellValue: cellData.getData(),
                        isFormulaUpdate: true,
                    };

                    redoMutationsInfo.push({
                        id: SetRangeValuesMutation.id,
                        params: setRangeValuesMutation,
                    });
                });
            });

            const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
            return result;
        });
    }
}
