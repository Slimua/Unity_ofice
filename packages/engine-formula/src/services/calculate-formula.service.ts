import type { IUnitRange } from '@univerjs/core';
import {
    Disposable,
    IConfigService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    requestImmediateMacroTask,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import type {
    IArrayFormulaRangeType,
    IFeatureDirtyRangeType,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../basics/common';
import { ErrorType } from '../basics/error-type';
import { LexerTreeBuilder } from '../engine/analysis/lexer';
import type { LexerNode } from '../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../engine/analysis/parser';
import { ErrorNode } from '../engine/ast-node/base-ast-node';
import { FormulaDependencyGenerator } from '../engine/dependency/formula-dependency';
import { Interpreter } from '../engine/interpreter/interpreter';
import type { FunctionVariantType } from '../engine/reference-object/base-reference-object';
import { IFormulaCurrentConfigService } from './current-data.service';
import type { IAllRuntimeData, IExecutionInProgressParams } from './runtime.service';
import { FormulaExecuteStageType, IFormulaRuntimeService } from './runtime.service';

export const DEFAULT_CYCLE_REFERENCE_COUNT = 1;

export const CYCLE_REFERENCE_COUNT = 'cycleReferenceCount';

export const EVERY_N_FUNCTION_EXECUTION_PAUSE = 100;

@OnLifecycle(LifecycleStages.Rendered, CalculateFormulaService)
export class CalculateFormulaService extends Disposable {
    private readonly _executionStartListener$ = new Subject<boolean>();

    readonly executionStartListener$ = this._executionStartListener$.asObservable();

    private readonly _executionCompleteListener$ = new Subject<IAllRuntimeData>();

    readonly executionCompleteListener$ = this._executionCompleteListener$.asObservable();

    private readonly _executionInProgressListener$ = new Subject<IExecutionInProgressParams>();

    readonly executionInProgressListener$ = this._executionInProgressListener$.asObservable();

    constructor(
        @IConfigService private readonly _configService: IConfigService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @Inject(FormulaDependencyGenerator) private readonly _formulaDependencyGenerator: FormulaDependencyGenerator,
        @Inject(Interpreter) private readonly _interpreter: Interpreter,
        @Inject(AstTreeBuilder) private readonly _astTreeBuilder: AstTreeBuilder
    ) {
        super();
    }

    override dispose(): void {}

    /**
     * Stop the execution of the formula.
     */
    stopFormulaExecution() {
        this._runtimeService.stopExecution();
    }

    /**
     * When the feature is loading,
     * the pre-calculated content needs to be input to the formula engine in advance,
     * so that the formula can read the correct values.
     * @param featureId
     * @param featureData
     */
    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType) {
        this._runtimeService.setRuntimeFeatureCellData(featureId, featureData);
    }

    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType) {
        this._runtimeService.setRuntimeFeatureRange(featureId, featureRange);
    }

    async execute(formulaDatasetConfig: IFormulaDatasetConfig) {
        this._executionStartListener$.next(true);

        this._currentConfigService.load(formulaDatasetConfig);

        this._runtimeService.reset();

        const cycleReferenceCount = (this._configService.getConfig('CYCLE_REFERENCE_COUNT') ||
            DEFAULT_CYCLE_REFERENCE_COUNT) as number;

        for (let i = 0; i < cycleReferenceCount; i++) {
            await this._execute();
            const isCycleDependency = this._runtimeService.isCycleDependency();
            if (!isCycleDependency) {
                break;
            }
        }

        this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CALCULATION_COMPLETED);

        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        this._executionCompleteListener$.next(this._runtimeService.getAllRuntimeData());
    }

    private async _execute() {
        const executeState = await this._apply();

        if (executeState == null) {
            return;
        }

        const { arrayFormulaRange, runtimeFeatureRange } = executeState;

        const { dirtyRanges, excludedCell } = this._getArrayFormulaDirtyRangeAndExcludedRange(
            arrayFormulaRange,
            runtimeFeatureRange
        );

        if (dirtyRanges == null || dirtyRanges.length === 0) {
            return true;
        }

        this._currentConfigService.loadDirtyRangesAndExcludedCell(dirtyRanges, excludedCell);

        await this._apply(true);

        return true;
    }

    private _getArrayFormulaDirtyRangeAndExcludedRange(
        arrayFormulaRange: IArrayFormulaRangeType,
        runtimeFeatureRange: { [featureId: string]: IFeatureDirtyRangeType }
    ) {
        const dirtyRanges: IUnitRange[] = [];
        const excludedCell: IUnitExcludedCell = {};
        Object.keys(arrayFormulaRange).forEach((unitId) => {
            const sheetArrayFormulaRange = arrayFormulaRange[unitId];
            Object.keys(sheetArrayFormulaRange).forEach((sheetId) => {
                const cellValue = new ObjectMatrix(sheetArrayFormulaRange[sheetId]);

                if (cellValue == null) {
                    return true;
                }

                const newCellData = new ObjectMatrix<boolean>();

                cellValue.forValue((row, column, range) => {
                    newCellData.setValue(row, column, true);

                    dirtyRanges.push({ unitId, sheetId, range });
                });

                if (excludedCell[unitId] == null) {
                    excludedCell[unitId] = {};
                }

                excludedCell[unitId][sheetId] = newCellData;
            });
        });

        Object.keys(runtimeFeatureRange).forEach((featureId) => {
            const arrayRange = runtimeFeatureRange[featureId];
            Object.keys(arrayRange).forEach((unitId) => {
                const sheetArrayFormulaRange = arrayRange[unitId];
                Object.keys(sheetArrayFormulaRange).forEach((sheetId) => {
                    const ranges = sheetArrayFormulaRange[sheetId];

                    if (ranges == null) {
                        return true;
                    }

                    for (const range of ranges) {
                        dirtyRanges.push({ unitId, sheetId, range });
                    }
                });
            });
        });

        return { dirtyRanges, excludedCell };
    }

    private async _apply(isArrayFormulaState = false) {
        if (isArrayFormulaState) {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA);
        } else {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY);
        }

        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        const treeList = await this._formulaDependencyGenerator.generate();

        const interpreter = this._interpreter;

        if (isArrayFormulaState) {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_CALCULATION_ARRAY_FORMULA);

            this._runtimeService.setTotalArrayFormulasToCalculate(treeList.length);
        } else {
            this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_CALCULATION);

            this._runtimeService.setTotalFormulasToCalculate(treeList.length);
        }

        this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());

        for (let i = 0, len = treeList.length; i < len; i++) {
            /**
             * For every functions, execute a setTimeout to wait for external command input.
             */
            await new Promise((resolve) => {
                requestImmediateMacroTask(resolve);
            });

            if (this._runtimeService.isStopExecution()) {
                this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.IDLE);
                this._runtimeService.markedAsStopFunctionsExecuted();
                this._executionCompleteListener$.next(this._runtimeService.getAllRuntimeData());
                return;
            }

            const tree = treeList[i];
            const astNode = tree.node;
            const getDirtyData = tree.getDirtyData;
            let value: FunctionVariantType;

            if (astNode == null && getDirtyData == null) {
                throw new Error('AstNode or executor is null');
            }

            this._runtimeService.setCurrent(tree.row, tree.column, tree.subComponentId, tree.unitId);

            if (getDirtyData != null && tree.featureId != null) {
                /**
                 * Execute the dependencies registered by the feature,
                 * and return the dirty area marked by the feature,
                 * so as to allow the formulas depending on the dirty area to continue the calculation.
                 */
                const { runtimeCellData, dirtyRanges } = getDirtyData(tree);

                this._runtimeService.setRuntimeFeatureCellData(tree.featureId, runtimeCellData);

                this._runtimeService.setRuntimeFeatureRange(tree.featureId, dirtyRanges);
            } else if (astNode != null) {
                if (interpreter.checkAsyncNode(astNode)) {
                    value = await interpreter.executeAsync(astNode);
                } else {
                    value = interpreter.execute(astNode);
                }

                if (tree.formulaId != null) {
                    this._runtimeService.setRuntimeOtherData(tree.formulaId, value);
                } else {
                    this._runtimeService.setRuntimeData(value);
                }
            }

            if (isArrayFormulaState) {
                this._runtimeService.setFormulaExecuteStage(
                    FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA
                );

                this._runtimeService.setCompletedArrayFormulasCount(i + 1);
            } else {
                this._runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CURRENTLY_CALCULATING);

                this._runtimeService.setCompletedFormulasCount(i + 1);
            }

            this._executionInProgressListener$.next(this._runtimeService.getRuntimeState());
        }

        if (treeList.length > 0) {
            this._runtimeService.markedAsSuccessfullyExecuted();
        } else if (!isArrayFormulaState) {
            this._runtimeService.markedAsNoFunctionsExecuted();
        }

        return this._runtimeService.getAllRuntimeData();
    }

    calculate(formulaString: string, transformSuffix: boolean = true) {
        // TODO how to observe @alex
        // this.getObserver('onBeforeFormulaCalculateObservable')?.notifyObservers(formulaString);
        const lexerNode = this._lexerTreeBuilder.treeBuilder(formulaString, transformSuffix);

        if (Object.values(ErrorType).includes(lexerNode as ErrorType)) {
            return ErrorNode.create(lexerNode as ErrorType);
        }

        // this.lexerTreeBuilder.suffixExpressionHandler(lexerNode); // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

        // console.log('sequence', this.lexerTreeBuilder.sequenceNodesBuilder(formulaString));

        // this.getObserver('onAfterFormulaLexerObservable')?.notifyObservers(lexerNode);

        // const astTreeBuilder = new AstTreeBuilder();

        const astNode = this._astTreeBuilder.parse(lexerNode as LexerNode);

        console.log('astNode', astNode?.serialize());

        // const interpreter = Interpreter.create();

        // if (astNode == null) {
        //     return;
        // }

        // if (interpreter.checkAsyncNode(astNode)) {
        //     const resultPromise = interpreter.executeAsync(astNode);

        //     resultPromise.then((value) => {
        //         console.log('formulaResult', value);
        //     });
        // } else {
        //     console.log(interpreter.execute(astNode));
        // }
    }
}
