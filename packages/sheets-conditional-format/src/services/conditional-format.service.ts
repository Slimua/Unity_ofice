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

import { CellValueType, Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, Range, Tools } from '@univerjs/core';
import { INumfmtService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import dayjs from 'dayjs';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import { ConditionalFormatViewModel } from '../models/conditional-format-view-model';
import { NumberOperator, RuleType, SubRuleType, TextOperator, TimePeriodOperator } from '../base/const';
import type { IConditionFormatRule, IHighlightCell, INumberHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell } from '../models/type';

function isFloatsEqual(a: number, b: number) {
    return Math.abs(a - b) < Number.EPSILON;
}
@OnLifecycle(LifecycleStages.Rendered, ConditionalFormatService)
export class ConditionalFormatService extends Disposable {
    constructor(@Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService
    ) {
        super();
    }

    handleHighlightCell(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        const ruleConfig = rule.rule as IHighlightCell;
        const getCache = (rule: IHighlightCell) => {
            switch (rule.subType) {
                case SubRuleType.average:{
                    return { average: 'average' };
                }
                case SubRuleType.duplicateValues:{
                    return { duplicateValues: 'duplicateValues' };
                }
                case SubRuleType.rank:{
                    return { rank: 'rank' };
                }
                case SubRuleType.uniqueValues:{
                    return { uniqueValues: 'uniqueValues' };
                }
            }
            return null;
        };
        const cache = getCache(ruleConfig);
        const check = (row: number, col: number) => {
            const isNull = (v: any) => [undefined, null].includes(v);
            const cellValue = worksheet?.getCellRaw(row, col);
            const value = cellValue?.v;

            switch (ruleConfig.subType) {
                case SubRuleType.number:{
                    if (isNull(value) || cellValue?.t !== CellValueType.NUMBER) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as INumberHighlightCell;
                    const v = (cellValue?.v || 0) as number;

                    switch (subRuleConfig.operator) {
                        case NumberOperator.between:{
                            const [start, end] = subRuleConfig.value;
                            return v >= start && v < end;
                        }
                        case NumberOperator.notBetween:{
                            const [start, end] = subRuleConfig.value;
                            return !(v >= start && v < end);
                        }
                        case NumberOperator.equal:{
                            const condition = subRuleConfig.value;
                            return isFloatsEqual(condition, v);
                        }
                        case NumberOperator.notEqual:{
                            const condition = subRuleConfig.value;
                            return !isFloatsEqual(condition, v);
                        }
                        case NumberOperator.greaterThan:{
                            const condition = subRuleConfig.value;
                            return v > condition;
                        }
                        case NumberOperator.greaterThanOrEqual:{
                            const condition = subRuleConfig.value;
                            return v >= condition;
                        }
                        case NumberOperator.lessThan:{
                            const condition = subRuleConfig.value;
                            return v < condition;
                        }
                        case NumberOperator.lessThanOrEqual:{
                            const condition = subRuleConfig.value;
                            return v <= condition;
                        }
                        default:{
                            return false;
                        }
                    }
                }
                case SubRuleType.text:{
                    const subRuleConfig = ruleConfig as ITextHighlightCell;
                    const v = (cellValue?.v || 0) as string;
                    const condition = subRuleConfig.value;
                    switch (subRuleConfig.operator) {
                        case TextOperator.beginsWith:{
                            return v.startsWith(condition);
                        }
                        case TextOperator.containsBlanks:{
                            return /\s/.test(v);
                        }
                        case TextOperator.notContainsBlanks:{
                            return !/\s/.test(v);
                        }
                        case TextOperator.containsErrors:{
                            // wait do do.
                            return false;
                        }
                        case TextOperator.notContainsErrors:{
                            return false;
                        }
                        case TextOperator.containsText:{
                            return v.indexOf(condition) > -1;
                        }
                        case TextOperator.notContainsText:{
                            return v.indexOf(condition) === -1;
                        }
                        case TextOperator.endWith:{
                            return v.endsWith(condition);
                        }
                        case TextOperator.equal:{
                            return v === condition;
                        }
                        case TextOperator.notEqual:{
                            return v !== condition;
                        }
                        default:{
                            return false;
                        }
                    }
                }
                case SubRuleType.timePeriod:{
                    if (isNull(value) || cellValue?.t !== CellValueType.NUMBER) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as ITimePeriodHighlightCell;
                    const v = this._numfmtService.serialTimeToTimestamp(Number(value));
                    switch (subRuleConfig.operator) {
                        case TimePeriodOperator.last7Days:{
                            const start = dayjs().subtract(7, 'day').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.lastMonth:{
                            const start = dayjs().subtract(1, 'month').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.lastWeek:{
                            const start = dayjs().subtract(1, 'week').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.nextMonth:{
                            const start = dayjs().valueOf();
                            const end = dayjs().add(1, 'month').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.nextWeek:{
                            const start = dayjs().valueOf();
                            const end = dayjs().add(1, 'week').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.thisMonth:{
                            const start = dayjs().startOf('month').valueOf();
                            const end = dayjs().endOf('month').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.thisWeek:{
                            const start = dayjs().startOf('week').valueOf();
                            const end = dayjs().endOf('week').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.tomorrow:{
                            const start = dayjs().startOf('day').add(1, 'day').valueOf();
                            const end = dayjs().endOf('day').add(1, 'day').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.yesterday:{
                            const start = dayjs().startOf('day').subtract(1, 'day').valueOf();
                            const end = dayjs().endOf('day').subtract(1, 'day').valueOf();
                            return v >= start && v <= end;
                        }
                        default:{
                            return false;
                        }
                    }
                }
                // case SubRuleType.average:{
                //     if (isNull(value)) {
                //         return false;
                //     }
                //     const subRuleConfig = ruleConfig as IAverageHighlightCell;
                //     switch (subRuleConfig.operator) {
                //         case NumberOperator.greaterThan:{}
                //         case NumberOperator.greaterThanOrEqual:{}
                //         case NumberOperator.lessThan:{}
                //         case NumberOperator.lessThanOrEqual:{}
                //         case NumberOperator.equal:{}
                //         case NumberOperator.notEqual:{}
                //     }
                // }
                // case SubRuleType.rank:{
                //     if (isNull(value)) {
                //         return false;
                //     }
                // }

                // case SubRuleType.uniqueValues:{

                // }
                // case SubRuleType.duplicateValues:{

                // }
            }
            return false;
        };
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (check(row, col)) {
                    this._conditionalFormatViewModel.setCellCfRuleCache(unitId, subUnitId, row, col, rule.cfId, ruleConfig.style);
                }
            });
        });
    }

    composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cell = this._conditionalFormatViewModel.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            const ruleList = cell.cfList.map((item) => this._conditionalFormatRuleModel.getRule(unitId, subUnitId, item.cfId)!).filter((rule) => !!rule);
            const endIndex = ruleList.findIndex((rule) => rule?.stopIfTrue);
            if (endIndex > -1) {
                ruleList.splice(endIndex + 1);
            }
            const result = ruleList.reduce((pre, rule) => {
                const type = rule.rule.type;
                const ruleCacheItem = cell.cfList.find((cache) => cache.cfId === rule.cfId);
                if (type === RuleType.highlightCell) {
                    if (!ruleCacheItem?.ruleCache) {
                        this.handleHighlightCell(unitId, subUnitId, rule);
                    }
                    if (ruleCacheItem!.ruleCache) {
                        Tools.deepMerge(pre, { style: ruleCacheItem!.ruleCache });
                    }
                } else if (type === RuleType.colorScale) {
                    if (!ruleCacheItem?.ruleCache) {
                        this.handleHighlightCell(unitId, subUnitId, rule);
                    }
                    if (ruleCacheItem!.ruleCache) {
                        pre.colorScale = ruleCacheItem!.ruleCache;
                    }
                } else if (type === RuleType.dataBar) {
                    if (!ruleCacheItem?.ruleCache) {
                        this.handleHighlightCell(unitId, subUnitId, rule);
                    }
                    if (ruleCacheItem!.ruleCache) {
                        pre.dataBar = ruleCacheItem!.ruleCache;
                    }
                }
                return pre;
            }, {} as { style?: IHighlightCell['style'] } & { dataBar?: any;colorScale?: any });
            this._conditionalFormatViewModel.setCellComposeCache(unitId, subUnitId, row, col, result);
            return result;
        }
        return null;
    }
}
