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
import { Asinh } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test asinh function', () => {
    const textFunction = new Asinh(FUNCTION_NAMES_MATH.ASINH);

    describe('Asinh', () => {
        it('Value is normal', () => {
            const value = NumberValueObject.create(1);
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.881373587019543);
        });

        it('Value is string number', () => {
            const value = new StringValueObject('1');
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.881373587019543);
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
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.881373587019543, '#VALUE!', 1.099668652491162, 0.881373587019543, '#VALUE!'],
                ['#VALUE!', 5.298342365610588, 1.5374753309166493, '#VALUE!', -1.818446459232066]]);
        });
    });
});
