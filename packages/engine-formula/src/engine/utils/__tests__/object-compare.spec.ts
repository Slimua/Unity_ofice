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

import { ArrayValueObject, transformToValue } from '../../value-object/array-value-object';
import { StringValueObject } from '../../value-object/primitive-object';
import { valueObjectCompare } from '../object-compare';

const range = new ArrayValueObject(/*ts*/ `{
    Ada;
    test1;
    test12;
    Univer
}`);

describe('Test object compare', () => {
    describe('Test valueObjectCompare', () => {
        it('range and criteria', () => {
            const rangeNumber = new ArrayValueObject(/*ts*/ `{
                1;
                4;
                44;
                444
            }`);

            const criteria = new StringValueObject('>40');

            const resultObjectValue = transformToValue(valueObjectCompare(rangeNumber, criteria).getArrayValue());
            expect(resultObjectValue).toStrictEqual([[false], [false], [true], [true]]);
        });

        it('range with wildcard asterisk', () => {
            const criteriaList = [
                'test*',
                '=test*',
                '>test*',
                '>=test*',
                '<test*',
                '<=test*',
                'test?',
                '=test??',
                '>test?',
                '>=test??',
                '<test?',
                '<=test??',
            ];

            const result = [
                [[false], [true], [true], [false]],
                [[false], [true], [true], [false]],
                [[false], [true], [true], [true]],
                [[false], [true], [true], [true]],
                [[true], [false], [false], [false]],
                [[true], [false], [false], [false]],
                [[false], [true], [false], [false]],
                [[false], [false], [true], [false]],
                [[false], [true], [true], [true]],
                [[false], [true], [true], [true]],
                [[true], [false], [false], [false]],
                [[true], [false], [false], [false]],
            ];

            criteriaList.forEach((criteriaValue, i) => {
                const criteria = new StringValueObject(criteriaValue);

                const value = transformToValue(valueObjectCompare(range, criteria).getArrayValue());
                expect(value).toStrictEqual(result[i]);
            });
        });
    });
});
