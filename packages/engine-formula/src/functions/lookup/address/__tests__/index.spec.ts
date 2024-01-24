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

import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import {
    BooleanValueObject,
    NumberValueObject,
    StringValueObject,
} from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Address } from '..';

describe('Test address', () => {
    const textFunction = new Address(FUNCTION_NAMES_LOOKUP.ADDRESS);
    const calculate = (row: number, column: number, abs?: number, a1?: boolean, sheet?: string) => {
        const rowNumber = new NumberValueObject(row);
        const columnNumber = new NumberValueObject(column);
        const absNumber = abs ? new NumberValueObject(abs) : undefined;
        const a1Value = a1 !== undefined ? new BooleanValueObject(a1) : undefined;
        const sheetText = sheet ? new StringValueObject(sheet) : undefined;
        const result = textFunction.calculate(rowNumber, columnNumber, absNumber, a1Value, sheetText);
        return result.getValue();
    };

    describe('Correct situations', () => {
        it('Absolute reference', async () => {
            expect(calculate(2, 3)).toBe('$C$2');
        });

        it('Absolute row; relative column', async () => {
            expect(calculate(2, 3, 2)).toBe('C$2');
        });

        it('Relative row; absolute column', async () => {
            expect(calculate(2, 3, 3)).toBe('$C2');
        });

        it('Relative reference', async () => {
            expect(calculate(2, 3, 4)).toBe('C2');
        });

        it('Absolute row; relative column in R1C1 reference style', async () => {
            expect(calculate(2, 3, 2, false)).toBe('R2C[3]');
        });

        it('Absolute reference to another workbook and worksheet', async () => {
            expect(calculate(2, 3, 1, false, '[Book1]Sheet1')).toBe("'[Book1]Sheet1'!R2C3");
        });

        it('Absolute reference to another worksheet', async () => {
            expect(calculate(2, 3, 1, false, 'EXCEL SHEET')).toBe("'EXCEL SHEET'!R2C3");
        });
    });

    describe('Fault situations', () => {
        it('Value error', async () => {
            const error = new ErrorValueObject(ErrorType.VALUE);
            const errorValue = textFunction.calculate(error, error);
            expect(errorValue.isError()).toBeTruthy();
        });
    });
});
