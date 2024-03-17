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

import { DataValidationType, isFormulaString, IUniverInstanceService, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, ICellCustomRender, ICellData, IDataValidationRule, IDataValidationRuleBase, Nullable } from '@univerjs/core';
import type { IFormulaResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { LIST_FORMULA_INPUT_NAME } from '../views/formula-input';
import { LIST_DROPDOWN_KEY } from '../views';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { DropdownWidget } from '../widgets/dropdown-widget';
import { DropdownMultipleWidget } from '../widgets/dropdown-multiple-widget';

export const LIST_MULTIPLE_FORMULA = 'TRUE';

export const getListFormulaResult = (result: Nullable<Nullable<ICellData>[][]>) => {
    const valueSet = new Set<string>();

    result?.forEach((sub) => {
        sub.forEach((cell) => {
            if (cell?.v) {
                valueSet.add(`${cell.v}`);
            }
        });
    });

    return Array.from(valueSet.values());
};

// TODO: cache
export class ListMultipleValidator extends BaseDataValidator {
    id: string = DataValidationType.LIST_MULTIPLE;
    title: string = 'dataValidation.listMultiple.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];
    formulaInput: string = LIST_FORMULA_INPUT_NAME;

    override canvasRender: Nullable<ICellCustomRender> = this.injector.createInstance(DropdownMultipleWidget);

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override dropdown: string | undefined = LIST_DROPDOWN_KEY;

    override skipDefaultFontRender: boolean = true;

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        return !Tools.isBlank(rule.formula1);
    }

    // TODO cache
    parseCellValue(cellValue: CellValue, rule: IDataValidationRule) {
        const cellString = cellValue.toString();
        if (!cellString) {
            return [];
        }
        return cellString.split(',');
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<string[] | undefined>> {
        const { formula1 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return {
            formula1: isFormulaString(formula1) ? getListFormulaResult(results?.[0]?.result) : formula1?.split(','),
            formula2: undefined,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<Nullable<CellValue>>, formula: IFormulaResult<any>, rule: IDataValidationRule): Promise<boolean> {
        const { value } = cellInfo;
        const { formula1 } = formula;
        const selected = this.parseCellValue(value!, rule);
        return selected.every((i) => formula1.includes(i));
    }

    override generateRuleName() {
        return this.localeService.t('dataValidation.list.name');
    }

    override generateRuleErrorMessage(): string {
        return this.localeService.t('dataValidation.list.error');
    }

    getList(rule: IDataValidationRule, propUnitId?: string, propSubUnitId?: string) {
        const { formula1 } = rule;
        const univerInstanceService = this.injector.get(IUniverInstanceService);
        const unitId = propUnitId ?? univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const subUnitId = propSubUnitId ?? univerInstanceService.getUniverSheetInstance(unitId)!.getActiveSheet().getSheetId();
        const results = this._formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        return isFormulaString(formula1) ? getListFormulaResult(results?.[0]?.result) : formula1?.split(',').map((i) => decodeURIComponent(i));
    }
}
