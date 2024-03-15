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

import { DEFFAULT_DATE_FORMAT, excelDateSerial } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Today extends BaseFunction {
    override calculate(value?: BaseValueObject) {
        if (value) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const currentSerial = excelDateSerial(new Date());
        const valueObject = NumberValueObject.create(currentSerial);
        valueObject.setPattern(DEFFAULT_DATE_FORMAT);
        return valueObject;
    }
}
