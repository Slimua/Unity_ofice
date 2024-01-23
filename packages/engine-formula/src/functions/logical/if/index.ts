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

import type { ArrayValueObject } from '../../..';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class If extends BaseFunction {
    override calculate(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject = new BooleanValueObject(false)) {
        if (logicalTest.isError() || valueIfTrue.isError()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        // get single value object
        logicalTest = this._getSingleValueObject(logicalTest);

        if (!logicalTest.isArray()) {
            return logicalTest.getValue() ? valueIfTrue : valueIfFalse;
        }

        // get max row length
        const maxRowLength = Math.max(
            logicalTest.isArray() ? (logicalTest as ArrayValueObject).getRowCount() : 1,
            valueIfTrue.isArray() ? (valueIfTrue as ArrayValueObject).getRowCount() : 1,
            valueIfFalse.isArray() ? (valueIfFalse as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            logicalTest.isArray() ? (logicalTest as ArrayValueObject).getColumnCount() : 1,
            valueIfTrue.isArray() ? (valueIfTrue as ArrayValueObject).getColumnCount() : 1,
            valueIfFalse.isArray() ? (valueIfFalse as ArrayValueObject).getColumnCount() : 1
        );

        const logicalTestArray = expandArrayValueObject(maxRowLength, maxColumnLength, logicalTest);
        const valueIfTrueArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfTrue, new ErrorValueObject(ErrorType.NA));
        const valueIfFalseArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfFalse, new ErrorValueObject(ErrorType.NA));

        logicalTestArray.iterator((logicalTestValue, rowIndex, columnIndex) => {
            if (logicalTestValue?.isNull()) {
                logicalTestArray.set(rowIndex, columnIndex, new ErrorValueObject(ErrorType.NA));
            } else if (logicalTestValue) {
                const valueIfTrueValue = valueIfTrueArray.get(rowIndex, columnIndex);
                const valueIfFalseValue = valueIfFalseArray.get(rowIndex, columnIndex);

                logicalTestArray.set(rowIndex, columnIndex, this._calculateSingleCell(logicalTestValue, valueIfTrueValue, valueIfFalseValue));
            }
        });

        return logicalTestArray;
    }

    private _getSingleValueObject(valueObject: BaseValueObject) {
        if (valueObject.isArray() && (valueObject as ArrayValueObject).getRowCount() === 1 && (valueObject as ArrayValueObject).getColumnCount() === 1) {
            return (valueObject as ArrayValueObject).getFirstCell();
        }
        return valueObject;
    }

    private _calculateSingleCell(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject) {
        if (logicalTest.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const logicalTestValue = logicalTest.getValue();

        // true or non-zero
        if (logicalTestValue) {
            if (valueIfTrue.isNull()) {
                return new ErrorValueObject(ErrorType.NA);
            }

            return valueIfTrue;
        }

        if (valueIfFalse.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return valueIfFalse;
    }
}
