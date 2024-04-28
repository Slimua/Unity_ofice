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

import { DataValidationOperator, DataValidationType, type IDataValidationRuleBase, type IDataValidationRuleOptions, Tools } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

export function getRuleSetting(rule: IDataValidationRuleBase): IDataValidationRuleBase {
    return {
        type: rule.type,
        operator: rule.operator,
        formula1: rule.formula1,
        formula2: rule.formula2,
        allowBlank: rule.allowBlank,
    };
}

export function getRuleOptions(rule: IDataValidationRuleOptions): IDataValidationRuleOptions {
    return {
        error: rule.error,
        errorStyle: rule.errorStyle,
        errorTitle: rule.errorTitle,
        imeMode: rule.imeMode,
        prompt: rule.prompt,
        promptTitle: rule.promptTitle,
        showDropDown: rule.showDropDown,
        showErrorMessage: rule.showErrorMessage,
        showInputMessage: rule.showInputMessage,
        renderMode: rule.renderMode,
    };
}

export function createDefaultNewRule(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SelectionManagerService);
    const currentRanges = selectionManagerService.getSelectionRanges();
    const uid = Tools.generateRandomId(6);
    const rule = {
        uid,
        type: DataValidationType.DECIMAL,
        operator: DataValidationOperator.EQUAL,
        formula1: '100',
        ranges: currentRanges ?? [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }],
    };

    return rule;
}
