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

import { describe, expect, it, vi } from 'vitest';

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Today } from '..';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../..';

// mock new Date() use V
const _Date = Date;
global.Date = vi.fn((...params) => params.length > 0 ? new _Date(params[0], params[1], params[2]) : new _Date(2020, 0, 1)) as any;

describe('Test today function', () => {
    const textFunction = new Today(FUNCTION_NAMES_DATE.TODAY);

    describe('Today', () => {
        it('Normal', () => {
            const result = textFunction.calculate();
            expect(result.getValue()).toBe(43831);
        });

        it('Set a parameter', () => {
            const result = textFunction.calculate(new NumberValueObject(1));
            expect(result.getValue()).toBe(ErrorType.NA);
        });
    });
});
