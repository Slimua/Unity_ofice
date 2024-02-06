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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Edate } from '..';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test edate function', () => {
    const textFunction = new Edate(FUNCTION_NAMES_DATE.EDATE);

    describe('Edate', () => {
        it('All value is normal', () => {
            const startDate = new NumberValueObject(43831);
            const months = new NumberValueObject(1);
            const result = textFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43862]]);
        });

        it('Start date is array', () => {
            const startDate = new ArrayValueObject({
                calculateValueList: transformToValueObject([[43832], [43833]]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const months = new NumberValueObject(1);
            const result = textFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43863], [43864]]);
        });

        it('Months is array', () => {
            const startDate = new NumberValueObject(43831);
            const months = new ArrayValueObject({
                calculateValueList: transformToValueObject([[1], [2]]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43862], [43891]]);
        });
    });
});
