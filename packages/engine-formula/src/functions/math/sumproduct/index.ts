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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sumproduct extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(array1: BaseValueObject, ...variants: BaseValueObject[]) {
        if (array1.isError()) {
            return array1;
        }

        if (!array1.isArray()) {
            array1 = ArrayValueObject.create({
                calculateValueList: [[array1]],
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
        }

        if (variants.length > 0) {
            const rowCount = (array1 as ArrayValueObject).getRowCount();
            const columnCount = (array1 as ArrayValueObject).getColumnCount();

            const resultArray: number[][] = [];

            for (let r = 0; r < rowCount; r++) {
                const row: number[] = [];

                for (let c = 0; c < columnCount; c++) {
                    const array1ValueObject = (array1 as ArrayValueObject).get(r, c) as BaseValueObject;

                    if (array1ValueObject.isError()) {
                        return array1ValueObject;
                    }

                    const array1Value = array1ValueObject.getValue();

                    if (!array1Value || !isRealNum(array1Value)) {
                        row.push(0);
                    } else {
                        row.push(+array1Value);
                    }
                }

                resultArray.push(row);
            }

            for (let i = 0; i < variants.length; i++) {
                if (variants[i].isError()) {
                    return variants[i];
                }

                let variantRowCount = 1;
                let variantColumnCount = 1;

                if (variants[i].isArray()) {
                    variantRowCount = (variants[i] as ArrayValueObject).getRowCount();
                    variantColumnCount = (variants[i] as ArrayValueObject).getColumnCount();
                }

                if (variantRowCount !== rowCount || variantColumnCount !== columnCount) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                for (let r = 0; r < rowCount; r++) {
                    const row: number[] = [];

                    for (let c = 0; c < columnCount; c++) {
                        let variantValueObject = variants[i] as BaseValueObject;

                        if (variants[i].isArray()) {
                            variantValueObject = (variants[i] as ArrayValueObject).get(r, c) as BaseValueObject;
                        }

                        if (variantValueObject.isError()) {
                            return variantValueObject;
                        }

                        const variantValue = variantValueObject.getValue();

                        if (!variantValue || !isRealNum(variantValue)) {
                            row.push(0);
                        } else {
                            row.push(+variantValue * resultArray[r][c]);
                        }
                    }

                    resultArray[r] = row;
                }
            }

            const result = resultArray.reduce((acc, cur) => acc.concat(cur)).reduce((acc, cur) => acc + cur, 0);

            return NumberValueObject.create(result);
        } else {
            return array1.sum();
        }
    }
}
