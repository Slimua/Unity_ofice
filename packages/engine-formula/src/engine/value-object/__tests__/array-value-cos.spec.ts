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

import { ArrayValueObject, transformToValueObject } from '../array-value-object';

describe('arrayValueObject cos method test', () => {
    describe('cos', () => {
        it('origin nm, param nm', () => {
            const tanArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [8, 1, ' ', 1.23, true, false],
                    [27, 0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((tanArrayValueObject.cos() as ArrayValueObject).toValue()).toStrictEqual([
                [-0.14550003380861354, 0.5403023058681398, '#VALUE!', 0.3342377271245026, 0.5403023058681398, 1],
                [-0.2921388087338362, 1, 0.8623188722876839, -0.695563326462902, '#VALUE!', -0.9899924966004454],
            ]);
        });
    });
});
