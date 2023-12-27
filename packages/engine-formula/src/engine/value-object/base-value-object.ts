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

import { ConcatenateType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { ObjectClassType } from '../../basics/object-class-type';
import { compareToken } from '../../basics/token';
import type { StringValueObject } from './primitive-object';

export type callbackMapFnType = (currentValue: BaseValueObject, row: number, column: number) => BaseValueObject;

export type callbackProductFnType = (currentValue: BaseValueObject, operationValue: BaseValueObject) => BaseValueObject;
export interface IArrayValueObject {
    calculateValueList: BaseValueObject[][];
    rowCount: number;
    columnCount: number;
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
}
export class BaseValueObject extends ObjectClassType {
    constructor(private _rawValue: string | number | boolean) {
        super();
    }

    override isValueObject() {
        return true;
    }

    getValue(): string | number | boolean {
        /** abstract */
        return 0;
    }

    getArrayValue(): BaseValueObject[][] {
        /** abstract */
        return [];
    }

    setValue(value: string | number | boolean) {
        /** abstract */
    }

    setArrayValue(value: BaseValueObject[][]) {
        /** abstract */
    }

    isArray() {
        return false;
    }

    isString() {
        return false;
    }

    isNumber() {
        return false;
    }

    isBoolean() {
        return false;
    }

    isLambda() {
        return false;
    }

    override isError() {
        return false;
    }

    isNull() {
        return false;
    }

    getNegative(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.NAME);
    }

    getReciprocal(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.NAME);
    }

    plus(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    minus(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    multiply(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    divided(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    map(callbackFn: callbackMapFnType): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    product(valueObject: BaseValueObject, callbackFn: callbackProductFnType): BaseValueObject {
        return callbackFn(this, valueObject);
    }

    compare(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    wildcard(valueObject: StringValueObject, operator: compareToken): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    isEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.EQUALS);
    }

    isNotEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.NOT_EQUAL);
    }

    isGreaterThanOrEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN_OR_EQUAL);
    }

    isLessThanOrEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.LESS_THAN_OR_EQUAL);
    }

    isLessThan(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.LESS_THAN);
    }

    isGreaterThan(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN);
    }

    concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    plusBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    minusBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    multiplyBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    dividedBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    compareBy(value: string | number | boolean, operator: compareToken): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    concatenate(value: string | number | boolean, concatenateType = ConcatenateType.FRONT): string {
        let currentValue = this.getValue().toString();
        if (typeof value === 'string') {
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = value + currentValue;
            } else {
                currentValue += value;
            }
        } else if (typeof value === 'number') {
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = value.toString() + currentValue;
            } else {
                currentValue += value.toString();
            }
        } else if (typeof value === 'boolean') {
            const booleanString = value ? 'TRUE' : 'FALSE';
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = booleanString + currentValue;
            } else {
                currentValue += booleanString;
            }
        }

        return currentValue;
    }

    pow(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    powInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    sqrt(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    cbrt(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    cos(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    acos(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    acosh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    sin(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    asin(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    asinh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    tan(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    tanh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atan(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atan2(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atan2Inverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atanh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    /**
     * Calculate the mean of the entire array.
     *
     * reference https://numpy.org/doc/stable/reference/generated/numpy.mean.html#numpy.mean
     *
     */
    mean(): BaseValueObject {
        /** abstract */
        return this;
    }

    /**
     * Calculate the median of the entire array.
     *
     * https://numpy.org/doc/stable/reference/generated/numpy.median.html
     *
     */
    median(): BaseValueObject {
        /** abstract */
        return this;
    }

    /**
     * Calculate the variance of the entire array.
     *
     * https://numpy.org/doc/stable/reference/generated/numpy.var.html
     */
    var(): BaseValueObject {
        /** abstract */
        return this;
    }

    /**
     * Calculate the standard deviation of the entire array.
     *
     * https://numpy.org/doc/stable/reference/generated/numpy.std.html
     */
    std(): BaseValueObject {
        /** abstract */
        return this;
    }

    log(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    log10(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    exp(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    abs(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    round(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    roundInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    floor(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    floorInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    ceil(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    ceilInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

export class ErrorValueObject extends BaseValueObject {
    constructor(
        private _errorType: ErrorType,
        private _errorContent: string = ''
    ) {
        super(_errorType);
    }

    static create(errorType: ErrorType, errorContent?: string) {
        const errorValueObject = new ErrorValueObject(errorType, errorContent);
        return errorValueObject;
    }

    getErrorType() {
        return this._errorType;
    }

    getErrorContent() {
        return this._errorContent;
    }

    override isEqualType(object: ObjectClassType) {
        if ((object as ErrorValueObject).getErrorType() === this.getErrorType()) {
            return true;
        }
        return false;
    }

    override isError() {
        return true;
    }
}
