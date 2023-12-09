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

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { ITextSelectionStyle, TextRange } from '@univerjs/engine-render';

export interface ISetTextSelectionsOperationParams {
    unitId: string;
    subUnitId: string;
    segmentId: string;
    style: ITextSelectionStyle;
    ranges: TextRange[];
}

export const SetTextSelectionsOperation: IOperation<ISetTextSelectionsOperationParams> = {
    id: 'doc.operation.set-selections',

    type: CommandType.OPERATION,

    handler: (accessor, prams) => {
        // for live share only.
        return true;
    },
};
