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

import { describe, expect, it } from 'vitest';

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Cot } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test cot function', () => {
    const textFunction = new Cot(FUNCTION_NAMES_MATH.COT);

    describe('Cot', () => {
        it('Value is normal', () => {
            const value = NumberValueObject.create(1);
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.6420926159343308);
        });

        it('Value is string number', () => {
            const value = new StringValueObject('1');
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.6420926159343308);
        });

        it('Value is array', () => {
            const valueArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(valueArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.6420926159343308, '#VALUE!', 0.8107809840477268, 0.6420926159343308, 0],
                [Infinity, 0.009999666686665238, 0.40385979490737667, '#VALUE!', -0.3217505543966422]]);
        });
    });
});
