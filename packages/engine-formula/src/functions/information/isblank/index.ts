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
import { BooleanValueObject } from '../../..';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Isblank extends BaseFunction {
    override calculate(value: BaseValueObject) {
        if (value.isNull()) {
            return new BooleanValueObject(true);
        } else if (value.isArray()) {
            return (value as ArrayValueObject).map((valueObject) => {
                if (valueObject.isNull()) {
                    return new BooleanValueObject(true);
                }

                return new BooleanValueObject(false);
            });
        }

        return new BooleanValueObject(false);
    }
}
