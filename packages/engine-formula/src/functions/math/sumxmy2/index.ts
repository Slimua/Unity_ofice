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

import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sumxmy2 extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(arrayX: BaseValueObject, arrayY: BaseValueObject) {
        if (arrayX.isError()) {
            return arrayX;
        }

        if (arrayY.isError()) {
            return arrayY;
        }

        let arrayXRowCount = 1;
        let arrayXColumnCount = 1;

        if (arrayX.isArray()) {
            arrayXRowCount = (arrayX as ArrayValueObject).getRowCount();
            arrayXColumnCount = (arrayX as ArrayValueObject).getColumnCount();
        }

        const arrayXCount = arrayXRowCount * arrayXColumnCount;

        let arrayYRowCount = 1;
        let arrayYColumnCount = 1;

        if (arrayY.isArray()) {
            arrayYRowCount = (arrayY as ArrayValueObject).getRowCount();
            arrayYColumnCount = (arrayY as ArrayValueObject).getColumnCount();
        }

        const arrayYCount = arrayYRowCount * arrayYColumnCount;

        if (arrayXCount !== arrayYCount) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (arrayXCount === 1) {
            if (arrayX.isArray()) {
                arrayX = (arrayX as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            if (arrayY.isArray()) {
                arrayY = (arrayY as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            if (arrayX.isError()) {
                return arrayX;
            }

            if (arrayY.isError()) {
                return arrayY;
            }

            if (arrayX.isNull() || arrayY.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const arrayXValue = +arrayX.getValue();
            const arrayYValue = +arrayY.getValue();

            if ((arrayX.isString() && !isRealNum(arrayXValue)) || arrayX.isBoolean() || (arrayY.isString() && !isRealNum(arrayYValue)) || arrayY.isBoolean()) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = (arrayXValue - arrayYValue) ** 2;

            return NumberValueObject.create(result);
        } else {
            const arrayXFlatten = (arrayX as ArrayValueObject).flatten();
            const arrayYFlatten = (arrayY as ArrayValueObject).flatten();

            let errorObject: BaseValueObject = NullValueObject.create();
            const arrayXValidValue: number[] = [];
            const arrayYValidValue: number[] = [];
            let result: number = 0;

            arrayXFlatten.iterator((arrayXObject, rowIndex, columnIndex) => {
                const arrayYObject = arrayYFlatten.get(rowIndex, columnIndex);

                if (arrayXObject == null || arrayXObject.isString() || arrayXObject.isBoolean() || arrayXObject.isNull()) {
                    return true; // continue
                }

                if (arrayXObject?.isError()) {
                    errorObject = arrayXObject;
                    return false; // break;
                }

                if (arrayYObject == null || arrayYObject.isString() || arrayYObject.isBoolean() || arrayYObject.isNull()) {
                    return true; // continue
                }

                if (arrayYObject?.isError()) {
                    errorObject = arrayYObject;
                    return false; // break;
                }

                const arrayXValue = +arrayXObject.getValue();
                const arrayYValue = +arrayYObject.getValue();

                arrayXValidValue.push(arrayXValue);
                arrayYValidValue.push(arrayYValue);

                result += (arrayXValue - arrayYValue) ** 2;
            });

            if (errorObject.isError()) {
                return errorObject;
            }

            if (arrayXValidValue.length === 0 || arrayYValidValue.length === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            return NumberValueObject.create(result);
        }
    }
}
