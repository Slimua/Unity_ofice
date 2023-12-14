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
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Divided extends BaseFunction {
    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isError() || variant2.isError()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (variant1.isReferenceObject()) {
            variant1 = (variant1 as BaseReferenceObject).toArrayValueObject();
        }

        if (variant2.isReferenceObject()) {
            variant2 = (variant2 as BaseReferenceObject).toArrayValueObject();
        }

        if (!(variant2 as BaseValueObject).isArray() && (variant2 as BaseValueObject).getValue() === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return (variant1 as BaseValueObject).divided(variant2 as BaseValueObject);
    }
}
