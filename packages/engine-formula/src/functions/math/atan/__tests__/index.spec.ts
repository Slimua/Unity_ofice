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
import { Atan } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test atan function', () => {
    const testFunction = new Atan(FUNCTION_NAMES_MATH.ATAN);

    describe('Atan', () => {
        it('Value is normal number', () => {
            const value = NumberValueObject.create(1);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(0.7853981633974483);
        });

        it('Value is number negative', () => {
            const value = NumberValueObject.create(-2);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(-1.1071487177940904);
        });

        it('Value is number string', () => {
            const value = StringValueObject.create('0.5');
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(0.4636476090008061);
        });

        it('Value is normal string', () => {
            const value = StringValueObject.create('test');
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const value = BooleanValueObject.create(false);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(0);
        });
        it('Value is blank cell', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(0);
        });
        it('Value is error', () => {
            const value = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const valueArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(valueArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.7853981633974483, ErrorType.VALUE, 0.8881737743776796, 0.7853981633974483, 0, 0], [0, 1.5607966601082315, 1.16693653188752, ErrorType.VALUE, -1.2490457723982544, ErrorType.NAME]]);
        });
    });
});
