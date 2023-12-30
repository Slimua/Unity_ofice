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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Vlookup extends BaseFunction {
    override calculate(
        lookupValue: BaseValueObject,
        tableArray: BaseValueObject,
        colIndexNum: BaseValueObject,
        rangeLookup?: BaseValueObject
    ) {
        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (tableArray.isError()) {
            return new ErrorValueObject(ErrorType.REF);
        }

        if (!tableArray.isArray()) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        if (colIndexNum.isError()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (rangeLookup?.isError()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const rangeLookupValue = this.getZeroOrOneByOneDefault(rangeLookup);

        if (rangeLookupValue == null) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        const colIndexNumValue = this.getIndexNumValue(colIndexNum);

        if (colIndexNumValue instanceof ErrorValueObject) {
            return colIndexNumValue;
        }

        const searchArray = (tableArray as ArrayValueObject).slice(undefined, [0, 1]);

        const resultArray = (tableArray as ArrayValueObject).slice(undefined, [colIndexNumValue - 1, colIndexNumValue]);

        if (searchArray == null || resultArray == null) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        if (lookupValue.isArray()) {
            return lookupValue.map((value) => {
                return this._handleSingleObject(value, searchArray, resultArray, rangeLookupValue);
            });
        }

        return this._handleSingleObject(lookupValue, searchArray, resultArray, rangeLookupValue);
    }

    private _handleSingleObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        rangeLookupValue: number
    ) {
        if (rangeLookupValue === 0) {
            const resultValue = resultArray.pick(searchArray.isEqual(value) as ArrayValueObject).getFirstCell();
            if (resultValue.isNull()) {
                return new ErrorValueObject(ErrorType.NA);
            }

            return resultValue;
        }

        const row = searchArray.binarySearch(value);

        if (row == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const resultValue = resultArray.get(row, 0);

        if (resultValue.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return resultValue;
    }
}
