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

import { DataValidationRenderMode, DataValidationType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { deserializeRangeWithSheet, isReferenceString } from '@univerjs/engine-formula';
import { LIST_FORMULA_INPUT_NAME } from '../views/formula-input';
import { LIST_DROPDOWN_KEY } from '../views';
import { DropdownWidget } from '../widgets/dropdown-widget';
import { ListRenderModeInput } from '../views/render-mode';
import { deserializeListOptions, getSheetRangeValueSet } from './util';

export class ListValidator extends BaseDataValidator {
    id: string = DataValidationType.LIST;
    title: string = 'dataValidation.list.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];
    formulaInput: string = LIST_FORMULA_INPUT_NAME;

    private _univerInstanceService = this.injector.get(IUniverInstanceService);

    override canvasRender = this.injector.createInstance(DropdownWidget);

    override dropdown: string | undefined = LIST_DROPDOWN_KEY;

    override optionsInput: string | undefined = ListRenderModeInput.componentKey;

    override skipDefaultFontRender(rule: ISheetDataValidationRule) {
        return rule.renderMode !== DataValidationRenderMode.TEXT;
    }

    override validatorFormula(rule: IDataValidationRuleBase): IFormulaValidResult {
        const success = !Tools.isBlank(rule.formula1);

        return {
            success,
            formula1: success ? undefined : this.localeService.t('dataValidation.validFail.list'),
        };
    }

    private _parseCellValue(cellValue: CellValue, rule: IDataValidationRule) {
        const cellString = cellValue.toString();
        return deserializeListOptions(cellString);
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<string[] | undefined>> {
        const { formula1 = '' } = rule;

        return {
            formula1: isReferenceString(formula1) ? getSheetRangeValueSet(deserializeRangeWithSheet(formula1), this._univerInstanceService, unitId, subUnitId) : deserializeListOptions(formula1),
            formula2: undefined,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<Nullable<CellValue>>, formula: IFormulaResult<any>, rule: IDataValidationRule): Promise<boolean> {
        const { value } = cellInfo;
        const { formula1 } = formula;
        const selected = this._parseCellValue(value!, rule);
        return selected.every((i) => formula1.includes(i));
    }

    override generateRuleName() {
        return this.localeService.t('dataValidation.list.name');
    }

    override generateRuleErrorMessage(): string {
        return this.localeService.t('dataValidation.list.error');
    }

    getList(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const { formula1 = '' } = rule;
        const univerInstanceService = this.injector.get(IUniverInstanceService);
        const workbook = (currentUnitId ? univerInstanceService.getUniverSheetInstance(currentUnitId) : undefined) ?? univerInstanceService.getCurrentUniverSheetInstance()!;
        const worksheet = (currentSubUnitId ? workbook.getSheetBySheetId(currentSubUnitId) : undefined) ?? workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        return isReferenceString(formula1) ? getSheetRangeValueSet(deserializeRangeWithSheet(formula1), this._univerInstanceService, unitId, subUnitId) : deserializeListOptions(formula1);
    }

    getListWithColor(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const list = this.getList(rule, currentUnitId, currentSubUnitId);
        const colorList = (rule.formula2 || '').split(',');

        return list.map((label, i) => ({ label, color: colorList[i] }));
    }

    getListWithColorMap(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const list = this.getListWithColor(rule, currentUnitId, currentSubUnitId);
        const map: Record<string, string> = {};

        list.forEach((item) => {
            if (item.color) {
                map[item.label] = item.color;
            }
        });
        return map;
    }
}
