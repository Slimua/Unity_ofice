/**
 * Copyright 2023 DreamNum Inc.
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

import type { ICellDataForSheetInterceptor, ICommandInfo } from '@univerjs/core';
import { createInterceptorKey } from '@univerjs/core';

import type { ISheetLocation } from './utils/interceptor';

const CELL_CONTENT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('CELL_CONTENT');
const PERMISSION = createInterceptorKey<boolean, ICommandInfo>('PERMISSION');

export const INTERCEPTOR_POINT = {
    CELL_CONTENT,
    PERMISSION,
};
