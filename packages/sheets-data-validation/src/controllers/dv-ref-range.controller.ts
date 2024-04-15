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
import { DataValidationType, Disposable, DisposableCollection, ICommandService, isRangesEqual, IUniverInstanceService, LifecycleStages, OnLifecycle, Range, Rectangle, toDisposable } from '@univerjs/core';
import type { EffectRefRangeParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { handleCommonDefaultRangeChangeWithEffectRefCommands, handleDefaultRangeChangeWithEffectRefCommands, RefRangeService, SetRangeValuesMutation } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import type { IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { DataValidationModel, RemoveDataValidationMutation, removeDataValidationUndoFactory, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { deserializeRangeWithSheet, isReferenceStringWithEffectiveColumn, serializeRangeWithSpreadsheet } from '@univerjs/engine-formula';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { DataValidationCacheService } from '../services/dv-cache.service';

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
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService
    ) {
        super();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, ruleId: string) {
        return `${unitID}_${subUnitId}_${ruleId}`;
    }

    registerRule = (unitId: string, subUnitId: string, rule: ISheetDataValidationRule) => {
        this.register(unitId, subUnitId, rule);
        this.registerFormula(unitId, subUnitId, rule);
        this.registerRange(unitId, subUnitId, rule);
    };

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
            const redoParams: IUpdateDataValidationMutationParams = {
                unitId,
                subUnitId,
                ruleId: rule.uid,
                payload: {
                    type: UpdateRuleType.SETTING,
                    payload: {
                        type: oldRule.type,
                        formula1: oldRule.formula1,
                        formula2: oldRule.formula2,
                        [type]: formulaString,
                    },
                },
            };
            const undoParams: IUpdateDataValidationMutationParams = {
                unitId,
                subUnitId,
                ruleId: rule.uid,
                payload: {
                    type: UpdateRuleType.SETTING,
                    payload: {
                        type: oldRule.type,
                        formula1: oldRule.formula1,
                        formula2: oldRule.formula2,
                        [type]: formulaString,
                    },
                },
            };
            const redos = [
                {
                    id: UpdateDataValidationMutation.id,
                    params: redoParams,
                },
            ];
            const undos = [
                {
                    id: UpdateDataValidationMutation.id,
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
            const resultRangesOrigin = oldRanges.map((range) => {
                return handleCommonDefaultRangeChangeWithEffectRefCommands(range, commandInfo) as IRange | IRange[];
            }).filter((range) => !!range);

            const resultRanges = resultRangesOrigin.flat();

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
            const disposable = this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId);
            disposeList.push(() => disposable.dispose());
        });
        const id = this._getIdWithUnitId(unitId, subUnitId, rule.uid);
        const current = this._disposableMap.get(id) ?? new Set();
        current.add(() => disposeList.forEach((dispose) => dispose()));
        this._disposableMap.set(id, current);
    };

    registerRange(propUnitId: string, propSubUnitId: string, rule: ISheetDataValidationRule) {
        const { uid: ruleId, formula1, type } = rule;
        if ((type !== DataValidationType.LIST && type !== DataValidationType.LIST_MULTIPLE)) {
            return;
        }

        if (!isReferenceStringWithEffectiveColumn(formula1 ?? '')) {
            return;
        }
        const gridRange = deserializeRangeWithSheet(formula1 ?? '');
        const id = this._getIdWithUnitId(propUnitId, propSubUnitId, ruleId);
        const rangeUnitId = gridRange.unitId || propUnitId;
        const workbook = this._univerInstanceService.getUniverSheetInstance(rangeUnitId) ?? this._univerInstanceService.getCurrentUniverSheetInstance()!;
        const sheetId = workbook.getSheetBySheetName(gridRange.sheetName)?.getSheetId() ?? propSubUnitId;
        const worksheet = workbook.getSheetBySheetId(sheetId) ?? workbook.getActiveSheet();
        const disposableCollection = new DisposableCollection();
        const range = gridRange.range;

        const finalUnitId = workbook.getUnitId();
        const finalSubUnitId = worksheet.getSheetId();

        disposableCollection.add(
            this._refRangeService.registerRefRange(
                range,
                (info) => {
                    let newRange = handleDefaultRangeChangeWithEffectRefCommands(range, info);
                    if (!newRange) {
                        newRange = {
                            startColumn: -1,
                            endColumn: -1,
                            startRow: -1,
                            endRow: -1,
                        };
                    }

                    if (Rectangle.equals(newRange, range)) {
                        return {
                            redos: [],
                            undos: [],
                        };
                    }

                    const newRangeStr = serializeRangeWithSpreadsheet(finalUnitId, finalSubUnitId, newRange);
                    const oldRule = this._dataValidationModel.getRuleById(propUnitId, propSubUnitId, ruleId);
                    if (!oldRule) {
                        return {
                            redos: [],
                            undos: [],
                        };
                    }
                    const redoParams: IUpdateDataValidationMutationParams = {
                        unitId: propUnitId,
                        subUnitId: propSubUnitId,
                        ruleId,
                        payload: {
                            type: UpdateRuleType.SETTING,
                            payload: {
                                formula1: newRangeStr,
                                formula2: oldRule.formula2,
                                type: oldRule.type,
                            },
                        },
                    };
                    const undoParams: IUpdateDataValidationMutationParams = {
                        unitId: propUnitId,
                        subUnitId: propSubUnitId,
                        ruleId,
                        payload: {
                            type: UpdateRuleType.SETTING,
                            payload: {
                                formula1: oldRule.formula1,
                                formula2: oldRule.formula2,
                                type: oldRule.type,
                            },
                        },
                    };

                    return {
                        redos: [{
                            id: UpdateDataValidationMutation.id,
                            params: redoParams,
                        }],
                        undos: [{
                            id: UpdateDataValidationMutation.id,
                            params: undoParams,
                        }],
                    };
                },
                finalUnitId,
                finalUnitId
            )
        );

        disposableCollection.add(this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetRangeValuesMutation.id && commandInfo.params) {
                    const params = commandInfo.params as ISetRangeValuesMutationParams;
                    const {
                        cellValue,
                        unitId,
                        subUnitId,
                    } = params;

                    if (unitId === finalUnitId && subUnitId === finalSubUnitId) {
                        if (cellValue) {
                            let marked = false;

                            Range.foreach(range, (row, col) => {
                                const rowValue = cellValue[row];
                                if (rowValue && (col in rowValue)) {
                                    if (marked) {
                                        return;
                                    }
                                    marked = true;
                                    this._dataValidationCacheService.markRangeDirty(unitId, subUnitId, rule.ranges);
                                }
                            });
                        } else {
                            this._dataValidationCacheService.markRangeDirty(unitId, subUnitId, rule.ranges);
                        }
                    }
                }
            })
        ));

        const current = this._disposableMap.get(id) ?? new Set();
        current.add(() => disposableCollection.dispose());
        this._disposableMap.set(id, current);
    }

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
                                switch (option.type) {
                                    case 'add': {
                                        const rule = option.rule!;
                                        this.registerRule(option.unitId, option.subUnitId, rule);
                                        break;
                                    }
                                    case 'remove': {
                                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                                        disposeSet && disposeSet.forEach((dispose) => dispose());
                                        break;
                                    }
                                    case 'update': {
                                        const rule = option.rule!;
                                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                                        disposeSet && disposeSet.forEach((dispose) => dispose());
                                        this.registerRule(option.unitId, option.subUnitId, rule);
                                        break;
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
