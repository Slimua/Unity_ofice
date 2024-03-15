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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Isna extends BaseFunction {
    override calculate(value: BaseValueObject) {
        if (value == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (value.getValue() === ErrorType.NA) {
            return BooleanValueObject.create(true);
        } else if (value.isArray()) {
            return (value as ArrayValueObject).mapValue((valueObject) => {
                if (valueObject.getValue() === ErrorType.NA) {
                    return BooleanValueObject.create(true);
                }

                return BooleanValueObject.create(false);
            });
        }

        return BooleanValueObject.create(false);
    }
}
