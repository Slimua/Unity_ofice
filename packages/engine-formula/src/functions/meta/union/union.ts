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

import { ErrorType } from '../../../basics/error-type';
import { compareToken } from '../../../basics/token';
import { ErrorValueObject } from '../../../engine/other-object/error-value-object';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { BaseFunction } from '../../base-function';

export class Union extends BaseFunction {
    private _compareType: compareToken = compareToken.EQUALS;

    setCompareType(token: compareToken) {
        this._compareType = token;
    }

    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!variant1.isReferenceObject() || !variant2.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        variant1 = variant1 as BaseReferenceObject;

        variant2 = variant2 as BaseReferenceObject;

        if (variant1.isCell() && variant2.isCell()) {
            return variant1.unionBy(variant2);
        }
        if (variant1.isRow() && variant2.isRow()) {
            return variant1.unionBy(variant2);
        }
        if (variant1.isColumn() && variant2.isColumn()) {
            return variant1.unionBy(variant2);
        }

        return ErrorValueObject.create(ErrorType.REF);
    }
}
