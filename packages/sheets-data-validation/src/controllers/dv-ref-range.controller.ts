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

import type { IRange, ISheetDataValidationRule } from '@univerjs/core';
import { DataValidationType, Disposable, DisposableCollection, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import type { IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { DataValidationModel, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { removeDataValidationUndoFactory } from '@univerjs/data-validation/commands/commands/data-validation.command.js';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { isRangesEqual } from '../utils/isRangesEqual';
import type { IUpdateDataValidationFormulaSilentMutationParams } from '../commands/mutations/formula.mutation';
import { UpdateDataValidationFormulaSilentMutation } from '../commands/mutations/formula.mutation';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';
import { DataValidationFormulaService } from '../services/dv-formula.service';

@OnLifecycle(LifecycleStages.Rendered, DataValidationRefRangeController)
export class DataValidationRefRangeController extends Disposable {
    private _disposableMap: Map<string, Set<() => void>> = new Map();

    constructor(
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
        @Inject(DataValidationCustomFormulaService) private _dataValidationCustomFormulaService: DataValidationCustomFormulaService,
        @Inject(DataValidationFormulaService) private _dataValidationFormulaService: DataValidationFormulaService,
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService
    ) {
        super();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, ruleId: string) {
        return `${unitID}_${subUnitId}_${ruleId}`;
    }

    registerFormula(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        const id = this._getIdWithUnitId(unitId, subUnitId, ruleId);
        const disposeSet = this._disposableMap.get(id) ?? new Set();
        const handleFormulaChange = (type: 'formula1' | 'formula2', formulaString: string) => {
            const oldRule = this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
            if (!oldRule) {
                return { redos: [], undos: [] };
            }
            const oldFormula = oldRule[type];
            if (!oldFormula || oldFormula === formulaString) {
                return { redos: [], undos: [] };
            }
            const redoParams: IUpdateDataValidationFormulaSilentMutationParams = {
                unitId,
                subUnitId,
                ruleId: rule.uid,
                payload: {
                    type,
                    formulaString,
                },
            };
            const undoParams: IUpdateDataValidationFormulaSilentMutationParams = {
                unitId,
                subUnitId,
                ruleId: rule.uid,
                payload: {
                    type,
                    formulaString: oldFormula,
                },
            };
            const redos = [
                {
                    id: UpdateDataValidationFormulaSilentMutation.id,
                    params: redoParams,
                },
            ];
            const undos = [
                {
                    id: UpdateDataValidationFormulaSilentMutation.id,
                    params: undoParams,
                },
            ];
            return { redos, undos };
        };

        if (rule.type === DataValidationType.CUSTOM) {
            const currentFormula = this._dataValidationCustomFormulaService.getRuleFormulaInfo(unitId, subUnitId, ruleId);
            if (currentFormula) {
                const disposable = this._formulaRefRangeService.registerFormula(
                    currentFormula.formula,
                    (newFormulaString) => handleFormulaChange('formula1', newFormulaString)
                );
                disposeSet.add(() => disposable.dispose());
            }
        }

        if (rule.type !== DataValidationType.CUSTOM) {
            const currentFormula = this._dataValidationFormulaService.getRuleFormulaInfo(unitId, subUnitId, ruleId);
            if (currentFormula) {
                const [formula1, formula2] = currentFormula;
                if (formula1) {
                    const disposable = this._formulaRefRangeService.registerFormula(
                        formula1.text,
                        (newFormulaString) => handleFormulaChange('formula1', newFormulaString)
                    );
                    disposeSet.add(() => disposable.dispose());
                }

                if (formula2) {
                    const disposable = this._formulaRefRangeService.registerFormula(
                        formula2.text,
                        (newFormulaString) => handleFormulaChange('formula1', newFormulaString)
                    );
                    disposeSet.add(() => disposable.dispose());
                }
            }
        }
    }

    register(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const oldRanges = [...rule.ranges];
            const resultRanges = oldRanges.map((range) => {
                return handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo) as IRange;
            }).filter((range) => !!range);
            const isEqual = isRangesEqual(resultRanges, oldRanges);
            if (isEqual) {
                return { redos: [], undos: [] };
            }

            if (resultRanges.length) {
                const redoParams: IUpdateDataValidationMutationParams = {
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                    payload: {
                        type: UpdateRuleType.RANGE,
                        payload: resultRanges,
                    },
                };
                // in ref-range case, there won't be any overlap about rule ranges
                const redos = [{ id: UpdateDataValidationMutation.id, params: redoParams }];
                const undos = [{
                    id: UpdateDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        ruleId: rule.uid,
                        payload: {
                            type: UpdateRuleType.RANGE,
                            payload: oldRanges,
                        },
                    },
                }];
                return { redos, undos };
            } else {
                const redoParams: IRemoveDataValidationMutationParams = { unitId, subUnitId, ruleId: rule.uid };
                const redos = [{ id: RemoveDataValidationMutation.id, params: redoParams }];
                const undos = removeDataValidationUndoFactory(this._injector, redoParams);
                return { redos, undos };
            }
        };
        const disposeList: (() => void)[] = [];
        rule.ranges.forEach((range) => {
            const disposable = this._refRangeService.registerRefRange(range, handleRangeChange);
            disposeList.push(() => disposable.dispose());
        });

        const id = this._getIdWithUnitId(unitId, subUnitId, rule.uid);
        const current = this._disposableMap.get(id) ?? new Set();
        current.add(() => disposeList.forEach((dispose) => dispose()));
        this._disposableMap.set(id, current);
    };

    private _initRefRange() {
        this.disposeWithMe(
            merge(
                this._sheetSkeletonManagerService.currentSkeleton$.pipe(
                    map((skeleton) => skeleton?.sheetId),
                    distinctUntilChanged()
                )
            )
                .pipe(
                    switchMap(
                        () =>
                            new Observable<DisposableCollection>((subscribe) => {
                                const disposableCollection = new DisposableCollection();
                                subscribe.next(disposableCollection);
                                return () => {
                                    disposableCollection.dispose();
                                };
                            })
                    )
                ).subscribe((disposableCollection) => {
                    disposableCollection.add(
                        toDisposable(
                            this._dataValidationModel.ruleChange$.subscribe((option) => {
                                const { unitId, subUnitId, rule } = option;
                                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                                const worksheet = workbook.getActiveSheet();
                                if (option.unitId !== workbook.getUnitId() || option.subUnitId !== worksheet.getSheetId()) {
                                    return;
                                }
                                switch (option.type) {
                                    case 'add': {
                                        this.register(option.unitId, option.subUnitId, option.rule!);
                                        this.registerFormula(option.unitId, option.subUnitId, option.rule!);
                                        break;
                                    }
                                    case 'remove': {
                                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                                        disposeSet && disposeSet.forEach((dispose) => dispose());
                                        break;
                                    }
                                    case 'update': {
                                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                                        disposeSet && disposeSet.forEach((dispose) => dispose());
                                        this.register(option.unitId, option.subUnitId, option.rule!);
                                        this.registerFormula(option.unitId, option.subUnitId, option.rule!);
                                    }
                                }
                            })));
                }));

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.forEach((dispose) => dispose());
            });
            this._disposableMap.clear();
        }));
    }
}
